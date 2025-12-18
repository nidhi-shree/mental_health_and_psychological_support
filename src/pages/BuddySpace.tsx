import { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, UserPlus, Heart, Search, Flag, Sparkles, Shield, Zap, Lock, ArrowLeft, Send, MoreVertical, Phone, Video, UserCheck, UserX, Bell, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from "@/components/ui/switch"
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const API_URL = "http://localhost:5000/api";

// Helper to generate consistent colors for groups based on category
const getGroupColor = (name: string) => {
    const colors = [
        "bg-blue-100 text-blue-700 border-blue-200",
        "bg-green-100 text-green-700 border-green-200",
        "bg-orange-100 text-orange-700 border-orange-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-pink-100 text-pink-700 border-pink-200",
        "bg-indigo-100 text-indigo-700 border-indigo-200"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function BuddySpace() {
  // --- STATE MANAGEMENT ---
  const [buddies, setBuddies] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [groupChats, setGroupChats] = useState<any[]>([]);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null); // Group ID
  const [selectedPrivateChat, setSelectedPrivateChat] = useState<string | null>(null); // Friend ID
  const [newMessage, setNewMessage] = useState('');
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const token = localStorage.getItem('mindcare-token');
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const initializeData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchBuddies(),
                fetchFriends(),
                fetchFriendRequests(),
                fetchGroupChats(),
                fetchUnreadCount()
            ]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, privateMessages]);

  // --- API CALLS ---
  const fetchBuddies = async () => {
    const res = await fetch(`${API_URL}/buddies`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setBuddies(await res.json());
  };

  const fetchFriends = async () => {
    const res = await fetch(`${API_URL}/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setFriends(await res.json());
  };

  const fetchFriendRequests = async () => {
    const res = await fetch(`${API_URL}/friend-requests`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setFriendRequests(await res.json());
  };

  const fetchGroupChats = async () => {
    const res = await fetch(`${API_URL}/group-chats`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setGroupChats(await res.json());
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (groupId: string) => {
    const res = await fetch(`${API_URL}/messages/${groupId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setChatMessages(await res.json());
  };

  const fetchPrivateMessages = async (friendId: string) => {
    const res = await fetch(`${API_URL}/private-messages/${friendId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setPrivateMessages(await res.json());
  };

  // --- ACTIONS ---
  const handleConnect = async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/friend-request/send/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if(res.ok) {
            toast({ title: "Request Sent", description: "Hope you make a new friend!" });
            fetchBuddies(); 
        } else {
            const data = await res.json();
            toast({ title: "Error", description: data.message, variant: "destructive" });
        }
      } catch(e) { console.error(e); }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
        const res = await fetch(`${API_URL}/friend-request/accept/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if(res.ok) {
            toast({ title: "Friend Added! 🎉" });
            fetchFriendRequests();
            fetchFriends();
            fetchBuddies(); 
        } else {
            const data = await res.json();
            toast({ title: "Error", description: data.error || "Could not accept", variant: "destructive" });
        }
    } catch(e) {
        console.error(e);
        toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    }
  };

  const handleRejectRequest = async (id: string) => {
      const res = await fetch(`${API_URL}/friend-request/reject/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if(res.ok) {
          toast({ title: "Request Declined" });
          fetchFriendRequests();
      }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ group_chat_id: selectedChat, message: newMessage }),
    });
    if (res.ok) {
        fetchMessages(selectedChat);
        setNewMessage('');
    }
  };

  const sendPrivateMessage = async () => {
    if (!newPrivateMessage.trim() || !selectedPrivateChat) return;
    const res = await fetch(`${API_URL}/private-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: selectedPrivateChat, message: newPrivateMessage }),
    });
    if (res.ok) {
        fetchPrivateMessages(selectedPrivateChat);
        setNewPrivateMessage('');
    }
  };

  // --- FILTERS ---
  const filteredBuddies = buddies.filter(b => 
    (b.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (b.interests || []).some((i: string) => i.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = groupChats.filter(g =>
      (g.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (g.category?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // VIEW 1: PRIVATE CHAT INTERFACE
  // ==========================================
  if (selectedPrivateChat) {
    const friend = friends.find(f => f.id === selectedPrivateChat) || buddies.find(b => b.id === selectedPrivateChat);
    
    // Fallback UI if friend data is missing
    if (!friend) return (
        <div className="p-8 text-center">
            <p>Loading chat...</p>
            <Button onClick={() => setSelectedPrivateChat(null)}>Go Back</Button>
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto p-4">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-900 rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPrivateChat(null)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar className="h-10 w-10 border-2 border-indigo-100">
                        <AvatarImage src={!anonymousMode ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend?.name}` : ""} />
                        <AvatarFallback>{friend?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">{friend?.name}</h3>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full" /> Online
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-zinc-950">
                {privateMessages.length === 0 && (
                    <div className="text-center text-muted-foreground mt-10">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}
                {privateMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                            msg.isCurrentUser 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-zinc-800 text-foreground rounded-tl-none'
                        }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.isCurrentUser ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-b-2xl border-t">
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendPrivateMessage(); }}>
                    <Input 
                        value={newPrivateMessage}
                        onChange={(e) => setNewPrivateMessage(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 rounded-full bg-slate-100 dark:bg-zinc-800 border-0"
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
  }

  // ==========================================
  // VIEW 2: GROUP CHAT INTERFACE
  // ==========================================
  if (selectedChat) {
    const group = groupChats.find(g => g.id === selectedChat);
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto p-4">
            <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-900 rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className={`p-2 rounded-lg ${getGroupColor(group?.category || 'default').split(' ')[0]}`}>
                        <Users className={`w-6 h-6 ${getGroupColor(group?.category || 'default').split(' ')[1]}`} />
                    </div>
                    <div>
                        <h3 className="font-bold">{group?.name}</h3>
                        <p className="text-xs text-muted-foreground">{group?.members} members</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-zinc-950">
                {chatMessages.length === 0 && (
                     <div className="text-center text-muted-foreground mt-10">
                        <p>Welcome to {group?.name}! Start the conversation.</p>
                    </div>
                )}
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {!msg.isCurrentUser && <span className="text-xs text-muted-foreground ml-2 mb-1">{msg.author}</span>}
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                            msg.isCurrentUser 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-zinc-800 text-foreground rounded-tl-none'
                        }`}>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-b-2xl border-t">
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message #${group?.name}...`} 
                        className="flex-1 rounded-full bg-slate-100 dark:bg-zinc-800 border-0"
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
  }

  // ==========================================
  // VIEW 3: MAIN DASHBOARD (DISCOVER / FRIENDS)
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b">
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
                <Users className="w-10 h-10 text-indigo-600" />
                Buddy Space
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
                Connect, share, and grow with peers who understand you.
            </p>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowFriendRequests(true)} className="relative border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <Bell className="w-4 h-4 mr-2" />
                Requests
                {friendRequests.length > 0 && <Badge className="ml-2 bg-indigo-600 text-white">{friendRequests.length}</Badge>}
            </Button>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-indigo-100 shadow-sm">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium">Anonymous</span>
                <Switch checked={anonymousMode} onCheckedChange={setAnonymousMode} className="data-[state=checked]:bg-indigo-600"/>
            </div>
        </div>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-8 bg-indigo-50/50 dark:bg-zinc-900/50 p-1 rounded-xl">
          <TabsTrigger value="discover" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Discover Peers</TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">My Friends</TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Support Circles</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-8">
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by interest..." 
                    className="pl-12 h-12 text-lg rounded-full border-indigo-100 focus-visible:ring-indigo-500 bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? <div className="text-center py-20 text-muted-foreground">Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBuddies.map((buddy) => (
                        <Card key={buddy.id} className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-transparent hover:border-t-indigo-500 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-14 h-14 border-2 border-indigo-100 shadow-sm">
                                            <AvatarImage src={!anonymousMode ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${buddy.name}` : ""} />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{buddy.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-xl">{buddy.name}</h3>
                                            <p className="text-sm text-muted-foreground">{buddy.location}</p>
                                        </div>
                                    </div>
                                    {buddy.matchScore > 0 && (
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                            <Sparkles className="w-3 h-3 mr-1" /> {buddy.matchScore} Match
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 bg-indigo-50/50 dark:bg-zinc-800/50 p-4 rounded-xl italic leading-relaxed">"{buddy.bio}"</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {buddy.interests.slice(0, 3).map((tag: string) => (
                                        <Badge key={tag} variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50/30">{tag}</Badge>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {buddy.isFriend ? (
                                        <Button 
                                            onClick={() => {
                                                setSelectedPrivateChat(buddy.id);
                                                fetchPrivateMessages(buddy.id);
                                            }} 
                                            className="w-full bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-50"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" /> Chat
                                        </Button>
                                    ) : buddy.friendRequestReceived ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button onClick={() => handleAcceptRequest(buddy.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                                <Check className="w-4 h-4 mr-1" /> Accept
                                            </Button>
                                            <Button variant="outline" onClick={() => handleRejectRequest(buddy.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                                <X className="w-4 h-4 mr-1" /> Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                             <Button 
                                                onClick={() => handleConnect(buddy.id)} 
                                                disabled={buddy.friendRequestSent}
                                                className={`flex-1 ${buddy.friendRequestSent ? 'opacity-70 bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                                            >
                                                {buddy.friendRequestSent ? "Request Sent" : <><UserPlus className="w-5 h-5 mr-2" /> Connect</>}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>

        {/* 2. FRIENDS TAB */}
        <TabsContent value="friends" className="space-y-8">
             {friends.length === 0 ? (
                 <div className="text-center py-20 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30">
                     <Users className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                     <p className="text-lg text-muted-foreground font-medium">No friends yet.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {friends.map((friend) => (
                         <Card key={friend.id} className="hover:shadow-lg transition-all border-indigo-100 overflow-hidden">
                             <CardContent className="p-6">
                                 <div className="flex items-center gap-4 mb-6">
                                     <Avatar className="w-14 h-14 border-2 border-indigo-100">
                                         <AvatarImage src={!anonymousMode ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}` : ""} />
                                         <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{friend.name[0]}</AvatarFallback>
                                     </Avatar>
                                     <div>
                                         <h3 className="font-bold text-lg">{friend.name}</h3>
                                         <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                             <span className="w-2 h-2 bg-green-500 rounded-full" /> Online
                                         </p>
                                     </div>
                                 </div>
                                 <Button onClick={() => { setSelectedPrivateChat(friend.id); fetchPrivateMessages(friend.id); }} className="w-full bg-white text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl h-11 font-semibold shadow-sm">
                                     <MessageCircle className="w-5 h-5 mr-2" /> Message
                                 </Button>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             )}
        </TabsContent>

        {/* 3. GROUPS TAB */}
        <TabsContent value="groups" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* If using filteredGroups, make sure they are filtered by category too if needed */}
                {filteredGroups.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-indigo-50/30 rounded-xl border-2 border-dashed border-indigo-200">
                        <p className="text-muted-foreground">No support circles found matching your search.</p>
                    </div>
                ) : (
                    filteredGroups.map((group) => {
                        const style = getGroupColor(group.category || 'Default');
                        return (
                        <Card key={group.id} className={`hover:shadow-lg transition-all cursor-pointer group border-l-4 overflow-hidden ${style.split(' ')[2] || 'border-indigo-500'}`} onClick={() => { setSelectedChat(group.id); fetchMessages(group.id); }}>
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${style.split(' ').slice(0,2).join(' ')}`}>
                                    <Users className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl group-hover:opacity-80 transition-colors mb-1">{group.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{group.description}</p>
                                    <p className="text-xs font-medium mt-3 opacity-70 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {group.members} members
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-indigo-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all"><ArrowLeft className="w-6 h-6 rotate-180" /></Button>
                            </CardContent>
                        </Card>
                    )})
                )}
            </div>
        </TabsContent>
      </Tabs>

      {/* Friend Requests Dialog */}
      <Dialog open={showFriendRequests} onOpenChange={setShowFriendRequests}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Friend Requests</DialogTitle></DialogHeader>
          {friendRequests.length === 0 ? <p className="text-center py-8 text-muted-foreground">No pending requests.</p> : (
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                 {friendRequests.map(req => (
                     <div key={req.id} className="flex justify-between items-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                         <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10 border border-indigo-200">
                                 <AvatarImage src={!anonymousMode ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.name}` : ""} />
                                 <AvatarFallback className="bg-indigo-100 text-indigo-700">{req.name[0]}</AvatarFallback>
                             </Avatar>
                             <span className="font-semibold text-indigo-900">{req.name}</span>
                         </div>
                         <div className="flex gap-2">
                             <Button size="sm" onClick={() => handleAcceptRequest(req.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Accept</Button>
                             <Button size="sm" variant="ghost" onClick={() => handleRejectRequest(req.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">Decline</Button>
                         </div>
                     </div>
                 ))}
             </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl flex items-start gap-4 mt-12 border border-indigo-100 shadow-sm">
        <Shield className="w-8 h-8 text-indigo-600 shrink-0 mt-1" />
        <div>
            <h4 className="font-bold text-lg text-indigo-900 dark:text-indigo-300 mb-1">Safe Space Guidelines</h4>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/70 leading-relaxed">
                This is a supportive community. Be respectful and kind. Harassment or hate speech will not be tolerated. Use the report button <Flag className="w-3 h-3 inline mx-1 text-red-500"/> if you encounter any issues.
            </p>
        </div>
      </div>
    </div>
  );
}