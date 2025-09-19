import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
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
  CheckCircle, 
  XCircle,
  Settings,
  LogOut,
  Zap,
  X,
  ShieldCheck,
  Edit,
  Menu,
  Home,
  Bell,
  Lock,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Send,
  MessageSquare
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

interface EditDevice {
  id: string;
  device_name: string;
  ip_address: string;
  mac_address: string;
  client_id: string;
}

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
  const [editingDevice, setEditingDevice] = useState<EditDevice | null>(null);
  const [showEditDevice, setShowEditDevice] = useState(false);
  
  // New state for expandable AI analysis sections
  const [expandedSections, setExpandedSections] = useState<{[alertId: string]: {causes: boolean; actions: boolean}}>({});
  
  // Alert-specific chat state
  const [alertChatVisible, setAlertChatVisible] = useState<{[alertId: string]: boolean}>({});
  const [alertChatMessages, setAlertChatMessages] = useState<{[alertId: string]: Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}>}>({});
  const [alertChatInputs, setAlertChatInputs] = useState<{[alertId: string]: string}>({});
  
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
    console.log('AI Analysis button clicked for alert:', alertId);
    console.log('Current alertChatVisible state:', alertChatVisible);
    
    // Toggle the chat visibility for this specific alert
    setAlertChatVisible(prev => {
      const newState = {
        ...prev,
        [alertId]: !prev[alertId]
      };
      console.log('New alertChatVisible state:', newState);
      return newState;
    });

    // If chat is becoming visible and we haven't called AI analysis yet, call it
    if (!alertChatVisible[alertId]) {
      try {
        console.log('Calling AI analysis function...');
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
        console.error('AI Analysis error:', error);
        toast({
          title: "Error",
          description: "Failed to get AI analysis",
          variant: "destructive"
        });
      }
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
      // Update local state to remove the closed alert
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      toast({
        title: "Success",
        description: "Alert closed successfully"
      });
    }
  };

  // Alert-specific chat functionality
  const sendAlertMessage = async (alertId: string) => {
    const currentInput = alertChatInputs[alertId]?.trim();
    if (!currentInput) return;
    
    const userMessage = {
      role: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    };
    
    // Add user message
    setAlertChatMessages(prev => ({
      ...prev,
      [alertId]: [...(prev[alertId] || []), userMessage]
    }));
    
    // Clear input
    setAlertChatInputs(prev => ({
      ...prev,
      [alertId]: ''
    }));
    
    // Simulate AI response - replace with actual AI integration
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant' as const,
        content: `I understand your concern about this alert: "${currentInput}". Based on the alert details, I can help you investigate further or suggest next steps.`,
        timestamp: new Date()
      };
      
      setAlertChatMessages(prev => ({
        ...prev,
        [alertId]: [...(prev[alertId] || []), aiMessage]
      }));
    }, 1000);
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the AI assistant."
    });
  };

  const handleAlertKeyPress = (e: React.KeyboardEvent, alertId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAlertMessage(alertId);
    }
  };

  const updateDevice = async () => {
    if (!editingDevice || !editingDevice.device_name || !editingDevice.ip_address) {
      toast({
        title: "Error",
        description: "Please fill in device name and IP address",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('devices')
      .update({
        device_name: editingDevice.device_name,
        ip_address: editingDevice.ip_address,
        mac_address: editingDevice.mac_address,
        client_id: editingDevice.client_id
      })
      .eq('id', editingDevice.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Device updated successfully"
      });
      setEditingDevice(null);
      setShowEditDevice(false);
    }
  };

  const openEditDevice = (device: Device) => {
    setEditingDevice({
      id: device.id,
      device_name: device.device_name,
      ip_address: device.ip_address,
      mac_address: device.mac_address || '',
      client_id: device.client_id
    });
    setShowEditDevice(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'status-blocked';
      case 'high': return 'status-threat';
      case 'medium': return 'status-threat';
      case 'low': return 'status-safe';
      default: return 'status-badge';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'threat': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'blocked': return <Lock className="h-4 w-4 text-danger" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-heading text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Security Overview
        </h1>
        <p className="text-muted-foreground text-lg">Monitor your network security in real-time</p>
      </div>
      
      {/* Professional Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-professional group hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading">Total Devices</CardTitle>
            <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{devices.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Connected devices</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading">Active Threats</CardTitle>
            <div className="p-3 rounded-2xl bg-warning/10 group-hover:bg-warning/20 transition-colors">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {alerts.filter(a => a.status === 'unresolved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Unresolved alerts</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading">Data Transfer</CardTitle>
            <div className="p-3 rounded-2xl bg-success/10 group-hover:bg-success/20 transition-colors">
              <Activity className="h-6 w-6 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{metrics.data_transferred_mb}</div>
            <p className="text-sm text-muted-foreground mt-2">MB transferred</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading">Network Status</CardTitle>
            <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">Active</div>
            <p className="text-sm text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card className="card-professional">
        <CardHeader className="spacing-generous">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading flex items-center">
              <Bell className="h-6 w-6 text-warning mr-3" />
              Recent Security Alerts
            </CardTitle>
            <Button 
              className="btn-primary"
              onClick={() => setCurrentPage('alerts')}
            >
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="spacing-generous">
          <div className="space-y-4">
            {alerts.slice(0, 5).length > 0 ? (
              alerts.slice(0, 5).map((alert) => {
                const alertDevice = devices.find(d => d.id === alert.device_id);
                return (
                  <div key={alert.id} className="card-professional p-6 hover:shadow-professional-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`${getSeverityColor(alert.severity)} rounded-full p-1`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`${getSeverityColor(alert.severity)} text-xs font-semibold`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="font-semibold text-foreground">{alert.alert_type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Security incident on {alertDevice?.device_name || 'Unknown Device'}
                          </p>
                          <p className="text-sm text-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <span className="text-xs font-medium text-primary">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <Button 
                          className="btn-primary"
                          size="sm"
                          onClick={() => setCurrentPage('alerts')}
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-subheading mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No security alerts detected. Your network is secure.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => {
    console.log('Rendering alerts, total alerts:', alerts.length);
    console.log('Alerts data:', alerts);
    
    return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-heading text-4xl font-bold text-warning">Security Alerts</h1>
        <p className="text-muted-foreground text-lg">Monitor and respond to security threats</p>
      </div>
      
      <div className="grid gap-4">
        {alerts.filter(alert => alert.status !== 'closed').map((alert) => {
          const alertDevice = devices.find(d => d.id === alert.device_id);
          console.log('Rendering alert:', alert.id, 'Chat visible:', alertChatVisible[alert.id]);
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
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(alertDevice.status)}
                            <span className={
                              alertDevice.status === 'safe' ? 'status-safe' :
                              alertDevice.status === 'threat' ? 'status-threat' :
                              'status-blocked'
                            }>
                              {alertDevice.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 mt-4">
                  <Button 
                    className="btn-primary"
                    size="sm" 
                    onClick={() => getAIAnalysis(alert.id)}
                    disabled={alert.status === 'closed'}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    AI Analysis
                  </Button>
                  <Button 
                    className="btn-success"
                    size="sm"
                    onClick={() => closeAlert(alert.id)}
                    disabled={alert.status === 'closed'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Alert
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
                {alert.ai_analysis_chat.length > 0 && (() => {
                  // Find the AI's response (not the user's prompt)
                  const aiResponse = alert.ai_analysis_chat.find(chat => chat.role === 'ai')?.content;
                  if (!aiResponse) return null;
                  
                  let analysisData;
                  try {
                    analysisData = JSON.parse(aiResponse);
                  } catch {
                    return (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2 text-heading">AI Analysis:</h4>
                        <p className="text-sm text-muted-foreground">{aiResponse}</p>
                      </div>
                    );
                  }
                  
                  const getThreatLevelColor = (level: string) => {
                    switch (level?.toLowerCase()) {
                      case 'critical': return 'bg-destructive text-destructive-foreground';
                      case 'high': return 'bg-warning text-warning-foreground';
                      case 'medium': return 'bg-warning/70 text-warning-foreground';
                      case 'low': return 'bg-success text-success-foreground';
                      default: return 'bg-muted text-muted-foreground';
                    }
                  };

                  const currentExpanded = expandedSections[alert.id] || { causes: false, actions: false };
                  
                  const toggleSection = (section: 'causes' | 'actions') => {
                    setExpandedSections(prev => ({
                      ...prev,
                      [alert.id]: {
                        ...currentExpanded,
                        [section]: !currentExpanded[section]
                      }
                    }));
                  };
                  
                  return (
                    <div className="mt-4 p-6 bg-background border border-border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-heading text-lg">🤖 AI Security Analysis</h4>
                        <Badge className={`${getThreatLevelColor(analysisData.threat_level)} font-medium`}>
                          {analysisData.threat_level || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Always show summary */}
                        <div>
                          <h5 className="font-medium text-subheading mb-2">📋 Summary</h5>
                          <p className="text-sm text-foreground leading-relaxed">{analysisData.summary}</p>
                        </div>

                        {/* Expandable sections with buttons */}
                        <div className="space-y-3">
                          {analysisData.potential_causes && analysisData.potential_causes.length > 0 && (
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSection('causes')}
                                className="flex items-center gap-2 mb-3"
                              >
                                {currentExpanded.causes ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                🔍 Potential Causes
                              </Button>
                              
                              {currentExpanded.causes && (
                                <div className="ml-6 pl-4 border-l-2 border-border">
                                  <ul className="text-sm text-foreground space-y-1">
                                    {analysisData.potential_causes.map((cause: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-muted-foreground mt-0.5">•</span>
                                        <span>{cause}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {analysisData.mitigation_steps && analysisData.mitigation_steps.length > 0 && (
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSection('actions')}
                                className="flex items-center gap-2 mb-3"
                              >
                                {currentExpanded.actions ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                ⚡ Recommended Actions
                              </Button>
                              
                              {currentExpanded.actions && (
                                <div className="ml-6 pl-4 border-l-2 border-border">
                                  <ol className="text-sm text-foreground space-y-2">
                                    {analysisData.mitigation_steps.map((step: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                          {idx + 1}
                                        </span>
                                        <span className="pt-0.5">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Alert-specific Chat Interface */}
                {alertChatVisible[alert.id] && (
                  <div className="mt-4 border-t border-border pt-4 space-y-4">
                    {/* Chat Messages */}
                    {alertChatMessages[alert.id] && alertChatMessages[alert.id].length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg">
                        {alertChatMessages[alert.id].map((message, idx) => (
                          <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-background text-foreground border'
                            }`}>
                              <div className="flex items-start gap-2">
                                {message.role === 'assistant' && (
                                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                )}
                                <div>
                                  <p>{message.content}</p>
                                  <p className="text-xs opacity-70 mt-1">
                                    {format(message.timestamp, 'HH:mm')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Chat Input */}
                    <div className="flex items-center space-x-2">
                      <Input
                        value={alertChatInputs[alert.id] || ''}
                        onChange={(e) => setAlertChatInputs(prev => ({
                          ...prev,
                          [alert.id]: e.target.value
                        }))}
                        onKeyPress={(e) => handleAlertKeyPress(e, alert.id)}
                        placeholder="Ask about this specific alert..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => sendAlertMessage(alert.id)}
                        disabled={!alertChatInputs[alert.id]?.trim()}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    );
  };

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
              <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{device.device_name}</span>
                    {getStatusIcon(device.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>IP: {device.ip_address}</div>
                    {device.mac_address && <div>MAC: {device.mac_address}</div>}
                    {device.client_id && <div>Client ID: {device.client_id}</div>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDevice(device)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Device
                  </Button>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Device Modal */}
      {showEditDevice && editingDevice && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Device</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDevice(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="editDeviceName">Device Name</Label>
                    <Input
                      id="editDeviceName"
                      value={editingDevice.device_name}
                      onChange={(e) => setEditingDevice({ ...editingDevice, device_name: e.target.value })}
                      placeholder="Enter device name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editIpAddress">IP Address</Label>
                    <Input
                      id="editIpAddress"
                      value={editingDevice.ip_address}
                      onChange={(e) => setEditingDevice({ ...editingDevice, ip_address: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMacAddress">MAC Address (Optional)</Label>
                    <Input
                      id="editMacAddress"
                      value={editingDevice.mac_address}
                      onChange={(e) => setEditingDevice({ ...editingDevice, mac_address: e.target.value })}
                      placeholder="00:11:22:33:44:55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editClientId">Client ID</Label>
                    <Input
                      id="editClientId"
                      value={editingDevice.client_id}
                      onChange={(e) => setEditingDevice({ ...editingDevice, client_id: e.target.value })}
                      placeholder="device_123 (for IoT devices)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowEditDevice(false)}>
                    Cancel
                  </Button>
                  <Button onClick={updateDevice}>
                    Update Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold text-foreground">SecureNet Dashboard</span>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'alerts', label: 'Alerts', icon: Bell },
                  { id: 'devices', label: 'Devices', icon: Monitor },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id as Page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      currentPage === id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'overview' && renderOverview()}
        {currentPage === 'alerts' && renderAlerts()}
        {currentPage === 'devices' && renderDevices()}
        {currentPage === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default Dashboard;