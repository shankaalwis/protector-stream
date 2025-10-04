import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarIcon, Download, FileText, FileSpreadsheet, Eye, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  devices: any[];
  alerts: any[];
  anomalies: any[];
  metrics: any[];
}

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [includeDevices, setIncludeDevices] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const selectAll = () => {
    const allSelected = includeDevices && includeAlerts && includeAnomalies && includeMetrics;
    setIncludeDevices(!allSelected);
    setIncludeAlerts(!allSelected);
    setIncludeAnomalies(!allSelected);
    setIncludeMetrics(!allSelected);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }

    if (!includeDevices && !includeAlerts && !includeAnomalies && !includeMetrics) {
      toast({
        title: "Error",
        description: "Please select at least one data type to include",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data: ReportData = {
        devices: [],
        alerts: [],
        anomalies: [],
        metrics: []
      };

      // Fetch devices if selected
      if (includeDevices) {
        const { data: devicesData, error } = await supabase
          .from('devices')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false });
        
        if (!error && devicesData) {
          data.devices = devicesData;
        }
      }

      // Fetch security alerts if selected
      if (includeAlerts) {
        const { data: alertsData, error } = await supabase
          .from('security_alerts')
          .select(`
            *,
            devices!inner(device_name, user_id, client_id)
          `)
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString())
          .order('timestamp', { ascending: false });
        
        if (!error && alertsData) {
          data.alerts = alertsData;
        }
      }

      // Fetch anomalies if selected
      if (includeAnomalies) {
        const { data: anomaliesData, error } = await supabase
          .from('anomaly_alerts')
          .select('*')
          .gte('timestamp', startDate.toISOString())
          .lte('timestamp', endDate.toISOString())
          .order('timestamp', { ascending: false });
        
        if (!error && anomaliesData) {
          data.anomalies = anomaliesData;
        }
      }

      // Fetch dashboard metrics if selected
      if (includeMetrics) {
        const { data: metricsData, error } = await supabase
          .from('dashboard_metrics')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false });
        
        if (!error && metricsData) {
          data.metrics = metricsData;
        }
      }

      setReportData(data);
      setShowReport(true);

      toast({
        title: "Success",
        description: "Report generated successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData || !startDate || !endDate) return;

    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 109, 182);
    doc.text('Security Report', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`User ID: ${user?.id}`, 105, yPosition, { align: 'center' });
    
    yPosition += 7;
    doc.text(`Date Range: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`, 105, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 109, 182);
    doc.text('Executive Summary', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const summaryData = [
      ['Total Devices', reportData.devices.length.toString()],
      ['Security Alerts', reportData.alerts.length.toString()],
      ['Anomalies Detected', reportData.anomalies.length.toString()],
      ['Metric Records', reportData.metrics.length.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Count']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [0, 109, 182] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Devices Section
    if (reportData.devices.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 109, 182);
      doc.text('Connected Devices', 14, yPosition);
      yPosition += 5;

      const devicesTableData = reportData.devices.map(device => [
        device.device_name,
        device.ip_address,
        device.client_id,
        device.status,
        format(new Date(device.created_at), 'PPp')
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Device Name', 'IP Address', 'Client ID', 'Status', 'Connected Since']],
        body: devicesTableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 109, 182] },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Security Alerts Section
    if (reportData.alerts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 109, 182);
      doc.text('Security Alerts', 14, yPosition);
      yPosition += 5;

      const alertsTableData = reportData.alerts.map(alert => [
        alert.alert_type,
        alert.severity,
        alert.description.substring(0, 50) + '...',
        alert.status,
        format(new Date(alert.timestamp), 'PPp')
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Severity', 'Description', 'Status', 'Timestamp']],
        body: alertsTableData,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Anomalies Section
    if (reportData.anomalies.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 109, 182);
      doc.text('Detected Anomalies', 14, yPosition);
      yPosition += 5;

      const anomaliesTableData = reportData.anomalies.map(anomaly => [
        anomaly.client_id,
        anomaly.packet_count.toString(),
        anomaly.anomaly_score.toFixed(2),
        anomaly.is_anomaly ? 'Yes' : 'No',
        format(new Date(anomaly.timestamp), 'PPp')
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Client ID', 'Packet Count', 'Anomaly Score', 'Is Anomaly', 'Timestamp']],
        body: anomaliesTableData,
        theme: 'striped',
        headStyles: { fillColor: [255, 193, 7] },
        styles: { fontSize: 8 },
      });
    }

    // Save PDF
    doc.save(`security-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.pdf`);

    toast({
      title: "Success",
      description: "PDF downloaded successfully"
    });
  };

  const downloadCSV = () => {
    if (!reportData || !startDate || !endDate) return;

    let csvContent = `Security Report\nUser ID: ${user?.id}\nDate Range: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}\n\n`;

    // Devices
    if (reportData.devices.length > 0) {
      csvContent += 'CONNECTED DEVICES\n';
      csvContent += 'Device Name,IP Address,MAC Address,Client ID,Status,Connected Since\n';
      reportData.devices.forEach(device => {
        csvContent += `"${device.device_name}","${device.ip_address}","${device.mac_address || 'N/A'}","${device.client_id}","${device.status}","${format(new Date(device.created_at), 'PPp')}"\n`;
      });
      csvContent += '\n';
    }

    // Alerts
    if (reportData.alerts.length > 0) {
      csvContent += 'SECURITY ALERTS\n';
      csvContent += 'Alert Type,Severity,Description,Status,Timestamp,Device Name\n';
      reportData.alerts.forEach(alert => {
        csvContent += `"${alert.alert_type}","${alert.severity}","${alert.description.replace(/"/g, '""')}","${alert.status}","${format(new Date(alert.timestamp), 'PPp')}","${alert.devices?.device_name || 'N/A'}"\n`;
      });
      csvContent += '\n';
    }

    // Anomalies
    if (reportData.anomalies.length > 0) {
      csvContent += 'DETECTED ANOMALIES\n';
      csvContent += 'Client ID,Packet Count,Anomaly Score,Is Anomaly,Timestamp\n';
      reportData.anomalies.forEach(anomaly => {
        csvContent += `"${anomaly.client_id}","${anomaly.packet_count}","${anomaly.anomaly_score}","${anomaly.is_anomaly}","${format(new Date(anomaly.timestamp), 'PPp')}"\n`;
      });
      csvContent += '\n';
    }

    // Metrics
    if (reportData.metrics.length > 0) {
      csvContent += 'DASHBOARD METRICS\n';
      csvContent += 'Metric Key,Metric Value,Created At\n';
      reportData.metrics.forEach(metric => {
        csvContent += `"${metric.metric_key}","${JSON.stringify(metric.metric_value).replace(/"/g, '""')}","${format(new Date(metric.created_at), 'PPp')}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `security-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
    link.click();

    toast({
      title: "Success",
      description: "CSV downloaded successfully"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-[hsl(var(--alert-red))] text-[hsl(var(--alert-red-foreground))]';
      case 'high': return 'bg-[hsl(var(--alert-red))] text-[hsl(var(--alert-red-foreground))]';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-lg">
          <div className="relative text-center space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--banner-blue))] to-[hsl(var(--banner-blue-light))] bg-clip-text text-transparent">
                Historical Security Reports
              </h1>
              <FileText className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
            </div>
            <p className="text-lg font-medium text-foreground/80">Generate comprehensive security reports for any time period</p>
          </div>
        </div>

        {/* Control Panel */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="text-heading">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-subheading">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-subheading">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Content Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-subheading">Include in Report</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  {includeDevices && includeAlerts && includeAnomalies && includeMetrics ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="devices"
                    checked={includeDevices}
                    onCheckedChange={(checked) => setIncludeDevices(checked as boolean)}
                  />
                  <Label htmlFor="devices" className="cursor-pointer">
                    Connected Devices
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="alerts"
                    checked={includeAlerts}
                    onCheckedChange={(checked) => setIncludeAlerts(checked as boolean)}
                  />
                  <Label htmlFor="alerts" className="cursor-pointer">
                    Security Alerts
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anomalies"
                    checked={includeAnomalies}
                    onCheckedChange={(checked) => setIncludeAnomalies(checked as boolean)}
                  />
                  <Label htmlFor="anomalies" className="cursor-pointer">
                    Detected Anomalies
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metrics"
                    checked={includeMetrics}
                    onCheckedChange={(checked) => setIncludeMetrics(checked as boolean)}
                  />
                  <Label htmlFor="metrics" className="cursor-pointer">
                    Dashboard Metrics
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {reportData && showReport && (
                <>
                  <Button
                    onClick={downloadPDF}
                    variant="outline"
                    className="border-[hsl(var(--dark-sky-blue))] text-[hsl(var(--dark-sky-blue))] hover:bg-[hsl(var(--dark-sky-blue))]/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>

                  <Button
                    onClick={downloadCSV}
                    variant="outline"
                    className="border-success text-success hover:bg-success/10"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {showReport && reportData && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-heading">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Devices</p>
                    <p className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))]">{reportData.devices.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Security Alerts</p>
                    <p className="text-3xl font-bold text-[hsl(var(--alert-red))]">{reportData.alerts.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                    <p className="text-3xl font-bold text-warning">{reportData.anomalies.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Metric Records</p>
                    <p className="text-3xl font-bold text-success">{reportData.metrics.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Devices Table */}
            {reportData.devices.length > 0 && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-heading">Connected Devices ({reportData.devices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device Name</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Client ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Connected Since</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell className="font-medium">{device.device_name}</TableCell>
                            <TableCell>{device.ip_address}</TableCell>
                            <TableCell className="font-mono text-xs">{device.client_id}</TableCell>
                            <TableCell>
                              <Badge className={device.status === 'safe' ? 'status-safe' : device.status === 'threat' ? 'status-threat' : 'status-blocked'}>
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(device.created_at), 'PPp')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Security Alerts Table */}
            {reportData.alerts.length > 0 && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-heading">Security Alerts ({reportData.alerts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.alerts.map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell className="font-medium">{alert.alert_type}</TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md truncate">{alert.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{alert.status}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(alert.timestamp), 'PPp')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Anomalies Table */}
            {reportData.anomalies.length > 0 && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-heading">Detected Anomalies ({reportData.anomalies.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client ID</TableHead>
                          <TableHead>Packet Count</TableHead>
                          <TableHead>Anomaly Score</TableHead>
                          <TableHead>Is Anomaly</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.anomalies.map((anomaly) => (
                          <TableRow key={anomaly.id}>
                            <TableCell className="font-mono text-xs">{anomaly.client_id}</TableCell>
                            <TableCell>{anomaly.packet_count}</TableCell>
                            <TableCell className="font-medium">{anomaly.anomaly_score.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={anomaly.is_anomaly ? 'status-threat' : 'status-safe'}>
                                {anomaly.is_anomaly ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(anomaly.timestamp), 'PPp')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Metrics Table */}
            {reportData.metrics.length > 0 && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-heading">Dashboard Metrics ({reportData.metrics.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric Key</TableHead>
                          <TableHead>Metric Value</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.metrics.map((metric) => (
                          <TableRow key={metric.id}>
                            <TableCell className="font-medium">{metric.metric_key}</TableCell>
                            <TableCell className="font-mono text-xs max-w-md truncate">
                              {JSON.stringify(metric.metric_value)}
                            </TableCell>
                            <TableCell>{format(new Date(metric.created_at), 'PPp')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
