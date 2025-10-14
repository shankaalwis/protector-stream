import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Grid3x3, Layers, Sparkles, Shield, Home, BarChart3, FileText, MessageSquare, LogIn } from "lucide-react";

const WireframeDocumentation = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Wireframe Diagrams and Design Artifacts
          </h1>
          <p className="text-lg text-muted-foreground">
            This section presents comprehensive wireframe diagrams for all pages in the Aura Shield Platform. 
            These wireframes demonstrate the application of core design principles—including the 12-column modular grid, 
            F-pattern visual hierarchy, and progressive disclosure—to create a security interface optimized for 
            rapid threat response (TTR &lt; 5 seconds) and minimal cognitive load.
          </p>
        </div>

        {/* Page Index */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Application Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#auth" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <LogIn className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Authentication</h3>
                </div>
                <p className="text-sm text-muted-foreground">Sign in and registration pages</p>
              </a>
              <a href="#dashboard" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Home className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Main Dashboard</h3>
                </div>
                <p className="text-sm text-muted-foreground">Overview, alerts, and devices</p>
              </a>
              <a href="#siem" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">SIEM Dashboard</h3>
                </div>
                <p className="text-sm text-muted-foreground">Security intelligence metrics</p>
              </a>
              <a href="#reports" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Reports</h3>
                </div>
                <p className="text-sm text-muted-foreground">Generate security reports</p>
              </a>
              <a href="#aura" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Aura Assistant</h3>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered chat interface</p>
              </a>
              <a href="#alert-detail" className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Alert Detail</h3>
                </div>
                <p className="text-sm text-muted-foreground">LLM guidance and mitigation</p>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Wireframe sections will be added via separate components */}
        <div id="auth" className="scroll-mt-8"><WireframeAuth /></div>
        <div id="dashboard" className="scroll-mt-8"><WireframeDashboard /></div>
        <div id="siem" className="scroll-mt-8"><WireframeSIEM /></div>
        <div id="reports" className="scroll-mt-8"><WireframeReports /></div>
        <div id="aura" className="scroll-mt-8"><WireframeAura /></div>
        <div id="alert-detail" className="scroll-mt-8"><WireframeAlertDetail /></div>

        {/* Design Principles Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Design Principles Synthesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              These wireframes collectively demonstrate the Aura Shield Platform's unwavering 
              commitment to the core design principles outlined in the Design Rationale. 
              The <strong>12-column modular grid</strong> ensures consistent scaling and professional alignment, 
              the <strong>F-Pattern visual hierarchy</strong> accelerates threat identification, and 
              <strong> progressive disclosure</strong> minimizes cognitive load while maximizing actionable intelligence. 
              The prominent placement and structured design of the <strong>LLM Guidance Card</strong> reflects 
              the platform's hybrid approach—combining machine learning anomaly detection with AI-powered 
              decision support—to achieve the mission-critical objective of Time-to-Response under 5 seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Individual wireframe components
import WireframeAuth from "@/components/wireframes/WireframeAuth";
import WireframeDashboard from "@/components/wireframes/WireframeDashboard";
import WireframeSIEM from "@/components/wireframes/WireframeSIEM";
import WireframeReports from "@/components/wireframes/WireframeReports";
import WireframeAura from "@/components/wireframes/WireframeAura";
import WireframeAlertDetail from "@/components/wireframes/WireframeAlertDetail";

export default WireframeDocumentation;
