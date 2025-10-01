import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Shield, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetric {
  id: string;
  metric_key: string;
  metric_value: any;
  updated_at: string;
}

interface TimeSeriesData {
  time: string;
  value: number;
}

export default function SiemDashboard() {
  const [throughputData, setThroughputData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_key', 'message_throughput_60m')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Transform the metric_value into chart data
        const chartData = Array.isArray(data.metric_value) 
          ? data.metric_value.map((item: any) => ({
              time: item._time || item.time || new Date().toISOString(),
              value: parseInt(item.count || item.value || 0)
            }))
          : [];
        
        setThroughputData(chartData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive"
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
          filter: 'metric_key=eq.message_throughput_60m'
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">🛡️ SIEM Dashboard: Threat Monitor</h1>
            <p className="text-muted-foreground mt-2">Real-time security intelligence and event monitoring</p>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message Throughput Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Message Throughput (Last 60 Minutes)
              </CardTitle>
              <CardDescription>Real-time message flow analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : throughputData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available yet. Waiting for Splunk reports...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placeholder: Summary Stats */}
          <Card className="bg-gradient-to-br from-card to-secondary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Summary Stats
              </CardTitle>
              <CardDescription>Key metrics overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-foreground">
                  {throughputData.reduce((sum, item) => sum + item.value, 0)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Peak Throughput</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.max(...throughputData.map(d => d.value), 0)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold text-green-500">Live</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Expansion Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-dashed border-2 border-muted-foreground/30">
            <CardHeader>
              <CardTitle className="text-muted-foreground">🎯 Top Attacking IPs</CardTitle>
              <CardDescription>Coming soon - Real-time threat source analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
              Widget placeholder - Ready for integration
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-muted-foreground/30">
            <CardHeader>
              <CardTitle className="text-muted-foreground">📊 Anomaly Trend Chart</CardTitle>
              <CardDescription>Coming soon - ML-powered anomaly detection</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
              Widget placeholder - Ready for integration
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
