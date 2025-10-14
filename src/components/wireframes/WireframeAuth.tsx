import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Mail, Lock, User, Phone, Key } from "lucide-react";

const WireframeAuth = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-primary" />
          Authentication Page
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wireframe */}
        <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-lg border-2 border-slate-300 dark:border-slate-700">
          <div className="max-w-md mx-auto space-y-4">
            {/* Logo */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded mx-auto"></div>
              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
            </div>

            {/* Form Fields */}
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-6 space-y-4">
              {/* Sign Up Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                  <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Firewall API Key */}
              <div className="space-y-2">
                <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded px-3">
                  <Key className="w-4 h-4 text-slate-400" />
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="h-10 bg-primary rounded flex items-center justify-center">
                <div className="h-3 w-24 bg-primary-foreground/30 rounded"></div>
              </div>

              {/* Toggle Link */}
              <div className="text-center">
                <div className="h-2 w-56 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-primary">Design Rationale</h3>
          <p className="text-muted-foreground leading-relaxed">
            The Authentication page employs a <strong>centered, single-column layout</strong> to create 
            a focused user experience. The prominent logo and brand identity establish trust, while the 
            progressive form fields collect necessary information without overwhelming the user. The design 
            supports both sign-in and sign-up flows with <strong>OTP verification</strong> for enhanced 
            security, aligning with the platform's security-first philosophy.
          </p>
        </div>

        {/* Callouts */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">Design Callouts</h3>
          
          <div className="grid gap-3">
            <div className="flex gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Centered Focus</h4>
                <p className="text-xs text-muted-foreground">
                  Card-based design centers user attention, reducing distractions and cognitive load during the authentication process.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">2</div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Two-Factor Authentication</h4>
                <p className="text-xs text-muted-foreground">
                  OTP verification step adds security layer, transitioning from password entry to code verification seamlessly.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-muted rounded-lg border border-border">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-muted-foreground text-background flex items-center justify-center font-bold text-sm">3</div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Progressive Disclosure</h4>
                <p className="text-xs text-muted-foreground">
                  Additional fields (phone, API key) only shown during sign-up, keeping sign-in experience minimal and fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireframeAuth;
