import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  Monitor, 
  Activity, 
  Plus, 
  Blocks, 
  CheckCircle, 
  Settings,
  LogOut,
  Zap,
  X,
  ShieldCheck
} from 'lucide-react';

interface Device {
  id: string;
  device_name: string;
  ip_address: string;
  mac_address: string;
  client_id: string;
  status: 'safe' | 'threat' | 'blocked';
  connected_since: string;
}

interface SecurityAlert {
  id: string;
  device_id: string;
  alert_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'unresolved' | 'resolved' | 'closed';
  ai_analysis_chat: Array<{role: string; content: string}>;
}

interface NetworkMetrics {
  total_devices: number;
  threats_detected: number;
  data_transferred_mb: number;
  network_activity: Array<{timestamp: string; data_rate: number}>;
}

type Page = 'overview' | 'alerts' | 'devices' | 'settings';

export const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    total_devices: 0,
    threats_detected: 0,
    data_transferred_mb: 0,
    network_activity: []
  });
  const [newDevice, setNewDevice] = useState({ name: '', ip: '', mac: '', client_id: '' });
  const [showAddDevice, setShowAddDevice] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchAlerts();
      fetchMetrics();
      
      // Set up real-time subscriptions
      const devicesChannel = supabase
        .channel('devices-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'devices'
        }, () => {
          fetchDevices();
        })
        .subscribe();

      const alertsChannel = supabase
        .channel('alerts-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'security_alerts'
        }, () => {
          fetchAlerts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(devicesChannel);
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [user]);

  const fetchDevices = async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDevices(data as Device[]);
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select(`
        *,
        devices!inner(device_name, user_id)
      `)
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      const formattedAlerts = data.map(alert => ({
        ...alert,
        ai_analysis_chat: (alert.ai_analysis_chat as Array<{role: string; content: string}>) || []
      }));
      setAlerts(formattedAlerts as SecurityAlert[]);
    }
  };

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('network_metrics')
      .select('*')
      .single();
    
    if (!error && data) {
      setMetrics({
        total_devices: data.total_devices || 0,
        threats_detected: data.threats_detected || 0,
        data_transferred_mb: data.data_transferred_mb || 0,
        network_activity: (data.network_activity as Array<{timestamp: string; data_rate: number}>) || []
      });
    }
  };

  const addDevice = async () => {
    if (!newDevice.name || !newDevice.ip) {
      toast({
        title: "Error",
        description: "Please fill in device name and IP address",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('devices')
      .insert({
        user_id: user?.id,
        device_name: newDevice.name,
        ip_address: newDevice.ip,
        mac_address: newDevice.mac,
        client_id: newDevice.client_id || `${newDevice.name}-${Date.now()}`
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Device added successfully"
      });
      setNewDevice({ name: '', ip: '', mac: '', client_id: '' });
      setShowAddDevice(false);
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: string) => {
    const { error } = await supabase
      .from('devices')
      .update({ status })
      .eq('id', deviceId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Device ${status} successfully`
      });
    }
  };

  const getAIAnalysis = async (alertId: string) => {
    try {
      const response = await supabase.functions.invoke('ai-analysis', {
        body: { alertId }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "AI Analysis",
        description: "Analysis completed and saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI analysis",
        variant: "destructive"
      });
    }
  };

  const closeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ status: 'closed' })
      .eq('id', alertId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Alert closed successfully"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'threat': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'blocked': return <Blocks className="h-4 w-4 text-gray-500" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Security Overview</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.status === 'unresolved').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.data_transferred_mb} MB</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Activity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => {
              const alertDevice = devices.find(d => d.id === alert.device_id);
              return (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{alert.alert_type}</span>
                    <span className="text-sm text-muted-foreground">
                      Security on {alertDevice?.device_name || 'Unknown Device'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setCurrentPage('alerts')}
                    >
                      Go to Alert
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Security Alerts</h2>
      
      <div className="grid gap-4">
        {alerts.filter(alert => alert.status !== 'closed').map((alert) => {
          const alertDevice = devices.find(d => d.id === alert.device_id);
          return (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <CardTitle className="text-lg">{alert.alert_type}</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{alert.description}</p>
                
                {/* Device Information */}
                {alertDevice && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Associated Device
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {alertDevice.device_name}
                      </div>
                      <div>
                        <span className="font-medium">IP:</span> {alertDevice.ip_address}
                      </div>
                      {alertDevice.client_id && (
                        <div>
                          <span className="font-medium">Client ID:</span> {alertDevice.client_id}
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Status:</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(alertDevice.status)}
                          <Badge variant={alertDevice.status === 'safe' ? 'default' : 'destructive'}>
                            {alertDevice.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => getAIAnalysis(alert.id)}
                    disabled={alert.status === 'closed'}
                  >
                    Get AI Analysis
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => closeAlert(alert.id)}
                    disabled={alert.status === 'closed'}
                  >
                    Close Threat
                  </Button>
                  {alertDevice && alertDevice.status !== 'blocked' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateDeviceStatus(alertDevice.id, 'blocked')}
                      disabled={alert.status === 'closed'}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Block Device
                    </Button>
                  )}
                  {alertDevice && alertDevice.status === 'blocked' && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => updateDeviceStatus(alertDevice.id, 'safe')}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Unblock Device
                    </Button>
                  )}
                </div>
                {alert.ai_analysis_chat.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded">
                    <h4 className="font-semibold mb-2">AI Analysis:</h4>
                    {alert.ai_analysis_chat.map((chat, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{chat.role}:</span> {chat.content}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Devices</h2>
        <Button onClick={() => setShowAddDevice(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {showAddDevice && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label htmlFor="clientId">Client ID (Optional)</Label>
                <Input
                  id="clientId"
                  value={newDevice.client_id}
                  onChange={(e) => setNewDevice({ ...newDevice, client_id: e.target.value })}
                  placeholder="device_123 (for IoT devices)"
                />
              </div>
              <div>
                <Label htmlFor="macAddress">MAC Address (Optional)</Label>
                <Input
                  id="macAddress"
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice({ ...newDevice, mac: e.target.value })}
                  placeholder="00:00:00:00:00:00"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={addDevice}>Add Device</Button>
              <Button variant="outline" onClick={() => setShowAddDevice(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(device.status)}
                  <CardTitle className="text-lg">{device.device_name}</CardTitle>
                  <Badge variant="outline">{device.status.toUpperCase()}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  Connected since: {new Date(device.connected_since).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-medium">IP Address:</span> {device.ip_address}
                </div>
                <div>
                  <span className="font-medium">MAC Address:</span> {device.mac_address || 'N/A'}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => updateDeviceStatus(device.id, 'blocked')}
                  disabled={device.status === 'blocked'}
                >
                  Block
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateDeviceStatus(device.id, 'safe')}
                  disabled={device.status === 'safe'}
                >
                  Unblock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div>
              <Label>User ID</Label>
              <Input value={user?.id || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{device.device_name}</span>
                  <span className="text-sm text-muted-foreground ml-2">({device.ip_address})</span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    const { error } = await supabase
                      .from('devices')
                      .delete()
                      .eq('id', device.id);
                    
                    if (error) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive"
                      });
                    } else {
                      toast({
                        title: "Success",
                        description: "Device removed successfully"
                      });
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Security Monitor</span>
          </div>
          
          <div className="ml-8 flex space-x-4">
            <Button
              variant={currentPage === 'overview' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('overview')}
            >
              Overview
            </Button>
            <Button
              variant={currentPage === 'alerts' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('alerts')}
            >
              Alerts ({alerts.filter(a => a.status === 'unresolved').length})
            </Button>
            <Button
              variant={currentPage === 'devices' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('devices')}
            >
              Devices
            </Button>
            <Button
              variant={currentPage === 'settings' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          <div className="ml-auto">
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'overview' && renderOverview()}
        {currentPage === 'alerts' && renderAlerts()}
        {currentPage === 'devices' && renderDevices()}
        {currentPage === 'settings' && renderSettings()}
      </main>
    </div>
  );
};