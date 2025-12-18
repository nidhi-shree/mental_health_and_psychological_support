import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Attempt login (Backend will throw 403 if account is unverified)
    const success = await login(email, password);

    if (success) {
      toast({
        title: "Welcome back! 🌟",
        description: "You're now signed in.",
      });

      // 2. Smart Redirect based on Role
      // We read directly from localStorage to ensure we have the fresh data
      const storedUser = localStorage.getItem('mindcare-user');
      
      if (storedUser) {
          try {
              const userObj = JSON.parse(storedUser);
              
              if (userObj.role === 'admin') {
                  navigate('/admin');
              } else if (userObj.role === 'psychologist') {
                  navigate('/psychologist');
              } else {
                  navigate('/'); // Standard User
              }
          } catch (e) {
              console.error("Redirect Error:", e);
              navigate('/'); // Safety Fallback
          }
      } else {
          navigate('/');
      }
    } else {
      // 3. Handle Failure (Check if it was a verification issue)
      // Note: Ideally, your 'login' function in AuthContext should return the specific error message.
      // If it returns simple boolean false, we show a generic message.
      toast({
        title: "Sign in failed",
        description: "Invalid credentials, or your account is pending approval if you are a doctor.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-calm">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MindCare
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back to your wellness journey
          </p>
        </div>

        <Card className="mindcare-card">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mindcare-button-hero" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline block"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo credentials:</strong><br />
                Email: demo@mindcare.com<br />
                Password: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}