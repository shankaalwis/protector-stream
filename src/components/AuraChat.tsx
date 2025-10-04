import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, X, AlertCircle } from 'lucide-react';
import guarddogImage from '@/assets/guarddog.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

interface AuraChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuraChat = ({ isOpen, onClose }: AuraChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Aura, your smart home security assistant. How can I help protect your home today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://drwbehbecdrlklqydmbo.supabase.co/functions/v1/aura-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                return updated;
              });
            }
          } catch (e) {
            console.error('Failed to parse SSE:', e);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith(':') || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                return updated;
              });
            }
          } catch (e) {
            // Ignore partial JSON
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      setShowError(true);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      // Replace the empty assistant message with error message
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: 'assistant', 
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          error: true
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // Inline mode for standalone pages (like AuraAssistant)
  const isInlineMode = onClose === (() => {});

  if (isInlineMode) {
    return (
      <div className="h-full bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <img src={guarddogImage} alt="Aura" className="w-12 h-12 object-contain relative z-10 drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Aura</h2>
              <p className="text-sm text-muted-foreground">Smart Home Security Assistant</p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {showError && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 error-shake">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">Connection issue. Please try again.</p>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 message-blossom ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                    <img src={guarddogImage} alt="Aura" className="w-8 h-8 object-contain relative z-10 drop-shadow-md" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] transition-all ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : message.error
                      ? 'bg-destructive/10 border border-destructive/20'
                      : 'bg-muted shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start message-blossom">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                  <img src={guarddogImage} alt="Aura" className="w-8 h-8 object-contain relative z-10 drop-shadow-md" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted relative">
                  <div className="w-16 h-4 relative typing-light"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Aura about your home security..."
              disabled={isLoading}
              className="flex-1 transition-all focus:shadow-md"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example: "Is my front door locked?" or "Show me recent alerts"
          </p>
        </div>
      </div>
    );
  }

  // Popup mode for navigation panels - Floating Window
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/5 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Floating Chat Window */}
      <div className="absolute bottom-6 right-6 w-[400px] h-[600px] pointer-events-auto chat-panel-enter">
        <div className="h-full bg-background shadow-2xl flex flex-col rounded-2xl border overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                  <img src={guarddogImage} alt="Aura" className="w-12 h-12 object-contain relative z-10 drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Aura</h2>
                  <p className="text-sm text-muted-foreground">Smart Home Security Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-primary/10 transition-all"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {showError && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 error-shake">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">Connection issue. Please try again.</p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 message-blossom ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                      <img src={guarddogImage} alt="Aura" className="w-8 h-8 object-contain relative z-10 drop-shadow-md" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] transition-all ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : message.error
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-muted shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 justify-start message-blossom">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                    <img src={guarddogImage} alt="Aura" className="w-8 h-8 object-contain relative z-10 drop-shadow-md" />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted relative">
                    <div className="w-16 h-4 relative typing-light"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t flex-shrink-0 bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Aura about your home security..."
                disabled={isLoading}
                className="flex-1 transition-all focus:shadow-md"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Example: "Is my front door locked?" or "Show me recent alerts"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraChat;
