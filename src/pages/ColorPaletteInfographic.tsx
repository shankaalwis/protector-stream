import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

const ColorPaletteInfographic = () => {
  const colorGroups = [
    {
      title: "Primary Brand Identity",
      description: "Dark Sky Blue - Trust, Intelligence & Stability",
      icon: Shield,
      colors: [
        {
          name: "Dark Sky Blue",
          variable: "--dark-sky-blue",
          hsl: "200 100% 30%",
          usage: "Primary brand color, buttons, headers, key UI elements",
          class: "bg-[hsl(200,100%,30%)]",
        },
        {
          name: "Dark Sky Blue Light",
          variable: "--dark-sky-blue-light",
          hsl: "200 100% 35%",
          usage: "Hover states, lighter accents",
          class: "bg-[hsl(200,100%,35%)]",
        },
        {
          name: "Dark Sky Blue Dark",
          variable: "--dark-sky-blue-dark",
          hsl: "200 100% 25%",
          usage: "Active states, darker accents",
          class: "bg-[hsl(200,100%,25%)]",
        },
        {
          name: "Dark Sky Blue Lighter",
          variable: "--dark-sky-blue-lighter",
          hsl: "200 100% 40%",
          usage: "Subtle highlights, backgrounds",
          class: "bg-[hsl(200,100%,40%)]",
        },
        {
          name: "Dark Sky Blue Subtle",
          variable: "--dark-sky-blue-subtle",
          hsl: "200 50% 85%",
          usage: "Very light backgrounds, borders",
          class: "bg-[hsl(200,50%,85%)]",
        },
      ],
    },
    {
      title: "Alert Severity Status",
      description: "Semantic Coding for ML Anomaly Detection",
      icon: AlertTriangle,
      colors: [
        {
          name: "Critical (Red)",
          variable: "--danger",
          hsl: "354 70% 54%",
          usage: "Critical threats, immediate action required, blocked status",
          class: "bg-[hsl(354,70%,54%)]",
          severity: "CRITICAL",
        },
        {
          name: "Alert Red (Triggered)",
          variable: "--alert-red",
          hsl: "0 84% 60%",
          usage: "Active triggered alerts, requires urgent attention",
          class: "bg-[hsl(0,84%,60%)]",
          severity: "TRIGGERED",
        },
        {
          name: "High (Amber/Orange)",
          variable: "--warning",
          hsl: "45 100% 51%",
          usage: "High-priority threats, attention needed, elevated risk",
          class: "bg-[hsl(45,100%,51%)]",
          severity: "HIGH",
        },
        {
          name: "Low (Green)",
          variable: "--success",
          hsl: "134 61% 41%",
          usage: "Safe status, low-risk events, successful operations",
          class: "bg-[hsl(134,61%,41%)]",
          severity: "LOW",
        },
      ],
    },
    {
      title: "Alert Red Variants",
      description: "Dedicated Red Palette for Triggered Alerts",
      icon: XCircle,
      colors: [
        {
          name: "Alert Red",
          variable: "--alert-red",
          hsl: "0 84% 60%",
          usage: "Primary alert color for triggered anomalies",
          class: "bg-[hsl(0,84%,60%)]",
        },
        {
          name: "Alert Red Dark",
          variable: "--alert-red-dark",
          hsl: "0 84% 50%",
          usage: "Borders, darker accents for alerts",
          class: "bg-[hsl(0,84%,50%)]",
        },
        {
          name: "Alert Red Light",
          variable: "--alert-red-light",
          hsl: "0 84% 70%",
          usage: "Hover states, lighter alert backgrounds",
          class: "bg-[hsl(0,84%,70%)]",
        },
        {
          name: "Alert Red Subtle",
          variable: "--alert-red-subtle",
          hsl: "0 50% 90%",
          usage: "Very light backgrounds for alert cards",
          class: "bg-[hsl(0,50%,90%)]",
        },
      ],
    },
    {
      title: "Operational Status",
      description: "System & Network Status Indicators",
      icon: CheckCircle,
      colors: [
        {
          name: "Success Green",
          variable: "--success",
          hsl: "134 61% 41%",
          usage: "Operational, healthy systems, successful actions",
          class: "bg-[hsl(134,61%,41%)]",
        },
        {
          name: "Warning Amber",
          variable: "--warning",
          hsl: "45 100% 51%",
          usage: "Degraded performance, needs attention",
          class: "bg-[hsl(45,100%,51%)]",
        },
        {
          name: "Danger Red",
          variable: "--danger",
          hsl: "354 70% 54%",
          usage: "System failure, blocked devices, critical errors",
          class: "bg-[hsl(354,70%,54%)]",
        },
      ],
    },
    {
      title: "Interface Foundation",
      description: "Base Colors for Light & Dark Modes",
      icon: Info,
      colors: [
        {
          name: "Background",
          variable: "--background",
          hsl: "0 0% 100% (Light) / 222.2 84% 4.9% (Dark)",
          usage: "Primary background for pages and main content areas",
          class: "bg-background border-2 border-border",
        },
        {
          name: "Foreground",
          variable: "--foreground",
          hsl: "0 0% 20% (Light) / 210 40% 98% (Dark)",
          usage: "Primary text color, high contrast reading",
          class: "bg-foreground",
        },
        {
          name: "Card Background",
          variable: "--card",
          hsl: "0 0% 100% (Light) / 222.2 84% 4.9% (Dark)",
          usage: "Background for cards, panels, and sections",
          class: "bg-card border-2 border-border",
        },
        {
          name: "Muted",
          variable: "--muted",
          hsl: "240 5% 96% (Light) / 217.2 32.6% 17.5% (Dark)",
          usage: "Muted backgrounds, secondary sections",
          class: "bg-muted",
        },
        {
          name: "Border",
          variable: "--border",
          hsl: "240 6% 75% (Light) / 217.2 32.6% 25% (Dark)",
          usage: "Borders, dividers, separators",
          class: "bg-border",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
            A comprehensive color system designed for rapid security response, low cognitive load, 
            and absolute user trust in high-stakes threat detection scenarios.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Info className="h-4 w-4" />
            All colors use HSL format for consistent theming across light and dark modes
          </div>
        </div>

        {/* Color Groups */}
        {colorGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="p-8 space-y-6 card-professional">
            {/* Group Header */}
            <div className="flex items-start gap-4 border-b border-border pb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <group.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-foreground mb-1">
                  {group.title}
                </h3>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-1 gap-4">
              {group.colors.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="flex items-stretch gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  {/* Color Swatch */}
                  <div className="flex-shrink-0 space-y-2">
                    <div
                      className={`w-32 h-32 rounded-xl shadow-lg ${color.class} flex items-center justify-center text-white font-mono text-xs`}
                    >
                      {color.severity && (
                        <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm font-semibold">
                          {color.severity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Color Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        {color.name}
                      </h4>
                      <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">
                        {color.variable}
                      </code>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        HSL Value:
                      </p>
                      <code className="text-sm font-mono text-foreground bg-muted px-3 py-1.5 rounded-lg block w-fit">
                        hsl({color.hsl})
                      </code>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Usage Context:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {color.usage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Design Principles Footer */}
        <Card className="p-8 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Design Principles
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">🎯 Semantic Clarity</h4>
              <p className="text-muted-foreground">
                Colors instantly communicate threat severity and system status without reading text
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">⚡ Rapid Response</h4>
              <p className="text-muted-foreground">
                High-contrast dark mode and semantic coding enable TTR &lt; 5 seconds
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">🛡️ Trust & Reliability</h4>
              <p className="text-muted-foreground">
                Professional Dark Sky Blue palette conveys stability and intelligence
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ColorPaletteInfographic;
