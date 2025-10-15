import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMockAlerts, Alert } from "@/mock/mockAlerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

const Reports = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await getMockAlerts();
      setAlerts(data);
    };
    loadAlerts();
  }, []);

  const handleExport = () => {
    toast.success("Report export started (mock)");
  };

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
              <h1 className="text-xl font-bold">Security Reports</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
            <CardDescription>Complete list of all security alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "high"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
