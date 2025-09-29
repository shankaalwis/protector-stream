import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface AnomalyData {
  id: string;
  timestamp: string;
  client_id: string;
  packet_count: number;
  anomaly_score: number;
  is_anomaly: boolean;
  created_at: string;
}

interface ChartDataPoint {
  time: string;
  packet_count: number;
  is_anomaly: boolean;
  timestamp: string;
  client_id?: string;
}

const ANOMALY_THRESHOLD = 50;

const AnomalyChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [anomalyStatus, setAnomalyStatus] = useState({
    totalAlerts: 0,
    latestClient: '',
    lastAnomalyScore: 0,
    currentThreatLevel: 'Normal'
  });

  // Initialize chart with empty data
  useEffect(() => {
    // Initialize with 60 empty data points (5 minutes of 5-second intervals)
    const initialData: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5000);
      initialData.push({
        time: time.toLocaleTimeString(),
        packet_count: 0,
        is_anomaly: false,
        timestamp: time.toISOString(),
        client_id: undefined
      });
    }
    
    setChartData(initialData);
  }, []);

  // Set up real-time subscription to anomaly_alerts table
  useEffect(() => {
    console.log('Setting up real-time subscription to anomaly_alerts...');
    
    const channel = supabase
      .channel('anomaly-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anomaly_alerts'
        },
        (payload) => {
          console.log('New anomaly alert received:', payload);
          const newAlert = payload.new as AnomalyData;
          
          // Update chart data - keep last 60 data points
          setChartData(prevData => {
            const alertTime = new Date(newAlert.timestamp);
            const newDataPoint: ChartDataPoint = {
              time: alertTime.toLocaleTimeString(),
              packet_count: newAlert.packet_count,
              is_anomaly: newAlert.is_anomaly,
              timestamp: newAlert.timestamp,
              client_id: newAlert.client_id
            };
            
            const updatedData = [...prevData.slice(1), newDataPoint];
            return updatedData;
          });
          
          // Update anomaly status
          setAnomalyStatus(prev => ({
            totalAlerts: prev.totalAlerts + (newAlert.is_anomaly ? 1 : 0),
            latestClient: newAlert.client_id,
            lastAnomalyScore: newAlert.anomaly_score,
            currentThreatLevel: newAlert.is_anomaly ? 'High' : 'Normal'
          }));
        }
      )
      .subscribe();

    // Load initial data
    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('anomaly_alerts')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(60);

        if (error) {
          console.error('Error loading initial anomaly data:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} initial anomaly records`);
          
          // Process the data in chronological order (oldest first)
          const sortedData = data.reverse();
          const chartPoints: ChartDataPoint[] = sortedData.map(alert => ({
            time: new Date(alert.timestamp).toLocaleTimeString(),
            packet_count: alert.packet_count,
            is_anomaly: alert.is_anomaly,
            timestamp: alert.timestamp,
            client_id: alert.client_id
          }));

          // If we have less than 60 points, pad with empty data
          const paddingNeeded = 60 - chartPoints.length;
          const paddedData: ChartDataPoint[] = [];
          
          if (paddingNeeded > 0) {
            const oldestTime = new Date(sortedData[0].timestamp);
            for (let i = paddingNeeded; i > 0; i--) {
              const time = new Date(oldestTime.getTime() - i * 5000);
              paddedData.push({
                time: time.toLocaleTimeString(),
                packet_count: 0,
                is_anomaly: false,
                timestamp: time.toISOString(),
                client_id: undefined
              });
            }
          }

          setChartData([...paddedData, ...chartPoints]);

          // Update status with latest data
          const latestAlert = data[0];
          const anomalyCount = data.filter(alert => alert.is_anomaly).length;
          
          setAnomalyStatus({
            totalAlerts: anomalyCount,
            latestClient: latestAlert.client_id,
            lastAnomalyScore: latestAlert.anomaly_score,
            currentThreatLevel: latestAlert.is_anomaly ? 'High' : 'Normal'
          });
        }
      } catch (error) {
        console.error('Error in loadInitialData:', error);
      }
    };

    loadInitialData();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'packet_count') {
      const payload = props?.payload;
      const isAnomaly = payload?.is_anomaly;
      const clientId = payload?.client_id;
      
      if (isAnomaly && clientId) {
        return [`${value} packets (Anomaly - Client: ${clientId})`, 'Packet Count'];
      }
      return [`${value} packets`, 'Packet Count'];
    }
    return [value, name];
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Real-Time Network Anomaly Detection</CardTitle>
            <CardDescription>
              Live monitoring of packet counts with ML-based anomaly detection (Last 5 minutes)
            </CardDescription>
          </div>
          <Badge className={getThreatLevelColor(anomalyStatus.currentThreatLevel)}>
            {anomalyStatus.currentThreatLevel} Threat Level
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{anomalyStatus.totalAlerts}</div>
            <div className="text-sm text-muted-foreground">Total Anomalies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{ANOMALY_THRESHOLD}</div>
            <div className="text-sm text-muted-foreground">Threshold</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-primary truncate">{anomalyStatus.latestClient || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Latest Client</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-primary">
              {anomalyStatus.lastAnomalyScore ? anomalyStatus.lastAnomalyScore.toFixed(4) : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Latest Score</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Packet Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelStyle={{ color: '#000' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <ReferenceLine 
                y={ANOMALY_THRESHOLD} 
                stroke="hsl(var(--alert-red))" 
                strokeDasharray="5 5"
                label="Anomaly Threshold"
              />
              <Line 
                type="monotone" 
                dataKey="packet_count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={(props) => {
                  const { payload, cx, cy } = props;
                  return payload?.is_anomaly ? (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={4} 
                      fill="hsl(var(--alert-red))" 
                      stroke="hsl(var(--alert-red-dark))" 
                      strokeWidth={2}
                    />
                  ) : (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={2} 
                      fill="hsl(var(--primary))" 
                    />
                  );
                }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>Normal Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--alert-red))]"></div>
              <span>Anomaly Detected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[hsl(var(--alert-red))] opacity-70" style={{ borderTop: '2px dashed' }}></div>
              <span>Anomaly Threshold ({ANOMALY_THRESHOLD})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyChart;
