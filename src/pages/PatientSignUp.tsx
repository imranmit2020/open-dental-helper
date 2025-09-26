import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/patient-dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/patient-signin`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "patient",
            phone: phone,
            date_of_birth: dateOfBirth,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else if (error.message.includes("Password should be")) {
          toast({
            title: "Weak password",
            description: "Password should be at least 6 characters long.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account before signing in.",
      });
      
      // Clear form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setDateOfBirth("");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-secondary/5 animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      
      <Card className="w-full max-w-lg glass-card relative z-10 animate-fade-in border-0">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-60 animate-glow"></div>
              <div className="relative p-4 rounded-full bg-gradient-to-r from-primary to-secondary shadow-elegant">
                <UserPlus className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold gradient-text tracking-tight">
              Join Patient Portal
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Create your account to access dental records, book appointments, and manage your healthcare
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="first-name" className="text-sm font-semibold text-foreground/80">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="last-name" className="text-sm font-semibold text-foreground/80">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground/80">
                Email Address
              </Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                required
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                required
              />
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-3">
              <Label htmlFor="date-of-birth" className="text-sm font-semibold text-foreground/80">
                Date of Birth
              </Label>
              <Input
                id="date-of-birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground/80">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="h-12 pr-12 border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-300"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 btn-gradient text-lg font-semibold hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Patient Account"
                )}
              </Button>
            </div>
            
            {/* Sign In Link */}
            <div className="text-center pt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background/80 text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  to="/patient-signin" 
                  className="text-primary hover:text-primary-hover font-semibold hover:underline transition-all duration-200 text-sm"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}