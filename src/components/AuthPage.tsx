import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Lock, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/ModeToggle";

type AuthMode = "signin" | "signup";

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firewallApiKey, setFirewallApiKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, firewallApiKey, phoneNumber);

        if (error) {
          toast({
            title: "Sign-up failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Account created",
          description: "Check your inbox to confirm your email before signing in.",
        });
        setMode("signin");
        setPassword("");
        setFirewallApiKey("");
        setPhoneNumber("");
        return;
      }

      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Sign-in failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back",
        description: "You're signed in to ARES.",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((previous) => (previous === "signin" ? "signup" : "signin"));
    setPassword("");
    setFirewallApiKey("");
    setPhoneNumber("");
  };

  const updateEmail = (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
  const updatePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);
  const updateFirewallApiKey = (event: ChangeEvent<HTMLInputElement>) => setFirewallApiKey(event.target.value);
  const updatePhoneNumber = (event: ChangeEvent<HTMLInputElement>) => setPhoneNumber(event.target.value);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <ModeToggle className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background" />

      <div className="relative w-full max-w-xl space-y-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl bg-white/95 shadow-[0_35px_95px_-50px_rgba(24,118,180,0.65)] dark:bg-card/90">
            <img
              src="/projectlogov3.png"
              alt="ARES logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          <div className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">ARES</span>
            <h1 className="text-3xl font-semibold text-foreground">
              {mode === "signin" ? "Log in to your command deck" : "Create a secure account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Launch real-time protection with a single sign-on — no extra verification codes required.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border-2 border-border/80 bg-card/90 p-8 shadow-[0_32px_120px_-48px_rgba(46,96,176,0.35)] backdrop-blur-xl transition dark:border-white/10 dark:bg-card/80 dark:shadow-[0_30px_120px_-50px_rgba(4,18,30,0.65)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={updateEmail}
                    placeholder="name@company.com"
                    required
                    className="h-12 rounded-xl border-2 border-border/70 bg-white/90 pl-10 text-foreground placeholder:text-muted-foreground shadow-[0_12px_32px_-24px_rgba(46,96,176,0.3)] transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 dark:border-white/10 dark:bg-background/70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={updatePassword}
                    placeholder="********"
                    required
                    className="h-12 rounded-xl border-2 border-border/70 bg-white/90 pl-10 text-foreground placeholder:text-muted-foreground shadow-[0_12px_32px_-24px_rgba(46,96,176,0.3)] transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 dark:border-white/10 dark:bg-background/70"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firewallApiKey" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Firewall API key
                    </Label>
                    <Input
                      id="firewallApiKey"
                      type="text"
                      value={firewallApiKey}
                      onChange={updateFirewallApiKey}
                      placeholder="Required for deployment"
                      required
                      className="h-12 rounded-xl border-2 border-border/70 bg-white/90 text-foreground shadow-[0_12px_32px_-24px_rgba(46,96,176,0.3)] transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 dark:border-white/10 dark:bg-background/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Phone number
                    </Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={updatePhoneNumber}
                        placeholder="+1 555 010 2030"
                        required
                        className="h-12 rounded-xl border-2 border-border/70 bg-white/90 pl-10 text-foreground placeholder:text-muted-foreground shadow-[0_12px_32px_-24px_rgba(46,96,176,0.3)] transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 dark:border-white/10 dark:bg-background/70"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Enter command deck" : "Create account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{mode === "signin" ? "Need an account?" : "Already registered?"}</span>
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

