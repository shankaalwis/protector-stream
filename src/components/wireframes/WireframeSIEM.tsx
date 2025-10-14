import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Activity, Shield, TrendingUp, AlertTriangle, Users } from "lucide-react";

const WireframeSIEM = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          SIEM Dashboard - Security Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wireframe */}
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 w-48 bg-primary/40 rounded mb-2"></div>
                <div className="h-4 w-64 bg-primary/20 rounded"></div>
              </div>
              <div className="h-10 px-4 bg-slate-200 dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded flex items-center">
                <div className="h-2 w-24 bg-slate-400 dark:bg-slate-600 rounded"></div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Message Throughput (Full Width) */}
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 border-2 border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <div className="h-3 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="relative h-40">
                <svg className="w-full h-full" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M 0 120 Q 50 80, 100 90 T 200 100 T 300 70 T 400 90 L 400 160 L 0 160 Z" 
                    fill="url(#areaGradient)" stroke="hsl(var(--primary))" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            {/* Auth Failures Gauge */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex items-center justify-center h-32">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="12"/>
                    <circle cx="56" cy="56" r="45" fill="none" stroke="hsl(var(--destructive))" strokeWidth="12"
                      strokeDasharray="200" strokeDashoffset="50"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Successful Connections Gauge */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-success" />
                <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex items-center justify-center h-32">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="12"/>
                    <circle cx="56" cy="56" r="45" fill="none" stroke="hsl(var(--success))" strokeWidth="12"
                      strokeDasharray="200" strokeDashoffset="120"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomaly Trend */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-warning/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-warning" />
                <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-28 flex items-end gap-2">
                {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                  <div key={i} className="flex-1 bg-warning/40 rounded-t" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>

            {/* Recent Anomalies Table */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-3"></div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between p-2 bg-slate-100 dark:bg-slate-900 rounded mb-2">
                  <div className="h-2 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="h-2 w-12 bg-warning/40 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary">Design Rationale</h3>
          <p className="text-muted-foreground leading-relaxed">
            The SIEM Dashboard prioritizes <strong>data visualization</strong> with prominent charts and gauges 
            for real-time security intelligence. Color-coded metrics (red for failures, green for success) provide 
            instant status assessment. The full-width throughput chart allows operators to spot anomalous traffic 
            patterns immediately.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeSIEM;
