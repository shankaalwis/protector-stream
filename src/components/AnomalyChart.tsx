import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  timeIndex: number;
}

const ANOMALY_THRESHOLD = 50;
const CHART_WINDOW_MINUTES = 30; // Show 30 minutes of data
const DATA_INTERVAL_SECONDS = 5; // 5-second intervals
const TOTAL_DATA_POINTS = (CHART_WINDOW_MINUTES * 60) / DATA_INTERVAL_SECONDS; // 360 points (30 min * 60 sec / 5 sec)
const VISIBLE_DATA_POINTS = 72; // Show 6 minutes worth of data at once (72 points)

const AnomalyChart: React.FC = () => {
  const [allChartData, setAllChartData] = useState<ChartDataPoint[]>([]);
  const [viewStartIndex, setViewStartIndex] = useState(0);
  const [isAtLatest, setIsAtLatest] = useState(true);
  const [anomalyStatus, setAnomalyStatus] = useState({
    totalAlerts: 0,
    latestClient: '',
    lastAnomalyScore: 0,
    currentThreatLevel: 'Normal'
  });

  // Initialize chart with empty data
  useEffect(() => {
    // Initialize with 360 empty data points (30 minutes of 5-second intervals)
    const initialData: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 0; i < TOTAL_DATA_POINTS; i++) {
      const time = new Date(now.getTime() - (TOTAL_DATA_POINTS - 1 - i) * DATA_INTERVAL_SECONDS * 1000);
      initialData.push({
        time: time.toLocaleTimeString(),
        packet_count: 0,
        is_anomaly: false,
        timestamp: time.toISOString(),
        client_id: undefined,
        timeIndex: i
      });
    }
    
    setAllChartData(initialData);
    setViewStartIndex(Math.max(0, TOTAL_DATA_POINTS - VISIBLE_DATA_POINTS));
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
          
          // Update chart data - keep last 360 data points (30 minutes)
          setAllChartData(prevData => {
            const alertTime = new Date(newAlert.timestamp);
            const newDataPoint: ChartDataPoint = {
              time: alertTime.toLocaleTimeString(),
              packet_count: newAlert.packet_count,
              is_anomaly: newAlert.is_anomaly,
              timestamp: newAlert.timestamp,
              client_id: newAlert.client_id,
              timeIndex: prevData.length > 0 ? prevData[prevData.length - 1].timeIndex + 1 : 0
            };
            
            const updatedData = [...prevData.slice(1), newDataPoint];
            
            // Update time indices to keep them sequential
            const recalculatedData = updatedData.map((point, index) => ({
              ...point,
              timeIndex: index
            }));
            
            // If we're at the latest view, move the window to show the new data
            if (isAtLatest) {
              setViewStartIndex(Math.max(0, recalculatedData.length - VISIBLE_DATA_POINTS));
            }
            
            return recalculatedData;
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
          .gte('timestamp', new Date(Date.now() - CHART_WINDOW_MINUTES * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(TOTAL_DATA_POINTS);

        if (error) {
          console.error('Error loading initial anomaly data:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} initial anomaly records`);
          
          // Process the data in chronological order (oldest first)
          const sortedData = data.reverse();
          const chartPoints: ChartDataPoint[] = sortedData.map((alert, index) => ({
            time: new Date(alert.timestamp).toLocaleTimeString(),
            packet_count: alert.packet_count,
            is_anomaly: alert.is_anomaly,
            timestamp: alert.timestamp,
            client_id: alert.client_id,
            timeIndex: index
          }));

          // If we have less than 360 points, pad with empty data
          const paddingNeeded = TOTAL_DATA_POINTS - chartPoints.length;
          const paddedData: ChartDataPoint[] = [];
          
          if (paddingNeeded > 0) {
            const oldestTime = new Date(sortedData[0].timestamp);
            for (let i = paddingNeeded; i > 0; i--) {
              const time = new Date(oldestTime.getTime() - i * DATA_INTERVAL_SECONDS * 1000);
              paddedData.push({
                time: time.toLocaleTimeString(),
                packet_count: 0,
                is_anomaly: false,
                timestamp: time.toISOString(),
                client_id: undefined,
                timeIndex: paddingNeeded - i
              });
            }
          }

          const finalData = [...paddedData, ...chartPoints].map((point, index) => ({
            ...point,
            timeIndex: index
          }));
          
          setAllChartData(finalData);
          setViewStartIndex(Math.max(0, TOTAL_DATA_POINTS - VISIBLE_DATA_POINTS));

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

    // Set up interval to update time labels every minute
    const intervalId = setInterval(() => {
      setAllChartData(prevData => {
        return prevData.map(point => ({
          ...point,
          time: new Date(point.timestamp).toLocaleTimeString()
        }));
      });
    }, 60000); // Update every minute

    // Cleanup subscription and interval on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  // Get visible chart data based on current view
  const visibleChartData = allChartData.slice(viewStartIndex, viewStartIndex + VISIBLE_DATA_POINTS);

  const handleScrollLeft = () => {
    const newIndex = Math.max(0, viewStartIndex - 12); // Move back 1 minute
    setViewStartIndex(newIndex);
    setIsAtLatest(newIndex >= allChartData.length - VISIBLE_DATA_POINTS);
  };

  const handleScrollRight = () => {
    const maxIndex = Math.max(0, allChartData.length - VISIBLE_DATA_POINTS);
    const newIndex = Math.min(maxIndex, viewStartIndex + 12); // Move forward 1 minute
    setViewStartIndex(newIndex);
    setIsAtLatest(newIndex >= maxIndex);
  };

  const handleGoToLatest = () => {
    const latestIndex = Math.max(0, allChartData.length - VISIBLE_DATA_POINTS);
    setViewStartIndex(latestIndex);
    setIsAtLatest(true);
  };

  const canScrollLeft = viewStartIndex > 0;
  const canScrollRight = viewStartIndex < allChartData.length - VISIBLE_DATA_POINTS;

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'packet_count') {
      const payload = props?.payload;
      const isAnomaly = payload?.is_anomaly;
      const clientId = payload?.client_id;
      const timestamp = payload?.timestamp;
      const time = payload?.time;
      
      const timeInfo = time || (timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A');
      const clientInfo = clientId || 'Unknown';
      const statusInfo = isAnomaly ? 'ANOMALY DETECTED' : 'Normal Traffic';
      
      return [
        `${value} packets`,
        `Time: ${timeInfo}`,
        `Client: ${clientInfo}`,
        `Status: ${statusInfo}`
      ];
    }
    return [value, name];
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">
            {data.is_anomaly ? '🚨 Anomaly Detected' : '📊 Normal Traffic'}
          </p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Time:</span> {data.time}</p>
            <p><span className="font-medium">Packets:</span> {data.packet_count}</p>
            <p><span className="font-medium">Client:</span> {data.client_id || 'Unknown'}</p>
            {data.is_anomaly && (
              <p className="text-red-500 font-medium">⚠️ Anomaly Alert</p>
            )}
          </div>
        </div>
      );
    }
    return null;
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
              Live monitoring of packet counts with ML-based anomaly detection (Last 30 minutes, showing 6-minute window)
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
        {/* Scroll Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
              Earlier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
            >
              Later
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {!isAtLatest && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToLatest}
              >
                Go to Latest
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Viewing: {visibleChartData.length > 0 ? visibleChartData[0].time : 'N/A'} - {visibleChartData.length > 0 ? visibleChartData[visibleChartData.length - 1].time : 'N/A'}
            </span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="timeIndex" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => {
                  const point = visibleChartData[value - (visibleChartData[0]?.timeIndex || 0)];
                  return point ? point.time : '';
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Packet Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={customTooltip}
                labelStyle={{ color: '#000' }}
                contentStyle={{ 
                  backgroundColor: 'transparent',
                  border: 'none',
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
