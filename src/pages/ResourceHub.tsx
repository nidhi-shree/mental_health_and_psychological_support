import { useState, useEffect } from 'react';
import { Search, BookOpen, Video, Headphones, Brain, Heart, Play, Clock, X, Sparkles, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ResourceHub() {
  const [resources, setResources] = useState<{ [key: string]: any[] }>({
    articles: [],
    videos: [],
    meditations: [],
    audios: [],
    strategies: [],
  });
  
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('articles');
  const [loading, setLoading] = useState(true);

  // Convert YouTube URLs to proper embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
    return url;
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/resources/');
        const data = await res.json();

        const grouped: any = { articles: [], videos: [], meditations: [], audios: [], strategies: [] };
        data.forEach((r: any) => {
          if (grouped[r.type]) {
            grouped[r.type].push(r);
          }
        });

        setResources(grouped);
      } catch (err) {
        console.error('Failed to fetch resources', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filterResources = (items: any[]) => {
    if (!items) return [];
    if (!searchTerm) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  // --- FEATURED BUTTON HANDLER ---
  const handleFeaturedClick = () => {
      setSearchTerm("Stress"); 
      setActiveTab("meditations");
      const tabsElement = document.getElementById('resource-tabs');
      if (tabsElement) {
          tabsElement.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const ResourceCard = ({ resource }: { resource: any }) => (
    <Card
      // FIX: Added '[mask-image:radial-gradient(white,black)]' 
      // This forces the browser to strictly clip the content to the rounded corners during animations
      className="group h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-zinc-900 overflow-hidden cursor-pointer hover:-translate-y-1 isolation-isolate ring-1 ring-zinc-900/5 dark:ring-zinc-100/10 [mask-image:radial-gradient(white,black)]"
      onClick={() => setSelectedResource(resource)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Thumbnail Container */}
        <div className="aspect-[4/3] w-full overflow-hidden relative">
          <img
            src={resource.thumbnail || "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=800&auto=format&fit=crop"} 
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Time Badge */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md text-zinc-800 dark:text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1.5 z-10">
             <Clock className="w-3 h-3" />
             {resource.read_time || resource.duration || resource.difficulty || "5m"}
          </div>
          
          {/* Play Button Overlay */}
          {(resource.type === 'videos' || resource.type === 'meditations') && (
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 z-10">
                <div className="bg-white text-primary rounded-full p-4 shadow-2xl">
                    <Play className="w-6 h-6 fill-current ml-1" />
                </div>
             </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1 relative z-10 bg-white dark:bg-zinc-900">
          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-xl leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {resource.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {resource.description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {resource.tags?.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="rounded-lg px-3 py-1 font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header Section */}
      <div className="text-center space-y-6 pt-8">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 pb-2">
            Resource Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          Curated tools for your mind. Explore articles, meditations, and strategies designed for your well-being.
        </p>
      </div>

      {/* 2. Floating Search Bar */}
      <div className="max-w-2xl mx-auto relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-indigo-200 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center px-2 py-1 border border-zinc-100 dark:border-zinc-800">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-400 ml-1">
                <Search className="w-5 h-5" />
            </div>
            <Input
                placeholder="Search topics, feelings, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-lg h-14 px-4 placeholder:text-muted-foreground/50"
            />
        </div>
      </div>

      {/* 3. Featured Card (Compact Version) */}
      <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden relative bg-slate-900 text-white group max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 opacity-90" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        
        <CardContent className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-medium">
                <Sparkles className="w-3 h-3 text-yellow-300" /> 
                <span>Featured Collection</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                Finding Calm in Chaos
            </h2>
            <p className="text-indigo-100 text-base leading-relaxed">
                A specially curated set of meditations and articles to help you navigate stressful times with grace and resilience.
            </p>
            <Button 
                size="default" 
                onClick={handleFeaturedClick}
                className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 shadow-lg hover:shadow-xl transition-all"
            >
                Explore Collection
            </Button>
          </div>
          
          <div className="hidden md:flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center rotate-12 shadow-lg border border-white/10">
                  <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center -rotate-6 shadow-xl border border-white/20 mt-8">
                  <Heart className="w-8 h-8 text-pink-300 fill-pink-300" />
              </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Filter Tabs */}
      <Tabs id="resource-tabs" value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        
        <div className="flex justify-center">
            <TabsList className="h-auto p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800 flex-wrap justify-center gap-2">
                {[
                    { id: 'articles', label: 'Read', icon: BookOpen },
                    { id: 'videos', label: 'Watch', icon: Video },
                    { id: 'meditations', label: 'Meditate', icon: Brain },
                    { id: 'audios', label: 'Listen', icon: Headphones },
                    { id: 'strategies', label: 'Practice', icon: Heart },
                ].map((tab) => (
                    <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        className="rounded-full px-6 py-3 data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-300"
                    >
                        <tab.icon className="w-4 h-4 mr-2" /> 
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>

        {/* Content Grids */}
        {['articles', 'videos', 'meditations', 'audios', 'strategies'].map((type) => (
            <TabsContent key={type} value={type} className="focus-visible:outline-none animate-in slide-in-from-bottom-4 duration-500">
                
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-80 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : filterResources(resources[type] || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filterResources(resources[type] || []).map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                            <Search className="w-6 h-6" />
                        </div>
                        <p className="text-zinc-500 font-medium">No {type} found matching "{searchTerm}".</p>
                        <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-primary">Clear Filters</Button>
                    </div>
                )}
            </TabsContent>
        ))}
      </Tabs>

      {/* 5. MODAL VIEWER */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setSelectedResource(null)}
          />
          
          <div className="bg-white dark:bg-zinc-950 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800">
            
            <div className="relative bg-black group">
                <Button
                    size="icon"
                    className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white border-none backdrop-blur-md h-10 w-10"
                    onClick={() => setSelectedResource(null)}
                >
                    <X className="w-5 h-5" />
                </Button>

                {(selectedResource.type === 'videos' || selectedResource.type === 'meditations') ? (
                    <div className="aspect-video w-full">
                        <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(selectedResource.url)}
                            title={selectedResource.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <h2 className="text-2xl md:text-4xl font-bold text-white relative z-10 max-w-2xl leading-tight">
                            {selectedResource.title}
                        </h2>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/50">
                
                <div className="flex flex-wrap items-center gap-4">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                        {selectedResource.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {selectedResource.read_time || selectedResource.duration || "5 min read"}
                    </span>
                </div>

                {selectedResource.type === 'audios' && (
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <audio controls className="w-full">
                            <source src={selectedResource.url} />
                        </audio>
                    </div>
                )}

                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-bold mb-4 text-foreground">About this resource</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {selectedResource.description}
                    </p>
                </div>

                {(selectedResource.type === 'articles' || selectedResource.type === 'strategies') && (
                    <div className="flex justify-start pt-4">
                        <Button asChild size="lg" className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                                Read Full Article <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    </div>
                )}

                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Related Topics</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedResource.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="rounded-lg px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}