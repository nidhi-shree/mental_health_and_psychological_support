import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, XCircle, ArrowLeft, Video, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load appointments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: string) => {
    if(!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/cancel/${id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mindcare-token')}` }
      });

      if (res.ok) {
        toast({ title: "Cancelled", description: "Appointment has been cancelled." });
        // Update UI locally
        setAppointments((prev) => prev.map(appt => appt.id === id ? {...appt, status: 'cancelled'} : appt));
      } else {
        toast({ title: "Error", description: "Unable to cancel.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading your schedule...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in">
      
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="hover:bg-transparent hover:text-primary p-0 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">My Appointments</h1>

      {appointments.length === 0 ? (
        <div className="text-center text-muted-foreground mt-10 p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-muted/10">
          <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Appointments Yet</h3>
          <p className="mb-6">Book a session with a professional to get started.</p>
          <Button onClick={() => navigate('/book')} className="bg-primary hover:bg-primary/90">
            Book Your First Session
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
            {appointments.map((appt) => (
            <Card key={appt.id} className="mindcare-card overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    {/* Left Side: Details */}
                    <div className="space-y-3 w-full">
                        <div className="flex items-center gap-3">
                            <Badge variant={
                                appt.status === 'confirmed' ? 'default' : 
                                appt.status === 'cancelled' ? 'destructive' : 'secondary'
                            } className="capitalize px-3 py-1">
                                {appt.status}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                {appt.appointment_type || appt.type}
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                {appt.status === 'confirmed' ? (
                                    <>
                                        <User className="w-5 h-5 text-green-600" /> 
                                        Dr. {appt.doctor}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground font-normal italic flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Waiting for doctor assignment...
                                    </span>
                                )}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm mt-2 text-muted-foreground">
                                <span className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                                    <Calendar className="w-4 h-4 text-primary"/> {appt.preferred_date || appt.date}
                                </span>
                                <span className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                                    <Clock className="w-4 h-4 text-primary"/> {appt.preferred_time || appt.time}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Actions (FIXED LAYOUT) */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                        
                        {/* JOIN BUTTON */}
                        {appt.status === 'confirmed' ? (
                            <Button 
                                onClick={() => navigate(`/room/${appt.id}`)} 
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm gap-2 w-full sm:w-auto px-6"
                            >
                                <Video className="w-4 h-4" /> Join Session
                            </Button>
                        ) : appt.status === 'pending' ? (
                             <Button disabled variant="outline" className="w-full sm:w-auto border-dashed opacity-70 px-6">
                                Pending...
                             </Button>
                        ) : null}

                        {/* CANCEL BUTTON (Fixed: No longer squashed) */}
                        {appt.status !== "cancelled" && (
                            <Button 
                                variant="outline" 
                                onClick={() => cancelAppointment(appt.id)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 w-full sm:w-auto shrink-0"
                            >
                                <XCircle className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}