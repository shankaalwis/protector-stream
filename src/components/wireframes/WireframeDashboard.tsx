import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Shield, AlertTriangle, Activity, Monitor, TrendingUp, Users, Menu } from "lucide-react";

const WireframeDashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Main Dashboard - Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wireframe */}
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          {/* Header with Navigation */}
          <div className="mb-4 pb-4 border-b-2 border-slate-400 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 px-3 bg-primary/10 border border-primary/20 rounded flex items-center">
                  <div className="h-2 w-16 bg-primary/40 rounded"></div>
                </div>
                <div className="h-8 px-3 bg-slate-200 dark:bg-slate-800 rounded flex items-center">
                  <div className="h-2 w-16 bg-slate-400 dark:bg-slate-600 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          {/* 12-Column Grid Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Critical Alerts - TIER 1 (8 columns) */}
            <div className="col-span-8 relative">
              <div className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded font-bold z-10">
                TIER 1 - CRITICAL
              </div>
              <div className="bg-destructive/10 dark:bg-destructive/20 border-4 border-destructive rounded-lg p-4 min-h-[180px]">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-destructive/30 rounded"></div>
                    <div className="h-3 w-full bg-destructive/20 rounded"></div>
                    <div className="h-3 w-3/4 bg-destructive/20 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-32 bg-destructive rounded"></div>
                  <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>

            {/* Network Health (4 columns) */}
            <div className="col-span-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[180px]">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="flex items-center justify-center h-20">
                  <div className="w-20 h-20 rounded-full border-8 border-success border-t-slate-300 dark:border-t-slate-700"></div>
                </div>
                <div className="text-center mt-3">
                  <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
                </div>
              </div>
            </div>

            {/* ML Anomaly Chart (6 columns) */}
            <div className="col-span-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="relative h-24 flex items-end gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-warning/30 rounded-t"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Network Metrics (6 columns) */}
            <div className="col-span-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <div className="h-6 w-10 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
                  </div>
                  <div className="text-center p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <div className="h-6 w-10 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
                  </div>
                  <div className="text-center p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <div className="h-6 w-10 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Devices List (12 columns) */}
            <div className="col-span-12">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-8 px-3 bg-primary rounded flex items-center">
                    <div className="h-2 w-20 bg-primary-foreground/30 rounded"></div>
                  </div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded mb-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                      <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-6 w-16 bg-success/20 border border-success/30 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary">Design Rationale</h3>
          <p className="text-muted-foreground leading-relaxed">
            The Main Dashboard employs the <strong>F-Pattern reading structure</strong> with a strict 
            <strong> 12-column modular grid</strong>. Critical alerts occupy the top-left (Tier 1 position) 
            for immediate visibility, while supporting metrics are organized into predictable, uniform blocks. 
            This layout enables operators to identify and respond to threats within the TTR &lt; 5s target.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeDashboard;
