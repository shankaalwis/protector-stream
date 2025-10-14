import { Shield } from "lucide-react";

const ColorPaletteInfographic = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Aura Shield
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-foreground">
            Color Palette & Semantic Use
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            HSL-based color system for rapid security response, low cognitive load, and absolute trust
          </p>
        </div>

        {/* Main Infographic Card */}
        <div className="bg-card border-2 border-border rounded-3xl p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN: Primary Brand & Alert Severity */}
            <div className="space-y-10">
              {/* Primary Brand Identity */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <h3 className="text-2xl font-bold text-foreground">Primary Brand Identity</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 italic">
                  Dark Sky Blue - Trust, Intelligence & Stability
                </p>
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(200,100%,30%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Base</p>
                    <p className="text-xs text-center text-muted-foreground">200 100% 30%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(200,100%,35%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Light</p>
                    <p className="text-xs text-center text-muted-foreground">200 100% 35%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(200,100%,25%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Dark</p>
                    <p className="text-xs text-center text-muted-foreground">200 100% 25%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(200,100%,40%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Lighter</p>
                    <p className="text-xs text-center text-muted-foreground">200 100% 40%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(200,50%,85%)] shadow-lg border border-border"></div>
                    <p className="text-xs font-mono text-center text-foreground">Subtle</p>
                    <p className="text-xs text-center text-muted-foreground">200 50% 85%</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Usage:</span> Buttons, headers, links, key UI elements, brand identity
                  </p>
                </div>
              </div>

              {/* Alert Severity Status */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                  <h3 className="text-2xl font-bold text-foreground">Alert Severity Status</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 italic">
                  Semantic Coding for ML Anomaly Detection
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 rounded-lg bg-[hsl(0,84%,60%)] shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TRIGGERED</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-foreground">Alert Red</p>
                      <p className="text-xs text-muted-foreground">hsl(0 84% 60%)</p>
                      <p className="text-xs text-muted-foreground mt-1">Active triggered alerts, urgent attention</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 rounded-lg bg-[hsl(354,70%,54%)] shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CRITICAL</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-foreground">Danger Red</p>
                      <p className="text-xs text-muted-foreground">hsl(354 70% 54%)</p>
                      <p className="text-xs text-muted-foreground mt-1">Critical threats, immediate action required</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 rounded-lg bg-[hsl(45,100%,51%)] shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">HIGH</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-foreground">Warning Amber</p>
                      <p className="text-xs text-muted-foreground">hsl(45 100% 51%)</p>
                      <p className="text-xs text-muted-foreground mt-1">High-priority threats, attention needed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 rounded-lg bg-[hsl(134,61%,41%)] shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">LOW</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-foreground">Success Green</p>
                      <p className="text-xs text-muted-foreground">hsl(134 61% 41%)</p>
                      <p className="text-xs text-muted-foreground mt-1">Safe status, low-risk events, successful operations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Alert Red Variants & Interface Foundation */}
            <div className="space-y-10">
              {/* Alert Red Variants */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[hsl(0,84%,60%)]"></div>
                  <h3 className="text-2xl font-bold text-foreground">Alert Red Variants</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 italic">
                  Dedicated Red Palette for Triggered Alerts
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(0,84%,60%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Base</p>
                    <p className="text-xs text-center text-muted-foreground">0 84% 60%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(0,84%,50%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Dark</p>
                    <p className="text-xs text-center text-muted-foreground">0 84% 50%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(0,84%,70%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Light</p>
                    <p className="text-xs text-center text-muted-foreground">0 84% 70%</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-24 rounded-lg bg-[hsl(0,50%,90%)] shadow-lg border border-border"></div>
                    <p className="text-xs font-mono text-center text-foreground">Subtle</p>
                    <p className="text-xs text-center text-muted-foreground">0 50% 90%</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-danger/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Usage:</span> Alert cards, borders, hover states, background emphasis
                  </p>
                </div>
              </div>

              {/* Interface Foundation */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-foreground"></div>
                  <h3 className="text-2xl font-bold text-foreground">Interface Foundation</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 italic">
                  Base Colors for Light & Dark Modes
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg bg-background border-2 border-border shadow-inner"></div>
                    <div className="flex-1">
                      <p className="text-xs font-mono font-semibold text-foreground">Background</p>
                      <p className="text-xs text-muted-foreground">Primary page background</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg bg-foreground shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-xs font-mono font-semibold text-foreground">Foreground</p>
                      <p className="text-xs text-muted-foreground">Primary text color</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg bg-card border-2 border-border shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-xs font-mono font-semibold text-foreground">Card</p>
                      <p className="text-xs text-muted-foreground">Cards, panels, sections</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg bg-muted shadow-inner"></div>
                    <div className="flex-1">
                      <p className="text-xs font-mono font-semibold text-foreground">Muted</p>
                      <p className="text-xs text-muted-foreground">Secondary backgrounds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 rounded-lg bg-border"></div>
                    <div className="flex-1">
                      <p className="text-xs font-mono font-semibold text-foreground">Border</p>
                      <p className="text-xs text-muted-foreground">Dividers, separators</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Status */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <h3 className="text-2xl font-bold text-foreground">Operational Status</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 italic">
                  System & Network Health Indicators
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-[hsl(134,61%,41%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Success</p>
                    <p className="text-xs text-center text-muted-foreground">Operational</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-[hsl(45,100%,51%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Warning</p>
                    <p className="text-xs text-center text-muted-foreground">Degraded</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-[hsl(354,70%,54%)] shadow-lg"></div>
                    <p className="text-xs font-mono text-center text-foreground">Danger</p>
                    <p className="text-xs text-center text-muted-foreground">Critical</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Principles Footer */}
          <div className="mt-12 pt-8 border-t-2 border-border">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Design Principles</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-foreground">Semantic Clarity</h4>
                <p className="text-sm text-muted-foreground">
                  Colors instantly communicate threat severity without reading text
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-foreground">Rapid Response</h4>
                <p className="text-sm text-muted-foreground">
                  High-contrast design enables TTR &lt; 5 seconds
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="font-semibold text-foreground">Trust & Reliability</h4>
                <p className="text-sm text-muted-foreground">
                  Professional palette conveys stability and intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteInfographic;
