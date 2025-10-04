import { Shield } from 'lucide-react';
import AuraChat from '@/components/AuraChat';
import { useState } from 'react';

const AuraAssistant = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo-shield.png" alt="AuraShield logo" className="w-12 h-12 object-contain" />
            <h1 className="text-4xl font-bold">Aura Assistant</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for smart home security. Ask questions, check device status, 
            and get instant insights about your home protection.
          </p>
        </div>

        <div className="max-w-4xl mx-auto h-[600px] border rounded-lg bg-background shadow-lg overflow-hidden">
          <AuraChat isOpen={true} onClose={() => {}} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Device Control</h3>
            <p className="text-sm text-muted-foreground">
              Check status and monitor all your connected security devices
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Security Alerts</h3>
            <p className="text-sm text-muted-foreground">
              View and understand recent alerts and security events
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Smart Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered recommendations and troubleshooting help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraAssistant;
