import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, User, Shield, Stethoscope, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const token = localStorage.getItem('mindcare-token');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter logic
    const lowerSearch = search.toLowerCase();
    const filtered = users.filter(u => 
        u.name.toLowerCase().includes(lowerSearch) || 
        u.email.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure? This action cannot be undone.")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast({ title: "User Deleted", description: "The account has been removed." });
            setUsers(prev => prev.filter(u => u.id !== id));
        } else {
            const err = await res.json();
            toast({ title: "Error", description: err.error, variant: "destructive" });
        }
    } catch (error) {
        console.error(error);
    }
  };

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><Shield className="w-3 h-3 mr-1"/> Admin</Badge>;
          case 'psychologist': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200"><Stethoscope className="w-3 h-3 mr-1"/> Doctor</Badge>;
          default: return <Badge variant="secondary" className="bg-slate-100 text-slate-700"><User className="w-3 h-3 mr-1"/> User</Badge>;
      }
  };

  return (
    <div className="p-6 md:p-10 bg-background min-h-screen animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold mb-1">User Management</h1>
            <p className="text-muted-foreground">View and manage all registered accounts.</p>
        </div>
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name or email..." 
                className="pl-9 bg-white dark:bg-zinc-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <Card className="mindcare-card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                        <th className="px-6 py-4 font-medium">Name / Email</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {isLoading ? (
                        <tr><td colSpan={5} className="p-8 text-center">Loading users...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found matching "{search}"</td></tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="bg-white dark:bg-card hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_verified ? (
                                        <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"/> Verified
                                        </span>
                                    ) : (
                                        <span className="text-orange-600 flex items-center gap-1 text-xs font-medium">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"/> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.join_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}