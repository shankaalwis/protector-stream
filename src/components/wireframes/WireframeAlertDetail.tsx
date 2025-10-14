import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChevronDown, Send } from "lucide-react";

const WireframeAlertDetail = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Alert Detail - LLM Guidance & Mitigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-4 border-purple-500 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="h-4 w-40 bg-purple-300 dark:bg-purple-800 rounded"></div>
            </div>

            <div className="space-y-3 mb-4">
              {['Probable Causes', 'Recommended Actions'].map((title, i) => (
                <div key={i} className="bg-white/50 dark:bg-slate-900/30 border-2 border-purple-300 rounded p-3">
                  <div className="flex justify-between mb-2">
                    <div className="h-3 w-32 bg-purple-400 rounded"></div>
                    <ChevronDown className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="space-y-2 pl-4">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="h-2 bg-purple-200 dark:bg-purple-900 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-12 bg-destructive rounded flex items-center justify-center">
              <div className="h-3 w-48 bg-destructive-foreground/30 rounded"></div>
            </div>
          </div>

          <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 rounded-lg p-4">
            <div className="h-32 mb-3 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-white dark:bg-slate-900 border-2 rounded"></div>
              <div className="w-10 h-10 bg-purple-500 rounded flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary">Design Rationale</h3>
          <p className="text-muted-foreground leading-relaxed">
            LLM Guidance Card with high-contrast styling, collapsible sections, and prominent action button for rapid threat mitigation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeAlertDetail;
