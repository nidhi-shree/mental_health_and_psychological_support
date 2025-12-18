import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, User, Briefcase, BadgeCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    license_number: '' // New field for doctors
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
        // Direct API call to handle custom fields like 'license_number'
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                license_number: formData.role === 'psychologist' ? formData.license_number : undefined
            })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            toast({ 
                title: "Success! 🎉", 
                description: data.message || "Account created. Please sign in." 
            });
            navigate('/login');
        } else {
            toast({ title: "Registration Failed", description: data.error, variant: "destructive" });
        }
    } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-calm">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">MindCare</h1>
          <p className="text-muted-foreground mt-2">Begin your wellness journey</p>
        </div>

        <Card className="mindcare-card">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join our supportive community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="pl-10" required />
                </div>
              </div>

              {/* Role Selection - ADMIN REMOVED */}
              <div className="space-y-2">
                <label className="text-sm font-medium">I am a...</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring pl-10"
                  >
                    <option value="user">User (Seeking Support)</option>
                    <option value="psychologist">Psychologist (Professional)</option>
                  </select>
                </div>
              </div>

              {/* Conditional License Field */}
              {formData.role === 'psychologist' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <label className="text-sm font-medium text-purple-600">Medical License Number</label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                      <Input 
                        name="license_number" 
                        placeholder="e.g., PSY-123456" 
                        value={formData.license_number} 
                        onChange={handleChange} 
                        className="pl-10 border-purple-200 focus:ring-purple-500" 
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Required for admin verification.</p>
                  </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="password" type="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} className="pl-10" required />
                </div>
              </div>

              <Button type="submit" className="w-full mindcare-button-hero" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}