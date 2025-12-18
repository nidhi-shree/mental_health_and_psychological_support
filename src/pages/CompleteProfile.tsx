import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Phone, Sparkles, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Standard avatar seeds for consistency
const AVATAR_SEEDS = ['Felix', 'Aneka', 'Precious', 'Mittens', 'Ginger', 'Sassy', 'Buddy', 'Luna'];

export default function CompleteProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1 = Avatar/Bio, 2 = Details (Age/Location)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize with existing data or defaults
  const [form, setForm] = useState({
    phone: user?.phone || '',
    location: user?.location || '',
    age: user?.age || '', // Use string for input, convert to number on save
    bio: user?.bio || '',
    avatar_seed: user?.avatar_seed || AVATAR_SEEDS[0],
    interests: user?.interests || [] as string[],
    currentInterest: ''
  });

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && form.currentInterest.trim()) {
      e.preventDefault();
      if (!form.interests.includes(form.currentInterest.trim())) {
        setForm(prev => ({
          ...prev,
          interests: [...prev.interests, prev.currentInterest.trim()],
          currentInterest: ''
        }));
      }
    }
  };

  const removeInterest = (tag: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step validation
    if (step === 1) {
        setStep(2);
        return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateProfile({
          phone: form.phone,
          location: form.location,
          age: Number(form.age), // Ensure it sends as a number
          bio: form.bio,
          avatar_seed: form.avatar_seed,
          interests: form.interests
      });
      
      if (success) {
        toast.success('Profile setup complete!');
        navigate('/');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
        
        {/* Header with Progress Bar */}
        <div className="bg-primary/5 p-6 pb-0">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex gap-2">
                    {/* Progress Dots */}
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-zinc-200'}`} />
                    <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-zinc-200'}`} />
                 </div>
                 <span className="text-xs font-medium text-muted-foreground">Step {step} of 2</span>
            </div>
            <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold">
                {step === 1 ? "Create Your Persona" : "Final Details"}
            </CardTitle>
            <CardDescription>
                {step === 1 
                    ? "Choose an avatar and tell us a bit about yourself." 
                    : "Help us customize your experience."}
            </CardDescription>
            </CardHeader>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- STEP 1: AVATAR, BIO, INTERESTS --- */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    
                    {/* Avatar Grid */}
                    <div className="space-y-3">
                        <Label>Choose your Avatar</Label>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATAR_SEEDS.map(seed => (
                                <div 
                                    key={seed}
                                    onClick={() => setForm({...form, avatar_seed: seed})}
                                    className={`
                                        cursor-pointer rounded-full p-1 border-2 transition-all hover:scale-105
                                        ${form.avatar_seed === seed ? 'border-primary bg-primary/10 scale-105' : 'border-transparent hover:border-zinc-200'}
                                    `}
                                >
                                    <Avatar className="w-16 h-16 mx-auto">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                                        <AvatarFallback>{seed[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Your Bio</Label>
                        <Textarea 
                            id="bio"
                            placeholder="I love painting, hiking, and I'm here to work on my anxiety..."
                            className="resize-none h-24"
                            value={form.bio}
                            onChange={(e) => setForm({...form, bio: e.target.value})}
                        />
                    </div>
                    
                    {/* Interests */}
                    <div className="space-y-2">
                        <Label>Interests (Press Enter to add)</Label>
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                            {form.interests.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm flex gap-1 items-center">
                                    {tag}
                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeInterest(tag)}/>
                                </Badge>
                            ))}
                        </div>
                        <div className="relative">
                            <Sparkles className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="e.g. Art, Music, Meditation" 
                                className="pl-10"
                                value={form.currentInterest}
                                onChange={(e) => setForm({...form, currentInterest: e.target.value})}
                                onKeyDown={handleAddInterest}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">Next Step</Button>
                </div>
            )}

            {/* --- STEP 2: AGE, PHONE, LOCATION --- */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    
                    {/* Age Input (NEW) */}
                    <div className="space-y-2">
                        <Label htmlFor="age" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" /> Age
                        </Label>
                        <Input
                            id="age"
                            type="number"
                            placeholder="Your age"
                            value={form.age}
                            onChange={(e) => setForm({ ...form, age: e.target.value })}
                            min="13"
                            max="120"
                            required
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            required
                        />
                    </div>

                    {/* Location Input */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" /> Location
                        </Label>
                        <Input
                            id="location"
                            type="text"
                            placeholder="City, Country"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Complete Profile'}
                        </Button>
                    </div>
                    
                    <Button type="button" variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => navigate('/')}>
                        Skip for now
                    </Button>
                </div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}