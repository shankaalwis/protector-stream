import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Shield, TrendingUp, ArrowLeft, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetric {
  id: string;
  metric_key: string;
  metric_value: any;
  updated_at: string;
}

interface TimeSeriesData {
  time: string;
  throughput: number;
}

export default function SiemDashboard() {
  const [throughputData, setThroughputData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    try {
      console.log('Fetching dashboard metrics...');
      
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_key', 'Dashboard Data: Message Throughput (New)')
        .maybeSingle();

      if (error) {
        console.error('Error fetching metrics:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard metrics",
          variant: "destructive",
        });
        return;
      }

      if (data && data.metric_value) {
        console.log('Raw metric data:', data.metric_value);
        
        // Transform the data for the chart
        const chartData = Array.isArray(data.metric_value) 
          ? data.metric_value.map((item: any) => ({
              time: format(new Date(item.time_epoch), 'HH:mm'),
              throughput: item.throughput
            }))
          : [];

        console.log('Transformed chart data:', chartData);
        setThroughputData(chartData);
      }
    } catch (error) {
      console.error('Error in fetchMetrics:', error);
      toast({
        title: "Error",
        description: "Failed to process metrics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_metrics',
          filter: 'metric_key=eq.Dashboard Data: Message Throughput (New)'
        },
        (payload) => {
          console.log('Real-time metric update:', payload);
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">🛡️ SIEM Dashboard: Threat Monitor</h1>
              <p className="text-muted-foreground mt-2">Real-time security intelligence and event monitoring</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Throughput Chart */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Message Throughput (Last 60 Minutes)</CardTitle>
              </div>
              <CardDescription>Real-time message flow analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading metrics...</p>
                </div>
              ) : throughputData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No data available yet. Waiting for Splunk metrics...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={throughputData}>
                    <defs>
                      <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#throughputGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Placeholder: Top Attacking IPs */}
          <Card className="bg-card/50 backdrop-blur border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <CardTitle>Top Attacking IPs</CardTitle>
              </div>
              <CardDescription>Most frequent threat sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder: Anomaly Trend Chart */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Anomaly Trend Chart</CardTitle>
              </div>
              <CardDescription>Security anomaly patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
