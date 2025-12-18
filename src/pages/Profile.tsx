import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit3, Shield, FileText, Stethoscope, Save, X, Download, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
// REMOVED: import { Separator } from '@/components/ui/separator'; (Causing error)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    age: '',       
    bio: '',       
    license_number: '', 
    role: 'user',
    avatar_seed: '',
    joinDate: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    appointmentReminders: true,
  });

  // --- FETCH ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${user?.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}` }
        });
        const data = await res.json();

        if (res.ok) {
          const u = data.user || data;
          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            location: u.location || '',
            age: u.age || '', 
            bio: u.bio || '',
            license_number: u.license_number || '',
            role: u.role || 'user',
            avatar_seed: u.avatar_seed || u.name, 
            joinDate: u.join_date
              ? new Date(u.join_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
              : '',
          });
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchProfile();
  }, [user]);

  // --- SAVE ---
  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateProfile({
        phone: formData.phone,
        location: formData.location,
        age: Number(formData.age),
        bio: formData.bio
      });

      if (success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  // --- DOWNLOAD ---
  const handleDownloadData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}` }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindcare-data-${user?.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Data downloaded!');
    } catch (err) { toast.error('Download failed'); }
  };

  // --- PASSWORD ---
  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
        const res = await fetch(`http://localhost:5000/api/profile/change-password/${user?.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}`
            },
            body: JSON.stringify(passwords),
        });
        if (res.ok) {
            toast.success('Password changed!');
            setShowPasswordModal(false);
            setPasswords({ currentPassword: '', newPassword: '' });
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed');
        }
    } catch(e) { toast.error('Error changing password'); }
    finally { setChangingPassword(false); }
  };

  // Dynamic Styles based on Role
  const getRoleStyles = () => {
      switch(formData.role) {
          case 'psychologist': return {
              gradient: 'from-teal-500 to-emerald-600',
              badge: 'bg-teal-100 text-teal-700 border-teal-200',
              icon: <Stethoscope className="w-3 h-3" />
          };
          case 'admin': return {
              gradient: 'from-slate-700 to-zinc-900',
              badge: 'bg-slate-100 text-slate-700 border-slate-200',
              icon: <Shield className="w-3 h-3" />
          };
          default: return {
              gradient: 'from-violet-500 to-fuchsia-600',
              badge: 'bg-violet-100 text-violet-700 border-violet-200',
              icon: <User className="w-3 h-3" />
          };
      }
  };

  const theme = getRoleStyles();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in">
      
      {/* HEADER - Clean & Serene */}
      <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 p-8 rounded-3xl border border-white/50 shadow-sm flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar */}
          <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatar_seed}`} />
                  <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">{formData.name[0]}</AvatarFallback>
              </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formData.name}</h1>
                  <Badge className={`${theme.badge} flex items-center gap-1 px-2 py-0.5 shadow-sm`}>
                      {theme.icon} <span className="capitalize">{formData.role}</span>
                  </Badge>
              </div>
              
              <p className="text-slate-500 font-medium">{formData.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-400 pt-2">
                  {formData.location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {formData.location}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formData.joinDate}</span>
              </div>
          </div>

          {/* Edit Button */}
          <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant="outline"
              className="rounded-full border-slate-200 text-slate-600 hover:bg-white hover:text-purple-600"
          >
              {isEditing ? <><X className="w-4 h-4 mr-2"/> Cancel</> : <><Edit3 className="w-4 h-4 mr-2"/> Edit Profile</>}
          </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - INFO */}
        <div className="lg:col-span-2 space-y-6">
             <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" /> About Me
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                    {isEditing ? (
                        <div className="space-y-5 animate-in fade-in">
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea 
                                    value={formData.bio} 
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                                    placeholder="Share a little about yourself..."
                                    className="resize-none min-h-[120px] bg-slate-50 border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="bg-slate-50 border-slate-200"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-slate-50 border-slate-200"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="bg-slate-50 border-slate-200"/>
                            </div>
                            <div className="pt-4">
                                <Button onClick={handleSave} disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                    {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Bio Display */}
                            <div className="relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-200 rounded-full"></div>
                                <p className="pl-4 text-slate-600 leading-relaxed italic">
                                    "{formData.bio || "No bio added yet."}"
                                </p>
                            </div>

                            {/* Replaced <Separator /> with a simple div */}
                            <div className="h-px bg-slate-100 dark:bg-zinc-800 w-full my-6" />

                            <div className="grid grid-cols-2 gap-y-6">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Age</p>
                                    <p className="text-slate-700 font-medium">{formData.age ? `${formData.age} years` : 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Phone</p>
                                    <p className="text-slate-700 font-medium">{formData.phone || 'Not set'}</p>
                                </div>
                                {formData.role === 'psychologist' && (
                                    <div className="col-span-2">
                                        <p className="text-xs uppercase tracking-wider text-teal-500 font-semibold mb-1">Medical License</p>
                                        <p className="text-slate-700 font-mono bg-teal-50 inline-block px-2 py-1 rounded text-sm border border-teal-100">
                                            {formData.license_number || 'Pending'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>

        {/* RIGHT COLUMN - SETTINGS */}
        <div className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-slate-700">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-slate-50 text-slate-600" onClick={() => setShowPasswordModal(true)}>
                        <Lock className="w-4 h-4 mr-3 text-slate-400" /> Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-slate-50 text-slate-600" onClick={handleDownloadData}>
                        <Download className="w-4 h-4 mr-3 text-slate-400" /> Download My Data
                    </Button>
                </CardContent>
            </Card>

             {/* Preferences */}
             <Card className="border-none shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg font-medium text-slate-700">Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-slate-600 font-normal">Email Alerts</Label>
                        <Switch checked={preferences.emailNotifications} onCheckedChange={(c) => setPreferences({...preferences, emailNotifications: c})} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-slate-600 font-normal">Session Reminders</Label>
                        <Switch checked={preferences.appointmentReminders} onCheckedChange={(c) => setPreferences({...preferences, appointmentReminders: c})} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-purple-600 hover:bg-purple-700">{changingPassword ? 'Updating...' : 'Update'}</Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}