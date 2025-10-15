import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMockAlerts, Alert } from "@/mock/mockAlerts";
import { getMockMetrics, NetworkMetrics } from "@/mock/mockMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SiemDashboard = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const alertsData = await getMockAlerts();
      const metricsData = await getMockMetrics();
      setAlerts(alertsData);
      setMetrics(metricsData.network);
    };
    loadData();
  }, []);

  const severityData = [
    { name: "Critical", value: alerts.filter((a) => a.severity === "critical").length },
    { name: "High", value: alerts.filter((a) => a.severity === "high").length },
    { name: "Medium", value: alerts.filter((a) => a.severity === "medium").length },
    { name: "Low", value: alerts.filter((a) => a.severity === "low").length },
  ];

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">SIEM Dashboard</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alerts by Severity</CardTitle>
              <CardDescription>Distribution of alert levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
              <CardDescription>Bandwidth & latency over 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).getHours() + ":00"}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bandwidth" stroke="hsl(var(--primary))" name="Bandwidth (Mbps)" />
                  <Line type="monotone" dataKey="latency" stroke="hsl(var(--accent))" name="Latency (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Alert Timeline</CardTitle>
              <CardDescription>Number of alerts per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).getHours() + ":00"}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activeConnections" fill="hsl(var(--primary))" name="Active Connections" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SiemDashboard;
