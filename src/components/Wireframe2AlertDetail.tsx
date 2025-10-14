import { Sparkles, ChevronDown, Send, Shield, Clock, MapPin } from "lucide-react";

const Wireframe2AlertDetail = () => {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
      <div className="space-y-4">
        {/* Alert Header */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-64 bg-slate-300 dark:bg-slate-700 rounded"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-red-500 rounded text-xs flex items-center justify-center text-white font-bold">
                  CRITICAL
                </div>
                <div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* TIER 1: LLM Guidance Card */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 bg-purple-500 text-white text-xs px-3 py-1 rounded font-bold z-10 shadow-lg">
            TIER 1 - AI GUIDANCE
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-4 border-purple-500 dark:border-purple-600 rounded-lg p-5 shadow-lg">
            {/* AI Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-200 dark:border-purple-800">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-4 w-40 bg-purple-300 dark:bg-purple-800 rounded mb-2"></div>
                <div className="h-2 w-56 bg-purple-200 dark:bg-purple-900 rounded"></div>
              </div>
            </div>

            {/* Collapsible Section 1: Probable Causes */}
            <div className="mb-3 bg-white/50 dark:bg-slate-900/30 border-2 border-purple-300 dark:border-purple-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 w-32 bg-purple-400 dark:bg-purple-700 rounded"></div>
                <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="h-2 flex-1 bg-purple-200 dark:bg-purple-900 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="h-2 flex-1 bg-purple-200 dark:bg-purple-900 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="h-2 w-3/4 bg-purple-200 dark:bg-purple-900 rounded"></div>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                ↑ Collapsible Section (Progressive Disclosure)
              </div>
            </div>

            {/* Collapsible Section 2: Recommended Actions */}
            <div className="mb-4 bg-white/50 dark:bg-slate-900/30 border-2 border-purple-300 dark:border-purple-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 w-40 bg-purple-400 dark:bg-purple-700 rounded"></div>
                <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="h-2 flex-1 bg-purple-200 dark:bg-purple-900 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                  <div className="h-2 flex-1 bg-purple-200 dark:bg-purple-900 rounded"></div>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                ↑ Structured Output (Reduces Cognitive Load)
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="relative">
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold z-10 whitespace-nowrap">
                PRIMARY CTA
              </div>
              <div className="h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <div className="h-3 w-48 bg-red-300 rounded"></div>
              </div>
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-semibold text-center">
                ↑ Full-Width Action Button (Fastest Path to Mitigation)
              </div>
            </div>

            {/* Visual Isolation Indicator */}
            <div className="mt-3 text-xs text-purple-700 dark:text-purple-300 font-bold text-center bg-purple-200 dark:bg-purple-900 rounded p-2">
              ⚡ High-contrast styling ensures card cannot be overlooked
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 bg-blue-500 text-white text-xs px-3 py-1 rounded font-bold z-10">
            CHAT INTERFACE
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
            {/* Chat Messages */}
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {/* AI Message */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-2 justify-end">
                <div className="flex-1 max-w-xs space-y-1">
                  <div className="h-2 w-full bg-blue-200 dark:bg-blue-900 rounded"></div>
                  <div className="h-2 w-2/3 bg-blue-200 dark:bg-blue-900 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0"></div>
              </div>

              {/* AI Response */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-2 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2 pt-3 border-t-2 border-slate-300 dark:border-slate-600">
              <div className="flex-1 h-10 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg"></div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              ↑ Conversational Follow-Up (Maintains Workflow Continuity)
            </div>
          </div>
        </div>

        {/* Device/Alert Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
          <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* Design Principle Summary */}
        <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded border border-slate-400 dark:border-slate-600">
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
            <div><strong>Progressive Disclosure:</strong> Collapsible sections manage info density</div>
            <div><strong>Visual Isolation:</strong> High-contrast LLM card ensures visibility</div>
            <div><strong>Action Priority:</strong> Full-width button = fastest mitigation path</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wireframe2AlertDetail;
