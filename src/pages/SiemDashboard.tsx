import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from "recharts";
import { Activity, Shield, TrendingUp, ArrowLeft, Users, AlertTriangle } from "lucide-react";
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
  const [failedAuthCount, setFailedAuthCount] = useState<number>(0);
  const [successfulConnections, setSuccessfulConnections] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    try {
      console.log('Fetching dashboard metrics...');
      
      // Fetch throughput data
      const { data: throughputData, error: throughputError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_key', 'Dashboard Data: Message Throughput (New)')
        .maybeSingle();

      if (throughputError) {
        console.error('Error fetching throughput metrics:', throughputError);
      } else if (throughputData && throughputData.metric_value) {
        const chartData = Array.isArray(throughputData.metric_value) 
          ? throughputData.metric_value.map((item: any) => ({
              time: format(new Date(item.time_epoch), 'HH:mm'),
              throughput: item.throughput
            }))
          : [];
        setThroughputData(chartData);
      }

      // Fetch failed auth data
      const { data: authData, error: authError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_key', 'Failed Auth Attempts (24h) Webhook')
        .maybeSingle();

      if (authError) {
        console.error('Error fetching auth metrics:', authError);
      } else if (authData && authData.metric_value) {
        const authValue = authData.metric_value as { total_failed_attempts: number };
        const count = authValue.total_failed_attempts || 0;
        setFailedAuthCount(count);
      }

      // Fetch successful connections data
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('metric_key', 'successful_connections_24h')
        .maybeSingle();

      if (connectionsError) {
        console.error('Error fetching connections metrics:', connectionsError);
      } else if (connectionsData && connectionsData.metric_value) {
        const connectionsValue = connectionsData.metric_value as { value: number };
        const count = connectionsValue.value || 0;
        setSuccessfulConnections(count);
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

    // Set up real-time subscription for both metrics
    const channel = supabase
      .channel('dashboard-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_metrics'
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

  // Determine gauge color based on thresholds
  const getAuthGaugeColor = (value: number) => {
    if (value <= 500) return 'hsl(var(--chart-2))'; // Green
    if (value <= 2500) return 'hsl(var(--chart-3))'; // Yellow
    return 'hsl(var(--destructive))'; // Red
  };

  const getConnectionsGaugeColor = (value: number) => {
    if (value >= 25) return 'hsl(var(--chart-2))'; // Green - meeting target
    if (value >= 15) return 'hsl(var(--chart-3))'; // Yellow - warning
    return 'hsl(var(--destructive))'; // Red - critical
  };

  const authGaugeData = [
    {
      name: 'Failed Attempts',
      value: failedAuthCount,
      fill: getAuthGaugeColor(failedAuthCount),
    },
  ];

  const connectionsGaugeData = [
    {
      name: 'Successful Connections',
      value: successfulConnections,
      fill: getConnectionsGaugeColor(successfulConnections),
    },
  ];

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

          {/* Authentication Failures Gauge */}
          <Card className="bg-card/50 backdrop-blur border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Authentication Failures: Last 24 hrs</CardTitle>
              </div>
              <CardDescription>Failed authentication attempts in 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={authGaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        max={5000}
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-3xl font-bold"
                      >
                        {failedAuthCount.toLocaleString()}
                      </text>
                      <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-sm"
                      >
                        / 5,000 attempts
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                      <span className="text-xs text-muted-foreground">Safe (0-500)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                      <span className="text-xs text-muted-foreground">Warning (501-2500)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-xs text-muted-foreground">Critical (2501+)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Successful Connections Gauge */}
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Successful Connections (Last 24 Hours)</CardTitle>
              </div>
              <CardDescription>Critical connections target: 25</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={connectionsGaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        max={50}
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-3xl font-bold"
                      >
                        {successfulConnections.toLocaleString()}
                      </text>
                      <text
                        x="50%"
                        y="60%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-sm"
                      >
                        / 50 connections
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-xs text-muted-foreground">Critical (&lt;15)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                      <span className="text-xs text-muted-foreground">Warning (15-24)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                      <span className="text-xs text-muted-foreground">Good (25+)</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
