import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, Square, Loader2, BrainCircuit, RotateCcw, Calendar, FileText, Lock, Activity, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EMOTION_COLORS: Record<string, string> = {
    'Happy': '#22c55e',    'Sad': '#3b82f6',      'Angry': '#ef4444',
    'Fear': '#a855f7',     'Surprise': '#eab308', 'Neutral': '#94a3b8',
    'Disgust': '#f97316'
};

export default function VideoJournal() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [transcript, setTranscript] = useState("");
  
  // State for the modal popup
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/moods/journal-history", {
            headers: { "Authorization": "Bearer " + localStorage.getItem("mindcare-token") }
        });
        if (res.ok) setHistory(await res.json());
    } catch (err) { console.error("Failed to load history:", err); }
  };

  // --- Handle Viewing Past Entry (Opens Modal) ---
  const handleViewEntry = (entry: any) => {
    // 1. Reconstruct Chart Data from the timeline
    const chartData = entry.timeline.map((t: any) => ({
        time: `${t.time}s`,
        emotion: t.emotion,
        confidence: t.confidence || 0.5,
        value: t.confidence || 0.5,
        fill: EMOTION_COLORS[t.emotion] || '#8884d8'
    }));

    // 2. Calculate Average Confidence (if missing)
    const totalConf = entry.timeline.reduce((sum: number, t: any) => sum + (t.confidence || 0), 0);
    const avg = entry.timeline.length ? totalConf / entry.timeline.length : 0;

    // 3. Set Selected Entry for Modal
    setSelectedEntry({
        ...entry,
        avg_confidence: avg,
        chartData: chartData
    });
  };

  const startRecording = async () => {
    setVideoUrl(null);
    setAnalysisData(null);
    setTranscript("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event: any) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
                current += event.results[i][0].transcript;
            }
            setTranscript(current);
        };
        recognitionRef.current.start();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
        setVideoBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if(recognitionRef.current) recognitionRef.current.stop();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => { if (mediaRecorder.state === "recording") stopRecording(); }, 30000); 
    } catch (err) { alert("Camera access needed."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (!videoBlob) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('video', videoBlob);
    formData.append('transcript', transcript);

    try {
      const res = await fetch("http://localhost:5000/api/moods/analyze-video", {
        method: "POST",
        headers: { "Authorization": "Bearer " + localStorage.getItem("mindcare-token") },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const chartData = data.timeline.map((t: any) => ({
            time: `${t.time}s`,
            emotion: t.emotion,
            confidence: t.confidence || 0.5,
            value: t.confidence || 0.5,
            fill: EMOTION_COLORS[t.emotion] || '#8884d8'
        }));
        setAnalysisData({ ...data, chartData });
        fetchHistory();
      }
    } catch (err) { console.error(err); } 
    finally { setIsProcessing(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 px-4 animate-in fade-in pb-20">
        
        <div className="text-center space-y-4 pt-4">
            <h2 className="text-4xl md font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600:text-5xl font-black flex items-center justify-center gap-3 text-slate-900 dark:text-white tracking-tight">
                
                AI Video Journal
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                Speak your mind. We analyze your voice and expressions to visualize your emotional journey.
            </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            
            {/* LEFT: Recorder */}
            <Card className="border-none shadow-2xl bg-black overflow-hidden rounded-[2rem] relative group flex flex-col">
                <div className="relative flex-1 bg-zinc-900 flex items-center justify-center overflow-hidden min-h-[400px]">
                    {videoUrl ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" />
                    ) : isRecording ? (
                        <div className="flex flex-col items-center animate-pulse text-red-500">
                             <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center animate-ping absolute" />
                            <div className="w-4 h-4 bg-red-500 rounded-full mb-3 z-10" />
                            <span className="font-mono tracking-widest text-lg text-white z-10">RECORDING</span>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 p-8">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-zinc-700">
                                <Video className="w-10 h-10 text-zinc-500" />
                            </div>
                            <div>
                                <p className="text-white font-medium text-lg">Camera Ready</p>
                                <p className="text-zinc-500 text-sm">Tap microphone to record</p>
                            </div>
                        </div>
                    )}
                    
                    {isRecording && (
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-white text-center text-sm font-medium animate-in slide-in-from-bottom-2">
                            "{transcript || "Listening..."}"
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-center items-center gap-6 flex-shrink-0">
                    {!isRecording && !videoUrl && (
                        <Button onClick={startRecording} className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl hover:scale-110 transition-all">
                            <Mic className="w-8 h-8 text-white" />
                        </Button>
                    )}
                    {isRecording && (
                        <Button onClick={stopRecording} className="h-16 w-16 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white shadow-xl hover:scale-110 transition-all border-2 border-white/10">
                            <Square className="w-6 h-6 fill-current" />
                        </Button>
                    )}
                    {videoUrl && !isProcessing && (
                        <div className="flex gap-4 w-full justify-center flex-wrap">
                            <Button variant="secondary" onClick={startRecording} className="rounded-full h-12 px-6">
                                <RotateCcw className="w-4 h-4 mr-2" /> Redo
                            </Button>
                            <Button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700 rounded-full px-8 h-12 text-lg shadow-lg shadow-purple-900/20">
                                <BrainCircuit className="w-5 h-5 mr-2" /> Analyze
                            </Button>
                        </div>
                    )}
                    {isProcessing && (
                         <Button disabled className="rounded-full px-8 h-12 bg-zinc-800 text-zinc-400">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing AI...
                        </Button>
                    )}
                </div>
            </Card>

            {/* RIGHT: Results */}
            <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden flex flex-col">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pb-4 flex-shrink-0">
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-lg text-slate-800 dark:text-white">
                            <Activity className="w-5 h-5 text-purple-500" /> AI Analysis
                        </span>
                        {analysisData && (
                             <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1 text-xs">
                                {Math.round((analysisData.avg_confidence || 0.85) * 100)}% Accuracy
                             </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 p-6 relative overflow-auto min-h-[400px]">
                    {!analysisData ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground opacity-40 p-8">
                            <BrainCircuit className="w-24 h-24 mb-4 text-purple-200" />
                            <p className="text-lg font-medium text-slate-400">Ready to Analyze</p>
                            <p className="text-sm max-w-xs mx-auto">Record a video to unlock emotional insights.</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-2 uppercase tracking-wide">
                                    AI Narrative
                                </h4>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    "{analysisData.summary}"
                                </p>
                            </div>

                            {analysisData.transcript && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Transcript</label>
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-sm text-slate-600 dark:text-slate-400 italic max-h-32 overflow-y-auto">
                                        "{analysisData.transcript}"
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex-1 min-h-[200px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
                                <p className="text-xs text-center text-muted-foreground mb-4 font-medium">Emotional Timeline</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={analysisData.chartData} margin={{top: 5, right: 5, left: -20, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide domain={[0, 1]} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload;
                                                    return (
                                                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-zinc-100 text-xs">
                                                            <p className="font-bold mb-1">{d.time}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{background: EMOTION_COLORS[d.emotion]}}/>
                                                                <p className="font-medium">{d.emotion}</p>
                                                            </div>
                                                            <p className="text-muted-foreground mt-1">Conf: {Math.round(d.confidence * 100)}%</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                            {analysisData.chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion] || '#ddd'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Secure Indicator */}
        <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-100 dark:border-green-900">
                <Lock className="w-3 h-3" />
                Video processed securely in-memory. No footage stored.
            </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
             <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-800 dark:text-white">
                    <Calendar className="w-6 h-6 text-purple-600"/> Past Reflections
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((entry) => (
                        <Card key={entry.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-zinc-900 group h-full flex flex-col">
                            <div className="h-2 w-full" style={{ background: EMOTION_COLORS[entry.dominant_emotion] || '#ddd' }} />
                            <CardContent className="p-6 flex-1 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant="outline" className="border-zinc-200 text-zinc-500 font-normal">
                                        {new Date(entry.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </Badge>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Dominant Mood</p>
                                    <h4 className="text-xl font-bold" style={{ color: EMOTION_COLORS[entry.dominant_emotion] }}>
                                        {entry.dominant_emotion}
                                    </h4>
                                </div>

                                {entry.summary ? (
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 flex-1">
                                        <p className="text-xs text-muted-foreground italic line-clamp-3 leading-relaxed">
                                            "{entry.summary}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                <Button 
                                    variant="ghost" 
                                    onClick={() => handleViewEntry(entry)}
                                    className="w-full text-xs text-muted-foreground hover:text-purple-600 hover:bg-purple-50 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 mt-auto"
                                >
                                    View Full Analysis <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             </div>
        )}

        {/* --- ANALYSIS MODAL (Removed duplicate close button) --- */}
        <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-0 rounded-[2rem] shadow-2xl">
                {selectedEntry && (
                    <div className="flex flex-col">
                        {/* Modal Header */}
                        <DialogHeader className="bg-slate-50 dark:bg-zinc-900 p-8 border-b border-slate-100 dark:border-zinc-800 space-y-3">
                            <Badge className="w-fit bg-white border-zinc-200 text-zinc-600 hover:bg-white pointer-events-none">
                                {new Date(selectedEntry.date).toLocaleDateString()} at {new Date(selectedEntry.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </Badge>
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white">
                                <span style={{ color: EMOTION_COLORS[selectedEntry.dominant_emotion] }}>{selectedEntry.dominant_emotion}</span> Entry
                            </DialogTitle>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" /> 
                                Confidence Score: <span className="font-bold text-foreground">{Math.round((selectedEntry.avg_confidence || 0.85) * 100)}%</span>
                            </p>
                        </DialogHeader>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                             {/* Narrative */}
                             <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/50">
                                <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> AI Insight
                                </h4>
                                <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-medium">
                                    "{selectedEntry.summary}"
                                </p>
                            </div>

                            {/* Transcript */}
                            {selectedEntry.transcript && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Full Transcript
                                    </h4>
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed shadow-sm">
                                        "{selectedEntry.transcript}"
                                    </div>
                                </div>
                            )}

                             {/* Chart */}
                             <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Emotional Timeline
                                </h4>
                                <div className="h-[250px] w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={selectedEntry.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="time" hide />
                                            <YAxis hide domain={[0, 1]} />
                                            <Tooltip 
                                                cursor={{fill: 'transparent'}}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const d = payload[0].payload;
                                                        return (
                                                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-zinc-100 text-xs z-50">
                                                                <p className="font-bold mb-1">{d.time}</p>
                                                                <p style={{ color: EMOTION_COLORS[d.emotion] }} className="font-bold">{d.emotion}</p>
                                                                <p className="text-muted-foreground">Conf: {Math.round(d.confidence * 100)}%</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                                {selectedEntry.chartData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion] || '#ddd'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                             </div>

                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>

    </div>
  );
}