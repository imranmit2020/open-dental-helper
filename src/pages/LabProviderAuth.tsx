import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FlaskConical, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function LabProviderAuth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/lab-provider-dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is a lab provider
        const { data: labProvider, error: labError } = await (supabase as any)
          .from('lab_provider_users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (labError || !labProvider) {
          await supabase.auth.signOut();
          throw new Error('This account is not registered as a lab provider');
        }

        toast.success('Welcome back!');
        navigate('/lab-provider-dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/lab-provider-auth?reset=true`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-full">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lab Provider Portal
            </CardTitle>
            <p className="text-muted-foreground">Access your laboratory dashboard</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="lab@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={handleForgotPassword}
                    className="text-sm text-muted-foreground"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4 border-t pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Don't have a lab provider account?
                </p>
                <Link to="/lab-provider-signup">
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Register Your Laboratory
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Are you a dental practice?
                </p>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Go to Practice Portal
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}