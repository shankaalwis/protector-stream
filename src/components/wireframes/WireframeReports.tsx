import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Download, Eye } from "lucide-react";

const WireframeReports = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Reports Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wireframe */}
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6 mb-4">
            <div className="h-6 w-48 bg-primary/40 rounded mb-2"></div>
            <div className="h-4 w-72 bg-primary/20 rounded"></div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Panel - Report Configuration */}
            <div className="col-span-1 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-4">
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-4"></div>
                
                {/* Date Range */}
                <div className="space-y-3 mb-4">
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="flex items-center gap-2 h-10 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="flex items-center gap-2 h-10 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>

                {/* Data Type Checkboxes */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
                  {['Devices', 'Alerts', 'Anomalies', 'Metrics'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded"></div>
                      <div className="h-2 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <div className="h-10 bg-primary rounded flex items-center justify-center">
                  <div className="h-3 w-28 bg-primary-foreground/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Right Panel - Report Preview/Results */}
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-9 px-3 bg-slate-200 dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <div className="h-2 w-12 bg-slate-400 dark:bg-slate-600 rounded"></div>
                  </div>
                  <div className="h-9 px-3 bg-slate-200 dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <div className="h-2 w-12 bg-slate-400 dark:bg-slate-600 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['Total Devices', 'Security Alerts', 'Anomalies', 'Metrics'].map((item, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-3">
                    <div className="h-2 w-24 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-6 w-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>

              {/* Data Tables */}
              <div className="space-y-3">
                <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded mb-2"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <div className="h-2 w-1/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    <div className="h-2 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-2 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-2 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
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
            The Reports page uses a <strong>two-panel layout</strong>: configuration on the left, results on the right. 
            This spatial separation creates a clear workflow—select parameters, generate, then review and export. 
            Multiple export formats (PDF, CSV) cater to different use cases (presentations vs. data analysis).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeReports;
