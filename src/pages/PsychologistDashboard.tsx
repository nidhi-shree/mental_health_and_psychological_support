import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, UserCheck, Bell, RefreshCw, LogOut, Video, FileText, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PsychologistDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [mySchedule, setMySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE FOR PRESCRIPTION MODAL ---
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('mindcare-token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resPending = await fetch('http://localhost:5000/api/appointments/pool', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(resPending.ok) setPending(await resPending.json());

      const resMy = await fetch('http://localhost:5000/api/appointments/my-schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(resMy.ok) setMySchedule(await resMy.json());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast({ title: "Success! 🎉", description: "Appointment added to your schedule." });
        fetchData(); 
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error, variant: "destructive" });
        fetchData(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartSession = (appointmentId: string) => {
    if (!appointmentId) {
        toast({ title: "Error", description: "Invalid Session ID", variant: "destructive" });
        return;
    }
    navigate(`/room/${appointmentId}`);
  };

  // --- NEW: SEND PRESCRIPTION ---
  const handleSendPrescription = async () => {
      if(!noteContent.trim()) return;
      setIsSending(true);

      try {
          const res = await fetch('http://localhost:5000/api/documents/send-prescription', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                patient_email: selectedPatient.contact, 
                patient_name: selectedPatient.patient_name,
                content: noteContent 
            })
          });

          if(res.ok) {
              toast({ title: "Sent!", description: "Document emailed to patient successfully." });
              setSelectedPatient(null);
              setNoteContent("");
          } else {
              toast({ title: "Failed", description: "Could not send document.", variant: "destructive" });
          }
      } catch(e) {
          console.error(e);
      } finally {
          setIsSending(false);
      }
  };

  const handleLogout = () => {
      logout();
      toast({ title: "Logged out", description: "See you next time, Doctor." });
      navigate('/login');
  };

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">Psychologist Workspace</h1>
            <p className="text-muted-foreground">Manage patient requests and your daily schedule.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="mindcare-card border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
                <User className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold">{pending.length}</span>
            </div>
            <p className="font-medium">Requests Pool</p>
          </CardContent>
        </Card>
        <Card className="mindcare-card border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold">{mySchedule.length}</span>
            </div>
            <p className="font-medium">My Patients</p>
          </CardContent>
        </Card>
        <Card className="mindcare-card border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold">Active</span>
            </div>
            <p className="font-medium">Status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pool" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="pool">Request Pool ({pending.length})</TabsTrigger>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="pool" className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-xl border-2 border-dashed">
                <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-lg">No Pending Requests</h3>
                <p className="text-muted-foreground">Good job! All patients have been attended to.</p>
            </div>
          ) : (
            pending.map((appt) => (
                <Card key={appt.id} className="mindcare-card hover:shadow-md transition-all border-l-4 border-l-orange-200">
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg">{appt.patient_name}</h3>
                                <Badge variant="secondary">{appt.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Requested for: {appt.date} at {appt.time}</p>
                            {appt.notes && (
                                <p className="text-sm italic text-muted-foreground mt-2 bg-muted/30 p-2 rounded border">"{appt.notes}"</p>
                            )}
                        </div>
                        <Button onClick={() => handleAccept(appt.id)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm shrink-0 w-full md:w-auto">
                            Accept Request
                        </Button>
                    </CardContent>
                </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
            {mySchedule.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border-2 border-dashed">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-semibold text-lg">Your Schedule is Empty</h3>
                </div>
            ) : (
                mySchedule.map((appt) => (
                    <Card key={appt.id} className="mindcare-card border-l-4 border-l-green-500">
                        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <User className="w-6 h-6 text-green-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{appt.patient_name}</h3>
                                    <p className="text-sm text-muted-foreground">{appt.type}</p>
                                    <p className="text-xs text-blue-600 mt-1 font-mono">{appt.contact}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <div className="text-right mb-1">
                                    <p className="font-bold text-xl">{appt.time}</p>
                                    <p className="text-sm text-muted-foreground">{appt.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    {/* PRESCRIPTION BUTTON */}
                                    <Button 
                                        variant="outline"
                                        onClick={() => { setSelectedPatient(appt); setNoteContent(""); }}
                                        className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                                    >
                                        <FileText className="w-4 h-4 mr-2" /> Write Note
                                    </Button>
                                    
                                    {/* VIDEO BUTTON */}
                                    <Button 
                                        type="button"
                                        onClick={() => handleStartSession(appt.id)} 
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                                    >
                                        <Video className="w-4 h-4 mr-2" />
                                        Start
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </TabsContent>
      </Tabs>

      {/* --- PRESCRIPTION MODAL --- */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Clinical Note / Prescription
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                    Sending to: <span className="font-medium text-foreground">{selectedPatient?.patient_name}</span> ({selectedPatient?.contact})
                </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Note Content</Label>
                    <Textarea 
                        placeholder="Type prescription, session summary, or homework here..." 
                        className="min-h-[200px] resize-none text-base"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        This will be converted to a secure PDF and emailed to the patient.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>Cancel</Button>
                <Button onClick={handleSendPrescription} disabled={isSending || !noteContent.trim()} className="bg-purple-600 hover:bg-purple-700">
                    {isSending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>}
                    {isSending ? "Sending..." : "Send Securely"}
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}