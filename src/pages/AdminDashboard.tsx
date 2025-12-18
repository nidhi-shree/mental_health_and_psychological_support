import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, ShieldAlert, CheckCircle, XCircle, Clock, User, LogOut, RefreshCw, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_sessions: 0,
    pending_approvals: 0,
    active_doctors: 0
  });
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('mindcare-token');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
        // 1. Fetch Stats
        const resStats = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(resStats.ok) setStats(await resStats.json());

        // 2. Fetch Pending List
        const resPending = await fetch('http://localhost:5000/api/admin/pending-approvals', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(resPending.ok) setPendingDocs(await resPending.json());

    } catch(e) { 
        console.error(e); 
    } finally {
        setIsLoading(false);
    }
  };

  const approveDoctor = async (id: string, name: string) => {
      try {
          const res = await fetch(`http://localhost:5000/api/admin/approve/${id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (res.ok) {
              toast({ 
                  title: "Verified Successfully ✅", 
                  description: `Dr. ${name} is now active.` 
              });
              fetchAllData(); // Refresh everything to update counts
          } else {
              toast({ title: "Error", description: "Failed to approve.", variant: "destructive" });
          }
      } catch(e) { 
          console.error(e);
      }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6">
        <div>
            <h1 className="text-3xl font-bold mb-1 text-foreground">Admin Control Center</h1>
            <p className="text-muted-foreground">System Overview</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={fetchAllData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
                Refresh
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
        </div>
      </div>

      {/* LIVE Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Total Users */}
        <Card className="mindcare-card border-l-4 border-l-blue-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{stats.total_users}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Card 2: Active Appointments */}
        <Card className="mindcare-card border-l-4 border-l-purple-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmed Sessions</p>
              <p className="text-3xl font-bold">{stats.active_sessions}</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Verified Doctors (Replaced Flagged Content) */}
        <Card className="mindcare-card border-l-4 border-l-green-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
                <Stethoscope className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified Doctors</p>
              <p className="text-3xl font-bold">{stats.active_doctors}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" /> 
                Pending Verifications ({pendingDocs.length})
            </h2>
            
            {pendingDocs.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                        <p>All doctors verified. No pending actions.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingDocs.map((doc) => (
                        <Card key={doc.id} className="mindcare-card border-l-4 border-l-yellow-400">
                            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <User className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{doc.name}</h3>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                Pending
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{doc.email}</p>
                                        <p className="text-xs font-mono mt-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">
                                            License: {doc.license_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button 
                                        onClick={() => approveDoctor(doc.id, doc.name)} 
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                    </Button>
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none">
                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
          </div>

          {/* System Health (Static but useful) */}
          <div className="space-y-6">
            <Card className="mindcare-card">
                <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Database</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">AI Model</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Loaded</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Video Server</span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Jitsi Active</Badge>
                    </div>
                </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}