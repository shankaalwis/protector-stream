import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Sparkles, Send } from "lucide-react";

const WireframeAura = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Aura Assistant - AI Chat Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          <div className="text-center mb-4">
            <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
            <div className="h-3 w-96 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-primary/20 rounded-lg p-4 h-96">
            <div className="space-y-3 h-80 overflow-hidden mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                  <div className={`flex gap-2 max-w-xs ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${i % 2 === 0 ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/20'}`}>
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
                        <div className="h-2 w-3/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded"></div>
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary">Design Rationale</h3>
          <p className="text-muted-foreground leading-relaxed">
            Conversational interface for AI assistance with clear message bubbles and send functionality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeAura;
