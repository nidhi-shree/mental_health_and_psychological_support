import { useState } from 'react';
import { Plus, MessageSquare, Heart, Clock, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const forumPosts = [
  {
    id: 1,
    title: "Dealing with exam anxiety - looking for support and tips",
    preview: "Hi everyone, I'm struggling with severe anxiety about upcoming exams. The closer they get, the more panicked I feel...",
    author: "Student123",
    category: "Anxiety",
    replies: 12,
    likes: 8,
    timeAgo: "2 hours ago",
    isHelpful: true,
  },
  {
    id: 2,
    title: "How I overcame my social anxiety - sharing my journey",
    preview: "After months of struggling with social anxiety, I wanted to share what helped me. It's been a long journey but...",
    author: "ProgressMaker",
    category: "Success Stories",
    replies: 24,
    likes: 35,
    timeAgo: "5 hours ago",
    isHelpful: true,
  },
  {
    id: 3,
    title: "Healthy sleep habits that actually work",
    preview: "I've been researching and trying different sleep techniques. Here are the ones that have made a real difference...",
    author: "SleepyStudent",
    category: "Sleep & Wellness",
    replies: 7,
    likes: 15,
    timeAgo: "1 day ago",
    isHelpful: false,
  },
  {
    id: 4,
    title: "Feeling overwhelmed with coursework - need advice",
    preview: "The semester is really intense and I'm feeling completely overwhelmed. How do you all manage heavy workloads while...",
    author: "StressedOut",
    category: "Academic Stress",
    replies: 18,
    likes: 22,
    timeAgo: "1 day ago",
    isHelpful: false,
  },
  {
    id: 5,
    title: "Support group meetup this weekend - virtual coffee chat",
    preview: "Hey everyone! Organizing a casual virtual meetup this Saturday at 3 PM for anyone who wants to connect and chat...",
    author: "CommunityHelper",
    category: "Events",
    replies: 9,
    likes: 14,
    timeAgo: "2 days ago",
    isHelpful: false,
  },
];

const categories = [
  "All Categories",
  "Anxiety",
  "Depression",
  "Academic Stress",
  "Sleep & Wellness",
  "Success Stories",
  "Events",
  "General Support",
];

export default function PeerForum() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    // Here you would typically save to database
    setIsCreateDialogOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostCategory('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Peer Support Forum</h1>
          <p className="text-muted-foreground">
            A safe space to connect, share experiences, and support each other
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mindcare-button-hero flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="mindcare-card max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Your Thoughts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What's on your mind?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All Categories').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Message</label>
                <Textarea
                  placeholder="Share your thoughts, experiences, or ask for support..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm text-primary">
                  💙 Remember: This is a supportive community. Be kind, respectful, and supportive of others' experiences.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostTitle || !newPostContent || !newPostCategory}
                  className="flex-1 mindcare-button-hero"
                >
                  Share Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="mindcare-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="mindcare-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.isHelpful && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          ✨ Helpful
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {post.preview}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {post.author}</span>
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.timeAgo}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      {post.replies} replies
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Guidelines */}
      <Card className="mindcare-card bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Be respectful:</strong> Treat all community members with kindness and respect</p>
          <p>• <strong>Stay supportive:</strong> We're here to help each other, not to judge</p>
          <p>• <strong>Protect privacy:</strong> Don't share personal information about yourself or others</p>
          <p>• <strong>Seek help when needed:</strong> If you're in crisis, please use our Emergency Help button</p>
          <p>• <strong>Report concerns:</strong> Let us know if you see content that violates our guidelines</p>
        </CardContent>
      </Card>
    </div>
  );
}