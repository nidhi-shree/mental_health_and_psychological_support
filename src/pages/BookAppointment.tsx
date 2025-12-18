import { useState } from 'react';
import { Calendar, User, Mail, Phone, CheckCircle, Clock, ArrowLeft, Users, Brain, Stethoscope, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';

export default function BookAppointment() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const appointmentTypes = [
    { value: 'counseling', label: 'Individual Counseling', icon: User, desc: '1-on-1 private session' },
    { value: 'therapy', label: 'Psychotherapy', icon: Brain, desc: 'Deep dive therapy' },
    { value: 'assessment', label: 'Mental Assessment', icon: Stethoscope, desc: 'Clinical evaluation' },
    { value: 'group', label: 'Group Therapy', icon: Users, desc: 'Support circle' },
    { value: 'consultation', label: 'Initial Consultation', icon: Sparkles, desc: 'First time visit' },
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', 
    '04:00 PM', '05:00 PM'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('mindcare-token');
    if (!token) {
        toast({ title: "Error", description: "You must be logged in.", variant: 'destructive' });
        return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/appointments/', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          appointment_type: formData.appointmentType,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          notes: formData.notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Request Sent! 🗓️",
          description: "We'll confirm your slot shortly.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong.",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Connection failed.", variant: 'destructive' });
      console.error(error);
    }
  };

  // --- SUCCESS VIEW ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-zinc-950 dark:to-zinc-900">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg"
        >
            <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
                <div className="bg-green-600 h-2 w-full" />
                <CardContent className="p-10 text-center space-y-6">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Request Received!</h2>
                    <p className="text-muted-foreground text-lg">
                        Your request for <strong>{appointmentTypes.find(t => t.value === formData.appointmentType)?.label}</strong> on <strong>{formData.preferredDate}</strong> at <strong>{formData.preferredTime}</strong> has been sent.
                    </p>

                    <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl text-sm text-muted-foreground border border-slate-100 dark:border-zinc-700">
                        A professional will review your request and you will receive a confirmation email shortly.
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button onClick={() => navigate("/appointments")} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 dark:shadow-none">
                            Go to My Appointments
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData({ name: '', email: '', phone: '', appointmentType: '', preferredDate: '', preferredTime: '', notes: '' });
                            }} 
                        >
                            Book Another Session
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <Button variant="ghost" onClick={() => navigate('/')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Book a Session</h1>
                <p className="text-muted-foreground mt-2">Take the next step in your mental wellness journey.</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/appointments")}>
                View My History
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COL: THE FORM */}
            <div className="lg:col-span-2 space-y-8">
                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Session Type */}
                    <section className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Choose Session Type
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {appointmentTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.appointmentType === type.value;
                                return (
                                    <div
                                        key={type.value}
                                        onClick={() => handleInputChange('appointmentType', type.value)}
                                        className={`
                                            cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group
                                            ${isSelected 
                                                ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                                                : 'border-transparent bg-white dark:bg-zinc-900 hover:border-primary/30 hover:bg-white/80 shadow-sm'}
                                        `}
                                    >
                                        <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-primary'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`font-bold ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{type.label}</p>
                                            <p className="text-xs text-muted-foreground">{type.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 2. Date & Time */}
                    <section className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            Select Date & Time
                        </h3>
                        
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-sm font-medium mb-3 block text-muted-foreground">Pick a Date</label>
                                    <Input 
                                        type="date" 
                                        className="w-full h-12 text-lg rounded-xl border-zinc-200 dark:border-zinc-700 focus:ring-primary"
                                        value={formData.preferredDate} 
                                        onChange={(e) => handleInputChange('preferredDate', e.target.value)} 
                                        min={new Date().toISOString().split('T')[0]} 
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium mb-3 block text-muted-foreground">Pick a Time Slot</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map((time) => (
                                            <button
                                                type="button"
                                                key={time}
                                                onClick={() => handleInputChange('preferredTime', time)}
                                                className={`
                                                    py-2 px-1 text-xs sm:text-sm rounded-lg border transition-all font-medium
                                                    ${formData.preferredTime === time 
                                                        ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                                        : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-zinc-800'}
                                                `}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Your Details */}
                    <section className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            Your Information
                        </h3>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input placeholder="John Doe" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="pl-10 h-11 bg-slate-50 dark:bg-zinc-800 border-0 focus-visible:ring-1" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-10 h-11 bg-slate-50 dark:bg-zinc-800 border-0 focus-visible:ring-1" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input type="tel" placeholder="+1 234 567 890" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="pl-10 h-11 bg-slate-50 dark:bg-zinc-800 border-0 focus-visible:ring-1" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes for the Doctor</label>
                                <Textarea 
                                    placeholder="Briefly describe how you're feeling or what you'd like to discuss..." 
                                    value={formData.notes} 
                                    onChange={(e) => handleInputChange('notes', e.target.value)} 
                                    className="bg-slate-50 dark:bg-zinc-800 border-0 resize-none min-h-[100px] focus-visible:ring-1"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex justify-end pb-10">
                        <Button 
                            type="submit" 
                            size="lg"
                            disabled={!formData.name || !formData.email || !formData.appointmentType || !formData.preferredDate || !formData.preferredTime}
                            className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 text-white rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105"
                        >
                            Confirm Appointment
                        </Button>
                    </div>

                </form>
            </div>

            {/* RIGHT COL: INFO & SUMMARY (Attractively Redesigned) */}
            <div className="hidden lg:block">
                 <div className="sticky top-24 space-y-6">
                    
                    {/* Hero Summary Card */}
                    <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden rounded-[2.5rem] relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-90 transition-all duration-500 group-hover:opacity-100" />
                        
                        {/* Decorative Blobs */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/30 rounded-full blur-2xl" />

                        <CardContent className="relative p-8 space-y-8 z-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Booking Summary</h3>
                                <p className="text-indigo-200 text-sm">Review your session details</p>
                            </div>
                            
                            <div className="space-y-6">
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={formData.appointmentType || 'empty'}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                                    >
                                        <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Session Type</p>
                                        <p className="text-xl font-semibold flex items-center gap-2">
                                            {formData.appointmentType 
                                                ? appointmentTypes.find(t => t.value === formData.appointmentType)?.label 
                                                : <span className="opacity-50 italic">Select a type...</span>}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Date</p>
                                        <p className="font-medium text-lg">{formData.preferredDate || "--/--"}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold mb-1">Time</p>
                                        <p className="font-medium text-lg">{formData.preferredTime || "--:--"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-indigo-100 text-sm">
                                        <div className="p-1 bg-green-500/20 rounded-full"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                                        <span>100% Confidential</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-indigo-100 text-sm">
                                        <div className="p-1 bg-blue-500/20 rounded-full"><ShieldCheck className="w-4 h-4 text-blue-400" /></div>
                                        <span>Verified Professionals</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tip Card */}
                    <div className="bg-indigo-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-indigo-100 dark:border-zinc-800">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm h-fit">
                                <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">Preparation Tip</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Write down 2-3 key things you want to discuss. It helps make the most of your time with the therapist.
                                </p>
                            </div>
                        </div>
                    </div>

                 </div>
            </div>

        </div>
      </div>
    </div>
  );
}