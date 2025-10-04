import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Lock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firewallApiKey, setFirewallApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'password' | 'otp'>('password');
  const [otpCode, setOtpCode] = useState('');
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password confirmation on signup
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, firstName, lastName, firewallApiKey, phoneNumber);
        if (error) {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account"
          });
        }
      } else {
        // Step 1: Verify password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          toast({
            title: "Authentication Error",
            description: signInError.message,
            variant: "destructive"
          });
        } else {
          // Password verified, now sign out and proceed to OTP
          await supabase.auth.signOut();
          
          // Send OTP
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false
            }
          });

          if (otpError) {
            toast({
              title: "Error",
              description: "Failed to send OTP. Please try again.",
              variant: "destructive"
            });
          } else {
            setLoginStep('otp');
            toast({
              title: "Password Verified",
              description: "Please check your email for the OTP code"
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        // User will be redirected automatically by auth state change
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to resend OTP",
          variant: "destructive"
        });
      } else {
        toast({
          title: "OTP Sent",
          description: "A new OTP code has been sent to your email"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">AuraShield</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create your account" 
              : loginStep === 'otp' 
                ? "Enter verification code" 
                : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSignUp && loginStep === 'otp' ? (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div>
                <Label htmlFor="otpCode">Verification Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Please enter the code sent to {email}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Lock className="w-4 h-4 mr-2" />
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resend OTP
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => {
                    setLoginStep('password');
                    setOtpCode('');
                  }}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="firewallApiKey">Firewall API Key</Label>
                  <Input
                    id="firewallApiKey"
                    type="password"
                    value={firewallApiKey}
                    onChange={(e) => setFirewallApiKey(e.target.value)}
                    placeholder="Enter your firewall API key"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};