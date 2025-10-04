import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnomalyChart from './AnomalyChart';
import AlertDetailCard from './AlertDetailCard';
import AuraChat from './AuraChat';
import { ModeToggle } from './theme-toggle';
import guarddogImage from '@/assets/guarddog.png';
import barkSound from '@/assets/dog-bark.mp3';
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
  MessageSquare,
  FileText,
  Sparkles
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
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<{ first_name: string | null; last_name: string | null } | null>(null);
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const barkAudioRef = useRef<HTMLAudioElement>(null);
  
  // New state for expandable AI analysis sections
  const [expandedSections, setExpandedSections] = useState<{[alertId: string]: {causes: boolean; actions: boolean}}>({});
  
  // Alert-specific chat state
  const [alertChatVisible, setAlertChatVisible] = useState<{[alertId: string]: boolean}>({});
  const [alertChatMessages, setAlertChatMessages] = useState<{[alertId: string]: Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}>}>({});
  const [alertChatInputs, setAlertChatInputs] = useState<{[alertId: string]: string}>({});
  
  const { toast } = useToast();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        setUserProfile(data);
      }
    };
    
    fetchUserProfile();
  }, [user]);

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
    const wasVisible = alertChatVisible[alertId];
    setAlertChatVisible(prev => {
      const newState = {
        ...prev,
        [alertId]: !prev[alertId]
      };
      console.log('New alertChatVisible state:', newState);
      return newState;
    });

    // If chat is becoming visible and we haven't called AI analysis yet, call it
    if (!wasVisible) {
      const currentAlert = alerts.find(alert => alert.id === alertId);
      
      // Only call AI analysis if we don't have analysis data yet
      if (!currentAlert?.ai_analysis_chat || currentAlert.ai_analysis_chat.length === 0) {
        try {
          console.log('Calling AI analysis function...');
          const response = await supabase.functions.invoke('ai-analysis', {
            body: { alertId }
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          // Refresh alerts data to get the updated AI analysis
          await fetchAlerts();
          
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
    
    try {
      // Call AI analysis function with user query for conversational mode
      console.log('Calling AI analysis function with user query:', currentInput);
      const response = await supabase.functions.invoke('ai-analysis', {
        body: { 
          alertId,
          userQuery: currentInput 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Add AI response
      const aiMessage = {
        role: 'assistant' as const,
        content: response.data?.analysis || 'Unable to generate response at this time.',
        timestamp: new Date()
      };
      
      setAlertChatMessages(prev => ({
        ...prev,
        [alertId]: [...(prev[alertId] || []), aiMessage]
      }));

      // Refresh alerts data to get the updated conversation history
      await fetchAlerts();
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the AI assistant."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setAlertChatMessages(prev => ({
        ...prev,
        [alertId]: [...(prev[alertId] || []), errorMessage]
      }));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
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
      case 'critical': return 'status-triggered';
      case 'high': return 'status-triggered';
      case 'medium': return 'status-threat';
      case 'low': return 'status-safe';
      default: return 'status-badge';
    }
  };

  const cleanAlertDescription = (description: string) => {
    // Remove any mention of "Splunk" or similar detection system references
    return description
      .replace(/security alert detected by splunk/gi, 'Security alert detected')
      .replace(/detected by splunk/gi, 'detected')
      .replace(/splunk security alert/gi, 'Security alert')
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
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
      {/* Clean Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}` 
                  : user?.email}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-5xl font-bold text-foreground mb-2">Security Overview</h1>
            <p className="text-lg text-muted-foreground">Monitor your network security in real-time</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Metrics Cards with Dark Sky Blue Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Total Devices</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Monitor className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">{devices.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Connected devices</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-muted))]/10 animate-fade-in [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Active Threats</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <AlertTriangle className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">
              {alerts.filter(a => a.status === 'unresolved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Unresolved alerts</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-lighter))]/10 animate-fade-in [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Data Transfer</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Activity className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">{metrics.data_transferred_mb}</div>
            <p className="text-sm text-muted-foreground mt-2">MB transferred</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-dark))]/10 animate-fade-in [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Network Status</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Zap className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">Active</div>
            <p className="text-sm text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Anomaly Detection Chart */}
      <div className="animate-fade-in [animation-delay:500ms]">
        <AnomalyChart />
      </div>

      {/* Enhanced Recent Security Alerts Section with Dark Sky Blue */}
      <Card className="card-professional border-[hsl(var(--dark-sky-blue))]/60 shadow-2xl animate-fade-in [animation-delay:400ms]">
        <CardHeader className="spacing-generous bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/30 via-[hsl(var(--dark-sky-blue-light))]/10 to-transparent border-b border-[hsl(var(--dark-sky-blue))]/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading flex items-center">
              <Bell className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] mr-3 animate-pulse" />
              <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Recent Security Alerts</span>
            </CardTitle>
            <Button 
              className="btn-primary bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] hover:from-[hsl(var(--dark-sky-blue-dark))] hover:to-[hsl(var(--dark-sky-blue))] border border-[hsl(var(--dark-sky-blue))]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                  <div key={alert.id} className="card-professional p-6 hover:shadow-2xl transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 via-[hsl(var(--dark-sky-blue-light))]/5 to-transparent hover:from-[hsl(var(--dark-sky-blue-subtle))]/30 hover:border-[hsl(var(--dark-sky-blue-light))]/60 animate-fade-in hover:scale-[1.02]">
                     <div className="flex items-start justify-between">
                       <div className="flex items-start space-x-4 flex-1">
                         <div className={`${getSeverityColor(alert.severity)} rounded-full p-1 animate-pulse`}>
                           <AlertTriangle className="h-4 w-4" />
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center space-x-3 mb-2">
                             <span className={`${getSeverityColor(alert.severity)} text-xs font-semibold`}>
                               {alert.severity.toUpperCase()}
                             </span>
                             <span className="font-semibold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors">{alert.alert_type}</span>
                           </div>
                           <p className="text-sm text-muted-foreground mb-2">
                             Security incident on <span className="font-medium text-[hsl(var(--dark-sky-blue))]">{alertDevice?.device_name || 'Unknown Device'}</span>
                           </p>
                           <p className="text-sm text-foreground">{cleanAlertDescription(alert.description)}</p>
                         </div>
                       </div>
                       <div className="flex flex-col items-end space-y-2 ml-4">
                         <span className="text-xs font-medium text-[hsl(var(--dark-sky-blue))]">
                           {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                         </span>
                         <span className="text-xs text-muted-foreground">
                           {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                         </span>
                         <Button 
                           className="btn-primary bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] hover:from-[hsl(var(--dark-sky-blue-dark))] hover:to-[hsl(var(--dark-sky-blue))] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
               <div className="text-center py-12 animate-fade-in">
                 <CheckCircle className="h-16 w-16 text-[hsl(var(--dark-sky-blue))] mx-auto mb-4 animate-pulse" />
                 <h3 className="text-subheading mb-2 text-[hsl(var(--dark-sky-blue))] font-bold">All Clear!</h3>
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
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Security Monitoring</p>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}` 
                  : user?.email}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-5xl font-bold text-foreground mb-2">Security Alerts</h1>
            <p className="text-lg text-muted-foreground">Monitor and respond to security threats</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {alerts.filter(alert => alert.status !== 'closed').map((alert) => {
          const alertDevice = devices.find(d => d.id === alert.device_id);
          console.log('Rendering alert:', alert.id, 'Chat visible:', alertChatVisible[alert.id]);
          return (
            <AlertDetailCard
              key={alert.id}
              alert={alert}
              device={alertDevice}
              chatMessages={alertChatMessages[alert.id] || []}
              chatInput={alertChatInputs[alert.id] || ''}
              onChatInputChange={(value) => setAlertChatInputs(prev => ({
                ...prev,
                [alert.id]: value
              }))}
              onSendMessage={() => sendAlertMessage(alert.id)}
              onKeyPress={(e) => handleAlertKeyPress(e, alert.id)}
              onCloseAlert={() => closeAlert(alert.id)}
              onBlockDevice={() => alertDevice && updateDeviceStatus(alertDevice.id, 'blocked')}
              onUnblockDevice={() => alertDevice && updateDeviceStatus(alertDevice.id, 'safe')}
              isAnalysisVisible={alertChatVisible[alert.id] || false}
              onToggleAnalysis={() => getAIAnalysis(alert.id)}
            />
          );
        })}
      </div>
    </div>
    );
  };

  const renderDevices = () => (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                  <Monitor className="h-5 w-5 text-primary" />
                </div>
                <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Device Management</p>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}` 
                    : user?.email}
                </h2>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddDevice(true)}
              className="btn-primary border border-primary/20 shadow-professional"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Device
            </Button>
          </div>
          <div className="mt-6">
            <h1 className="text-5xl font-bold text-foreground mb-2">My Devices</h1>
            <p className="text-lg text-muted-foreground">Manage and monitor all connected devices</p>
          </div>
        </div>
      </div>

      {/* Enhanced Add Device Form */}
      {showAddDevice && (
        <Card className="border-2 border-[hsl(var(--ocean-blue))]/50 shadow-2xl bg-gradient-to-r from-[hsl(var(--ice-blue))]/20 to-[hsl(var(--cerulean-blue))]/10 animate-scale-in">
          <CardHeader className="border-b border-[hsl(var(--azure-blue))]/40 bg-gradient-to-r from-[hsl(var(--ice-blue))]/30 to-[hsl(var(--cerulean-blue))]/15">
            <CardTitle className="text-xl font-bold text-[hsl(var(--deep-blue))] flex items-center gap-3">
              <Plus className="w-6 h-6 text-[hsl(var(--ocean-blue))] animate-pulse" />
              <span className="bg-gradient-to-r from-[hsl(var(--deep-blue))] to-[hsl(var(--electric-blue))] bg-clip-text text-transparent">Add New Device</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-fade-in [animation-delay:100ms]">
                <Label htmlFor="deviceName" className="text-base font-semibold text-[hsl(var(--deep-blue))]">Device Name</Label>
                <Input
                  id="deviceName"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Enter device name"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:200ms]">
                <Label htmlFor="ipAddress" className="text-base font-semibold text-[hsl(var(--deep-blue))]">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                  placeholder="192.168.1.1"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:300ms]">
                <Label htmlFor="clientId" className="text-base font-semibold text-[hsl(var(--deep-blue))]">Client ID (Optional)</Label>
                <Input
                  id="clientId"
                  value={newDevice.client_id}
                  onChange={(e) => setNewDevice({ ...newDevice, client_id: e.target.value })}
                  placeholder="device_123 (for IoT devices)"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:400ms]">
                <Label htmlFor="macAddress" className="text-base font-semibold text-[hsl(var(--deep-blue))]">MAC Address (Optional)</Label>
                <Input
                  id="macAddress"
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice({ ...newDevice, mac: e.target.value })}
                  placeholder="00:00:00:00:00:00"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6 pt-4 border-t border-[hsl(var(--azure-blue))]/30 animate-fade-in [animation-delay:500ms]">
              <Button 
                onClick={addDevice}
                className="btn-primary bg-gradient-to-r from-[hsl(var(--ocean-blue))] to-[hsl(var(--electric-blue))] hover:from-[hsl(var(--deep-blue))] hover:to-[hsl(var(--azure-blue))] border border-[hsl(var(--ocean-blue))]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Add Device
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDevice(false)}
                className="border border-[hsl(var(--azure-blue))]/60 bg-gradient-to-r from-[hsl(var(--ice-blue))]/20 to-[hsl(var(--cerulean-blue))]/10 text-[hsl(var(--ocean-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--azure-blue))]/25 hover:to-[hsl(var(--cerulean-blue))]/20 transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
        <div className="grid gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl hover:shadow-[0_25px_50px_-12px_hsl(var(--dark-sky-blue-light))]/25 transition-all duration-500 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-[hsl(var(--dark-sky-blue-light))]/5 hover:from-[hsl(var(--dark-sky-blue-subtle))]/25 animate-fade-in hover:scale-[1.02]">
            <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/10">
                    {getStatusIcon(device.status)}
                  </div>
                  <CardTitle className="text-xl font-semibold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors">{device.device_name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${
                      device.status === 'safe' ? 'border-[hsl(var(--dark-sky-blue))]/60 bg-[hsl(var(--dark-sky-blue-subtle))]/30 text-[hsl(var(--dark-sky-blue))]' :
                      device.status === 'threat' ? 'border-warning/40 bg-warning/10 text-warning' :
                      'border-danger/40 bg-danger/10 text-danger'
                    } font-semibold animate-pulse`}
                  >
                    {device.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-muted-foreground border border-[hsl(var(--dark-sky-blue))]/40 px-3 py-1 rounded-lg bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/30 to-[hsl(var(--dark-sky-blue-light))]/20">
                  Connected: {new Date(device.connected_since).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10 border border-[hsl(var(--dark-sky-blue))]/40 rounded-lg">
                  <span className="font-semibold text-[hsl(var(--dark-sky-blue))]">IP Address:</span>
                  <p className="text-[hsl(var(--dark-sky-blue))] font-mono mt-1 font-medium">{device.ip_address}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10 border border-[hsl(var(--dark-sky-blue))]/40 rounded-lg">
                  <span className="font-semibold text-[hsl(var(--dark-sky-blue))]">MAC Address:</span>
                  <p className="text-[hsl(var(--dark-sky-blue))] font-mono mt-1 font-medium">{device.mac_address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-[hsl(var(--dark-sky-blue))]/30">
                {device.ip_address && (
                  <>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="border border-destructive/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => updateDeviceStatus(device.id, 'blocked')}
                      disabled={device.status === 'blocked'}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Block
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border border-[hsl(var(--dark-sky-blue))]/60 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--dark-sky-blue))]/20 hover:to-[hsl(var(--dark-sky-blue-light))]/15 transition-all duration-300 hover:scale-105"
                      onClick={() => updateDeviceStatus(device.id, 'safe')}
                      disabled={device.status === 'safe'}
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Unblock
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="border border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue))]/15 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--dark-sky-blue))]/25 hover:to-[hsl(var(--dark-sky-blue-light))]/20 transition-all duration-300 hover:scale-105"
                  onClick={() => openEditDevice(device)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-muted-foreground">Account Configuration</p>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}` 
                  : user?.email}
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-5xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-lg text-muted-foreground">Manage your account and device preferences</p>
          </div>
        </div>
      </div>
      
      <Card className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-transparent animate-fade-in">
        <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10">
          <CardTitle className="text-xl font-bold text-[hsl(var(--dark-sky-blue))] flex items-center gap-3">
            <Settings className="w-6 h-6 text-[hsl(var(--dark-sky-blue))] animate-pulse" />
            <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="animate-fade-in [animation-delay:100ms]">
              <Label className="text-base font-semibold text-[hsl(var(--dark-sky-blue))]">Email</Label>
              <Input 
                value={user?.email || ''} 
                disabled 
                className="mt-2 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] font-medium"
              />
            </div>
            <div className="animate-fade-in [animation-delay:200ms]">
              <Label className="text-base font-semibold text-[hsl(var(--dark-sky-blue))]">User ID</Label>
              <Input 
                value={user?.id || ''} 
                disabled 
                className="mt-2 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] font-medium font-mono text-sm"
              />
            </div>
            <div className="pt-4 border-t border-[hsl(var(--dark-sky-blue))]/30 animate-fade-in [animation-delay:300ms]">
              <Button 
                onClick={signOut}
                variant="destructive"
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* Enhanced Registered Devices Section */}
      <Card className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-transparent animate-fade-in">
        <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10">
          <CardTitle className="text-xl font-bold text-[hsl(var(--dark-sky-blue))] flex items-center gap-3">
            <Monitor className="w-6 h-6 text-[hsl(var(--dark-sky-blue))] animate-pulse" />
            <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Registered Devices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border-2 border-border/30 rounded-xl bg-background/50 hover:shadow-professional transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-foreground text-lg">{device.device_name}</span>
                    {getStatusIcon(device.status)}
                    <Badge 
                      className={`${
                        device.status === 'safe' ? 'border-success/40 bg-success/10 text-success' :
                        device.status === 'threat' ? 'border-warning/40 bg-warning/10 text-warning' :
                        'border-danger/40 bg-danger/10 text-danger'
                      } font-semibold border`}
                    >
                      {device.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground/70 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span>IP:</span>
                      <span className="font-mono text-foreground">{device.ip_address}</span>
                    </div>
                    {device.mac_address && (
                      <div className="flex items-center space-x-2">
                        <span>MAC:</span>
                        <span className="font-mono text-foreground">{device.mac_address}</span>
                      </div>
                    )}
                    {device.client_id && (
                      <div className="flex items-center space-x-2">
                        <span>Client ID:</span>
                        <span className="font-mono text-foreground">{device.client_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-border/40"
                    onClick={() => openEditDevice(device)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Device
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="border border-destructive/20"
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Professional Navigation Header with Glassmorphism */}
      <nav className="bg-gradient-to-r from-card/95 via-card/98 to-card/95 border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <img src="/logo-shield.png" alt="AuraShield logo" className="h-10 w-10 relative z-10 object-contain group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary via-[hsl(var(--dark-sky-blue))] to-primary bg-clip-text text-transparent">
                    AuraShield
                  </span>
                  <p className="text-xs text-muted-foreground font-medium">Security Platform</p>
                </div>
              </div>

            {/* Desktop Navigation */}
              <div className="hidden lg:ml-12 lg:flex lg:space-x-2 lg:mr-4">
                <button
                  onClick={() => setCurrentPage('overview')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative group ${
                    currentPage === 'overview'
                      ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground shadow-xl shadow-primary/30 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('alerts')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative group ${
                    currentPage === 'alerts'
                      ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground shadow-xl shadow-primary/30 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                  {alerts.filter(a => a.status === 'unresolved').length > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold px-1.5 animate-pulse">
                      {alerts.filter(a => a.status === 'unresolved').length}
                    </Badge>
                  )}
                </button>
                
                <Link
                  to="/siem-dashboard"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>SIEM</span>
                </Link>
                
                <Link
                  to="/reports"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105"
                >
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
                
                <button
                  onClick={() => setCurrentPage('devices')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative group ${
                    currentPage === 'devices'
                      ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground shadow-xl shadow-primary/30 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Devices</span>
                </button>
                
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative group ${
                    currentPage === 'settings'
                      ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground shadow-xl shadow-primary/30 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ModeToggle />

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2 border-t border-border/50 mt-2 animate-fade-in">
              <button
                onClick={() => {
                  setCurrentPage('overview');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-3 ${
                  currentPage === 'overview'
                    ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Overview</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('alerts');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
                  currentPage === 'alerts'
                    ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5" />
                  <span>Alerts</span>
                </div>
                {alerts.filter(a => a.status === 'unresolved').length > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground">
                    {alerts.filter(a => a.status === 'unresolved').length}
                  </Badge>
                )}
              </button>
              
              <Link
                to="/siem-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-3 text-muted-foreground hover:bg-accent"
              >
                <BarChart3 className="w-5 h-5" />
                <span>SIEM Dashboard</span>
              </Link>
              
              <Link
                to="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-3 text-muted-foreground hover:bg-accent"
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </Link>
              
              <button
                onClick={() => {
                  setCurrentPage('devices');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-3 ${
                  currentPage === 'devices'
                    ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>Devices</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center space-x-3 ${
                  currentPage === 'settings'
                    ? 'bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'overview' && renderOverview()}
        {currentPage === 'alerts' && renderAlerts()}
        {currentPage === 'devices' && renderDevices()}
        {currentPage === 'settings' && renderSettings()}
      </main>

      {/* Floating Aura Assistant Button */}
      <button
        onClick={() => {
          setButtonClicked(true);
          setTimeout(() => {
            setIsChatOpen(true);
            setButtonClicked(false);
          }, 300);
        }}
        onMouseEnter={() => {
          if (barkAudioRef.current) {
            barkAudioRef.current.currentTime = 0;
            barkAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
          }
        }}
        className={`fixed bottom-8 right-8 z-40 group ${
          buttonClicked ? 'animate-scale-in' : ''
        }`}
        aria-label="Open Aura Assistant"
      >
        {/* Main Button Container - No background, just flex layout */}
        <div className="relative flex flex-col items-center gap-2 transition-all duration-500 group-hover:scale-110">
          
          {/* Guard Dog Image - Main button element */}
          <div className="relative">
            {/* Animated glow rings behind dog */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] rounded-full blur-2xl opacity-40 animate-pulse scale-125 group-hover:opacity-60 group-hover:scale-150 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(var(--dark-sky-blue))] rounded-full blur-xl opacity-30 animate-ping"></div>
            
            {/* "Hey!" Speech Bubble */}
            <div className="absolute -left-16 top-4 z-20 animate-fade-in">
              <div className="relative bg-gradient-to-br from-primary to-[hsl(var(--dark-sky-blue))] text-primary-foreground px-3 py-1.5 rounded-full shadow-lg shadow-primary/50 animate-pulse">
                <span className="font-bold text-sm">hey !</span>
                {/* Cloud-like tail */}
                <div className="absolute -right-1 bottom-2 w-3 h-3 bg-gradient-to-br from-primary to-[hsl(var(--dark-sky-blue))] rounded-full"></div>
                <div className="absolute right-0 bottom-0 w-2 h-2 bg-gradient-to-br from-primary to-[hsl(var(--dark-sky-blue))] rounded-full"></div>
              </div>
            </div>
            
            {/* Guard Dog Image */}
            <img 
              src={guarddogImage} 
              alt="Aura Guard Dog Assistant" 
              className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] group-hover:drop-shadow-[0_0_40px_rgba(59,130,246,1)] transition-all duration-300 group-hover:scale-105"
            />
            
            {/* Sparkle effects */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/80"></div>
            <div className="absolute top-1/4 -left-2 w-2 h-2 bg-[hsl(var(--dark-sky-blue))] rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Text Label with icon */}
          <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 via-[hsl(var(--dark-sky-blue))]/20 to-primary/20 backdrop-blur-sm rounded-full border border-primary/30 shadow-lg shadow-primary/20 group-hover:border-primary/50 group-hover:shadow-primary/40 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-primary drop-shadow-lg animate-pulse" />
            <span className="text-foreground font-bold text-sm whitespace-nowrap drop-shadow-md group-hover:tracking-wide transition-all duration-300">
              Aura Assistant
            </span>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[hsl(var(--dark-sky-blue))] rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </button>

      {/* Aura Chat */}
      <AuraChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Audio element for bark sound */}
      <audio ref={barkAudioRef} src={barkSound} preload="auto" />
    </div>
  );
};

export default Dashboard;