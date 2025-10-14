import { AlertTriangle, Shield, Activity, Users, Network, TrendingUp } from "lucide-react";

const Wireframe1Dashboard = () => {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
      {/* Grid overlay visualization */}
      <div className="relative">
        {/* Header */}
        <div className="mb-4 pb-4 border-b-2 border-slate-400 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
              <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* Main Grid - 12 columns */}
        <div className="grid grid-cols-12 gap-4">
          {/* TIER 1: Critical Alerts - Top Left (Spans 8 columns) */}
          <div className="col-span-8 relative">
            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
              TIER 1 - CRITICAL
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border-4 border-red-500 rounded-lg p-4 min-h-[200px]">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-red-200 dark:bg-red-900 rounded"></div>
                  <div className="h-3 w-full bg-red-100 dark:bg-red-950 rounded"></div>
                  <div className="h-3 w-3/4 bg-red-100 dark:bg-red-950 rounded"></div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-24 bg-red-500 rounded"></div>
                <div className="h-8 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 font-semibold">
                ↑ F-Pattern Primary Fixation Point
              </div>
            </div>
          </div>

          {/* Aura Guardian - Top Right (Spans 4 columns) */}
          <div className="col-span-4 relative">
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
              GUARDIAN
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="h-3 w-28 bg-blue-200 dark:bg-blue-900 rounded mb-2"></div>
              <div className="h-2 w-20 bg-blue-100 dark:bg-blue-950 rounded"></div>
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-semibold text-center">
                ↑ Non-competing<br/>Visual Anchor
              </div>
            </div>
          </div>

          {/* TIER 2: ML Anomaly Chart (Spans 6 columns) */}
          <div className="col-span-6 relative">
            <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
              TIER 2 - METRICS
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[160px]">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="relative h-24 flex items-end gap-1">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-slate-300 dark:bg-slate-700 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  ></div>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                ↑ Uniform Block (6-col span)
              </div>
            </div>
          </div>

          {/* TIER 2: Network Throughput (Spans 6 columns) */}
          <div className="col-span-6 relative">
            <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
              TIER 2 - METRICS
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[160px]">
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="h-3 w-36 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                ↑ Uniform Block (6-col span)
              </div>
            </div>
          </div>

          {/* TIER 2: Active Connections (Spans 4 columns) */}
          <div className="col-span-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[140px]">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="text-center mt-4">
                <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* TIER 2: Threat Level (Spans 4 columns) */}
          <div className="col-span-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[140px]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="text-center mt-4">
                <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* TIER 2: System Status (Spans 4 columns) */}
          <div className="col-span-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-[140px]">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="text-center mt-4">
                <div className="h-8 w-16 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Annotation */}
        <div className="mt-4 p-3 bg-slate-200 dark:bg-slate-800 rounded border border-slate-400 dark:border-slate-600">
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
            <div><strong>Grid System:</strong> 12-column modular layout</div>
            <div><strong>Spacing:</strong> 8px base scale (gap-4 = 16px)</div>
            <div><strong>F-Pattern:</strong> Critical alerts occupy top-left primary fixation zone</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wireframe1Dashboard;
