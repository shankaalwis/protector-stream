import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Shield, 
  ShieldCheck, 
  CheckCircle, 
  Send, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Clock,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AlertDetailCardProps {
  alert: SecurityAlert;
  device?: Device;
  chatMessages: Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}>;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onCloseAlert: () => void;
  onBlockDevice: () => void;
  onUnblockDevice: () => void;
  isAnalysisVisible: boolean;
  onToggleAnalysis: () => void;
}

const AlertDetailCard = ({ 
  alert, 
  device, 
  chatMessages, 
  chatInput, 
  onChatInputChange, 
  onSendMessage, 
  onKeyPress,
  onCloseAlert,
  onBlockDevice,
  onUnblockDevice,
  isAnalysisVisible,
  onToggleAnalysis
}: AlertDetailCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white border-red-600';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'medium': return 'bg-yellow-500 text-yellow-900 border-yellow-600';
      case 'low': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const cleanAlertDescription = (description: string) => {
    return description
      .replace(/security alert detected by splunk/gi, 'Security alert detected')
      .replace(/detected by splunk/gi, 'detected')
      .replace(/splunk security alert/gi, 'Security alert')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Parse AI analysis
  let analysisData = null;
  const aiResponse = alert.ai_analysis_chat.find(chat => chat.role === 'ai')?.content;
  if (aiResponse) {
    try {
      analysisData = JSON.parse(aiResponse);
    } catch {
      // If it's not JSON, treat as plain text
    }
  }

  return (
    <div className="w-full mx-auto">
      {/* Single Combined Card for Alert, AI Analysis, and Chat */}
      <Card className="shadow-lg rounded-xl border-2 border-border/50">
        {/* Alert Header and Summary Section */}
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2",
                getSeverityColor(alert.severity)
              )}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {alert.alert_type}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </div>
            <Badge className={cn("text-xs font-bold px-3 py-1", getSeverityColor(alert.severity))}>
              {alert.severity.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Device Info */}
          {device && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{device.device_name}</p>
                  <p className="text-xs text-muted-foreground">{device.ip_address}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {device.status.toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Alert Description */}
          <div className="space-y-2">
            <Collapsible open={showFullDescription} onOpenChange={setShowFullDescription}>
              <div className="text-sm text-foreground">
                {cleanAlertDescription(alert.description).length > 150 && !showFullDescription
                  ? `${cleanAlertDescription(alert.description).substring(0, 150)}...`
                  : cleanAlertDescription(alert.description)
                }
              </div>
              {cleanAlertDescription(alert.description).length > 150 && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                    {showFullDescription ? (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-3 w-3 mr-1" />
                        Show more
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </Collapsible>
          </div>

          {/* AI Summary */}
          {analysisData?.summary && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                AI Summary
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">{analysisData.summary}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-b border-border/30 pb-4">
            <Button
              onClick={onToggleAnalysis}
              variant="default"
              size="sm"
              className="gap-2"
              disabled={alert.status === 'closed'}
            >
              <BarChart3 className="h-4 w-4" />
              {isAnalysisVisible ? 'Hide Analysis' : 'AI Analysis'}
            </Button>
            
            <Button
              onClick={onCloseAlert}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={alert.status === 'closed'}
            >
              <CheckCircle className="h-4 w-4" />
              Resolve
            </Button>
            
            {device && device.status !== 'blocked' && (
              <Button
                onClick={onBlockDevice}
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={alert.status === 'closed'}
              >
                <Shield className="h-4 w-4" />
                Block Device
              </Button>
            )}
            
            {device && device.status === 'blocked' && (
              <Button
                onClick={onUnblockDevice}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Unblock Device
              </Button>
            )}
          </div>

          {/* AI Analysis Content - Tabbed Structure */}
          {isAnalysisVisible && analysisData && (
            <div className="border-t border-border/30 pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  AI Security Analysis
                </h3>
              </div>
              <Tabs defaultValue="causes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="causes" className="text-sm">Potential Causes</TabsTrigger>
                  <TabsTrigger value="actions" className="text-sm">Action Plan</TabsTrigger>
                </TabsList>
                
                <TabsContent value="causes" className="mt-4">
                  {analysisData.potential_causes && (
                    <div className="space-y-2">
                      {analysisData.potential_causes.map((cause: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-foreground">{cause}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="actions" className="mt-4">
                  {analysisData.mitigation_steps && (
                    <div className="space-y-2">
                      {analysisData.mitigation_steps.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Continue Discussion Chat Interface */}
          {isAnalysisVisible && (
            <div className="border-t border-border/30 pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Continue Discussion
                </h3>
              </div>
              <div className="space-y-4">
                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                  <ScrollArea className="h-64 w-full border rounded-lg p-3">
                    <div className="space-y-3">
                      {chatMessages.map((message, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground ml-4'
                                : 'bg-muted text-foreground mr-4'
                            )}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(message.timestamp, 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => onChatInputChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder="Ask about this alert..."
                    className="flex-1"
                  />
                  <Button
                    onClick={onSendMessage}
                    disabled={!chatInput.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertDetailCard;