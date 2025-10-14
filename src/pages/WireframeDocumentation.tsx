import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Grid3x3, Layers, Sparkles } from "lucide-react";

const WireframeDocumentation = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Wireframe Diagrams and Design Artifacts
          </h1>
          <p className="text-lg text-muted-foreground">
            This section presents the foundational wireframe diagrams and design artifacts 
            that guided the development of the Aura Shield Platform. These low-fidelity wireframes 
            demonstrate the application of core design principles—including the 12-column modular grid, 
            F-pattern visual hierarchy, and progressive disclosure—to create a security interface 
            optimized for rapid threat response (TTR &lt; 5 seconds) and minimal cognitive load.
          </p>
        </div>

        {/* Wireframe Source Link */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Design Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-md border border-border">
              <p className="text-sm font-semibold mb-2">Live Wireframe Design Link:</p>
              <p className="text-muted-foreground italic">
                [INSERT LIVE LINK TO WIREFRAME DIAGRAM HERE]
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Low Fidelity Wireframe 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5 text-primary" />
              Low Fidelity Wireframe 1: Main Dashboard View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Placeholder */}
            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-lg p-12 text-center">
              <p className="text-lg font-semibold text-primary">
                [IMAGE: Low Fidelity Wireframe 1 - Main Dashboard (F-Pattern/12-Column Grid)]
              </p>
            </div>

            {/* Rationale */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary">Rationale</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Main Dashboard View wireframe demonstrates the platform's commitment to the 
                <span className="font-semibold text-foreground"> F-Pattern reading structure</span> and 
                <span className="font-semibold text-foreground"> 12-column modular grid system</span>. 
                This layout prioritizes critical security information in the natural eye-tracking path, 
                ensuring that operators can identify and respond to threats within the target 
                Time-to-Response (TTR) window of less than 5 seconds. The grid provides consistent 
                scaling across viewport sizes while maintaining strict visual hierarchy.
              </p>
            </div>

            {/* Callouts */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Design Callouts</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Tier 1 Placement: Critical Alerts (Top-Left Quadrant)</h4>
                    <p className="text-sm text-muted-foreground">
                      The top-left quadrant is reserved exclusively for <strong>Tier 1: Critical Threat Status</strong>. 
                      This placement leverages the F-Pattern's primary fixation point, ensuring that high-severity 
                      ML-detected anomalies (color-coded in semantic red) are immediately visible upon dashboard load. 
                      This design decision directly supports the TTR &lt; 5s objective by eliminating visual search time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Network Guardian: Strategic Icon Placement</h4>
                    <p className="text-sm text-muted-foreground">
                      The Aura Guardian (Guard Dog) icon/card is positioned within the 12-column grid to provide 
                      visual branding and reassurance without competing for attention with Tier 1 alerts. Typically 
                      placed in the top-right or secondary column, the Guardian serves as a constant visual anchor 
                      representing the AI-powered protection layer, while maintaining clear separation from actionable data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Metric Blocks: Tier 2 Data Organization</h4>
                    <p className="text-sm text-muted-foreground">
                      Tier 2 data—including ML Anomaly Detection Charts and Network Throughput Metrics—is organized 
                      into predictable, uniform-sized blocks aligned to the 12-column grid. Each metric block spans 
                      a consistent number of columns (typically 4 or 6), creating a balanced, scannable layout. 
                      The standardized 8px spacing scale ensures visual breathing room and professional presentation 
                      across all data cards and log views.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Fidelity Wireframe 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Low Fidelity Wireframe 2: Alert Detail and Action Screen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Placeholder */}
            <div className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-lg p-12 text-center">
              <p className="text-lg font-semibold text-primary">
                [IMAGE: Low Fidelity Wireframe 2 - LLM Guidance Card & Mitigation Actions]
              </p>
            </div>

            {/* Rationale */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary">Rationale</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Alert Detail and Action Screen wireframe embodies the principle of 
                <span className="font-semibold text-foreground"> Progressive Disclosure</span>, revealing 
                detailed threat analysis and mitigation options only when a critical alert is selected. 
                This screen prioritizes the <span className="font-semibold text-foreground">AI-driven LLM Guidance Card</span> 
                as the primary decision-support tool, ensuring operators receive contextualized, actionable 
                recommendations without information overload. The design minimizes cognitive load by presenting 
                structured, collapsible content and a clear path to action execution.
              </p>
            </div>

            {/* Callouts */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Design Callouts</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">LLM Guidance Card Focus: Tier 1 Priority Placement</h4>
                    <p className="text-sm text-muted-foreground">
                      The LLM Guidance Card is visually isolated and positioned at the top of the detail view, 
                      signaling its <strong>Tier 1 priority</strong> status. The card employs high-contrast styling 
                      (distinct background, prominent border) and AI-specific iconography (e.g., Sparkles/Brain icon) 
                      to differentiate it from standard data cards. This design ensures the operator cannot overlook 
                      the AI's most critical recommendation, directly supporting rapid, informed decision-making.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Structured Output: Collapsible Information Architecture</h4>
                    <p className="text-sm text-muted-foreground">
                      The LLM Guidance Card utilizes collapsible sections—such as "Probable Causes" and "Recommended Actions"—
                      to manage information density without overwhelming the operator. This accordion-style structure allows 
                      users to progressively drill down into details as needed, maintaining focus on the most critical 
                      recommendation while providing access to supporting analysis. This approach directly reduces cognitive 
                      load and aligns with the platform's goal of sub-5-second TTR.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Action Button: Fastest Path to Mitigation</h4>
                    <p className="text-sm text-muted-foreground">
                      The full-width <strong>"Execute Recommended Action"</strong> button is prominently placed at the 
                      bottom of the LLM Guidance Card, using high-contrast semantic coloring (typically destructive red 
                      for critical actions or primary blue for standard mitigation). The button's size, placement, and 
                      color ensure it stands out as the primary call-to-action, enabling operators to execute the AI's 
                      recommendation with a single click—minimizing the time between alert identification and threat mitigation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted-foreground text-background flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Chat Interface: Conversational Follow-Up</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjacent to or below the structured LLM output, a conversational chat input field allows operators 
                      to pose follow-up questions to the AI (e.g., "What if I block this IP address?" or "Show me historical 
                      patterns"). This placement maintains the workflow continuity—users receive the initial recommendation, 
                      can act on it immediately, or seek clarification without navigating away from the alert context. The 
                      chat interface supports iterative decision-making while preserving the primary action path.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Design Principles Synthesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              These low-fidelity wireframes collectively demonstrate the Aura Shield Platform's unwavering 
              commitment to the core design principles outlined in Section 5.0 of the Design Rationale. 
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

export default WireframeDocumentation;
