import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CheckCircle, XCircle, BrainCircuit, X, Sparkles, Maximize2 } from 'lucide-react';

interface MoodMirrorProps {
  onMoodDetected: (moodScore: number, emotionLabel: string) => void;
}

export default function MoodMirror({ onMoodDetected }: MoodMirrorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [finalResult, setFinalResult] = useState<{ emotion: string; confidence: number; mapped_mood: number } | null>(null);
  
  const samplesRef = useRef<Array<{ emotion: string; confidence: number; mapped_mood: number }>>([]);

  // --- Camera Logic ---
  const startCamera = async () => {
    setIsActive(true);
    setFinalResult(null);
    // Slight delay to allow modal animation to start
    setTimeout(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please allow permissions.");
            setIsActive(false);
        }
    }, 100);
  };

  const stopCamera = () => {
    setIsActive(false);
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // --- Scanning Logic (3 Seconds, 5 Samples) ---
  const startScanning = async () => {
    setIsScanning(true);
    setScanProgress(0);
    samplesRef.current = [];
    setFinalResult(null);

    let count = 0;
    const maxSamples = 5;

    const interval = setInterval(async () => {
      count++;
      setScanProgress((count / maxSamples) * 100);
      
      await captureAndAnalyze();

      if (count >= maxSamples) {
        clearInterval(interval);
        calculateFinalResult();
        setIsScanning(false);
      }
    }, 600); // 600ms * 5 = 3 seconds
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    return new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
            if (!blob) { resolve(); return; }
            
            const formData = new FormData();
            formData.append('image', blob);

            try {
                // Adjust URL if needed
                const res = await fetch("http://localhost:5000/api/moods/detect-emotion", {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + localStorage.getItem("mindcare-token") },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.confidence > 0.4) {
                        samplesRef.current.push(data);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                resolve();
            }
        }, 'image/jpeg');
    });
  };

  const calculateFinalResult = () => {
    const samples = samplesRef.current;
    
    if (samples.length === 0) {
        setFinalResult(null);
        alert("We couldn't see your face clearly. Please check lighting and try again.");
        return;
    }

    const counts: Record<string, number> = {};
    samples.forEach(s => { counts[s.emotion] = (counts[s.emotion] || 0) + 1; });

    let winner = "";
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            winner = emotion;
        }
    }

    const winningSamples = samples.filter(s => s.emotion === winner);
    const avgConf = winningSamples.reduce((sum, s) => sum + s.confidence, 0) / winningSamples.length;
    const moodScore = winningSamples[0].mapped_mood;

    setFinalResult({
        emotion: winner,
        confidence: avgConf,
        mapped_mood: moodScore
    });
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <>
      {/* 1. The Trigger Card (Visible on Dashboard) */}
      <Card className="mindcare-card w-full text-center hover:shadow-md transition-all cursor-pointer border-dashed border-2 hover:border-purple-300 group bg-gradient-to-b from-white to-purple-50/30 dark:from-zinc-900 dark:to-purple-900/10" onClick={startCamera}>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">AI Mood Mirror</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Not sure how you feel? Tap to open the magic mirror and let AI help.
            </p>
          </div>
          <Button variant="outline" className="rounded-full mt-2 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <Maximize2 className="w-4 h-4 mr-2" /> Open Mirror
          </Button>
        </CardContent>
      </Card>

      {/* 2. The Fullscreen Overlay (The "Wow" Factor) */}
      {isActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 p-4">
          
          {/* Close Button */}
          <button 
            onClick={stopCamera}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-8 animate-in zoom-in-95 duration-500 delay-75">
            
            {/* Header Text */}
            {!finalResult && (
                <div className="text-center space-y-2 text-white">
                    <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                        <BrainCircuit className="w-8 h-8 text-purple-400" /> 
                        Mood Analysis
                    </h2>
                    <p className="text-white/70 text-sm font-medium">
                        Relax your face. Take a deep breath. Look into the mirror.
                    </p>
                </div>
            )}

            {/* THE MIRROR (Video Feed) */}
            <div className="relative group">
                {/* Glowing Aura Effect */}
                <div className={`absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse ${
                    isScanning ? "opacity-70 scale-105 duration-1000" : "duration-3000"
                }`}></div>

                {/* Video Element */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-black">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-700 ${
                            isScanning ? "scale-110 brightness-110 saturate-125" : "scale-100"
                        }`} 
                    />
                    
                    {/* Scanning Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <RefreshCw className="w-12 h-12 text-white animate-spin mb-3" />
                            <span className="text-white font-semibold tracking-wider text-lg">SCANNING...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls / Results Area */}
            <div className="w-full max-w-sm">
                
                {/* State: Ready to Scan */}
                {!isScanning && !finalResult && (
                    <Button 
                        onClick={startScanning} 
                        size="lg" 
                        className="w-full rounded-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)] transform transition hover:scale-105 active:scale-95"
                    >
                        Start Scan
                    </Button>
                )}

                {/* State: Scanning Progress */}
                {isScanning && (
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs text-white/80 font-medium px-2">
                            <span>Analyzing micro-expressions...</span>
                            <span>{Math.round(scanProgress)}%</span>
                        </div>
                        <Progress value={scanProgress} className="h-2 bg-white/20" />
                    </div>
                )}

                {/* State: Result */}
                {finalResult && (
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-white/10 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="text-center mb-6">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                We Detected
                            </p>
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
                                {finalResult.emotion}
                            </h2>
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 px-3 py-1">
                                {(finalResult.confidence * 100).toFixed(0)}% Confidence
                            </Badge>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent my-5"></div>

                        <p className="text-sm text-center font-medium mb-4 text-foreground/80">
                            Does this match how you feel inside?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                onClick={() => {
                                    onMoodDetected(finalResult.mapped_mood, finalResult.emotion);
                                    stopCamera();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl text-base"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Yes
                            </Button>

                            <Button 
                                variant="outline"
                                onClick={() => {
                                    stopCamera();
                                    alert("That's okay! It's important to trust your own feelings. Please log manually.");
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl text-base"
                            >
                                <XCircle className="w-5 h-5 mr-2" />
                                No
                            </Button>
                        </div>
                        
                        <div className="mt-4 text-center">
                            <button 
                                onClick={startScanning} 
                                className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                            >
                                Retake Scan
                            </button>
                        </div>
                    </div>
                )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}