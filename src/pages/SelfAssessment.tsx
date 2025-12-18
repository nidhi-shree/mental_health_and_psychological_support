import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, AlertTriangle, BrainCircuit, RefreshCw, ThermometerSun, Activity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// --- DATA ---
const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly, or being fidgety/restless",
  "Thoughts that you would be better off dead or of hurting yourself",
];

const gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const responseOptions = [
  { value: 0, label: "Not at all", emoji: "😌" },
  { value: 1, label: "Several days", emoji: "🤔" },
  { value: 2, label: "More than half", emoji: "😣" },
  { value: 3, label: "Nearly every day", emoji: "😫" },
];

// --- THEMES ---
// Different color palettes based on the user's initial emotion
const themes = {
  default: "bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-950",
  calm: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800", // For Fear/Anger
  warm: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800", // For Sadness
  energetic: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-zinc-900 dark:to-green-900/20", // For Happy
};

export default function SelfAssessment() {
  const [step, setStep] = useState<'intro' | 'calibrating' | 'questions' | 'results'>('intro');
  const [assessmentType, setAssessmentType] = useState<'phq9' | 'gad7'>('phq9');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [uiTheme, setUiTheme] = useState(themes.default);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- AI CALIBRATION LOGIC ---
  const startCalibration = async (type: 'phq9' | 'gad7') => {
    setAssessmentType(type);
    setStep('calibrating');
    
    // 1. Start Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      // 2. Wait 2.5 seconds to "Scan" then analyze
      setTimeout(async () => {
        await captureAndAnalyze();
        // Stop Camera
        stream.getTracks().forEach(t => t.stop());
        setStep('questions');
      }, 2500); 
    } catch (e) {
      console.error("Cam error", e);
      setStep('questions'); // Fallback if no camera
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
        if(!blob) return;
        const formData = new FormData();
        formData.append('image', blob);
        
        try {
            // Adjust URL to match your Flask backend
            const res = await fetch("http://localhost:5000/api/moods/detect-emotion", {
                method: "POST",
                headers: { "Authorization": "Bearer " + localStorage.getItem("mindcare-token") },
                body: formData
            });
            const data = await res.json();
            if(data.emotion) {
                setDetectedEmotion(data.emotion);
                applyAdaptiveTheme(data.emotion);
            }
        } catch(err) { console.error(err); }
    }, 'image/jpeg');
  };

  const applyAdaptiveTheme = (emotion: string) => {
    // Switch the UI colors based on what the AI saw
    if (['Fear', 'Angry', 'Disgust'].includes(emotion)) setUiTheme(themes.calm);
    else if (['Sad', 'Neutral'].includes(emotion)) setUiTheme(themes.warm);
    else if (['Happy', 'Surprise'].includes(emotion)) setUiTheme(themes.energetic);
  };

  // --- QUIZ LOGIC ---
  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    // Auto-advance with a tiny delay for the animation
    if (currentQIndex < (assessmentType === 'phq9' ? phq9Questions.length : gad7Questions.length) - 1) {
      setTimeout(() => setCurrentQIndex(prev => prev + 1), 250); 
    } else {
      setTimeout(() => finishAssessment(newAnswers), 250);
    }
  };

  const finishAssessment = async (finalAnswers: number[]) => {
    // You can add your fetch('http://localhost:5000/api/assessments/') here to save to DB
    setStep('results');
  };

  const resetAssessment = () => {
    setStep('intro');
    setAnswers([]);
    setCurrentQIndex(0);
    setDetectedEmotion(null);
    setUiTheme(themes.default);
  };

  // --- RENDER HELPERS ---
  const questions = assessmentType === 'phq9' ? phq9Questions : gad7Questions;
  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex + 1) / questions.length) * 100;
  const score = answers.reduce((a, b) => a + b, 0);

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${uiTheme} p-6 flex flex-col items-center justify-center`}>
      
      <AnimatePresence mode='wait'>
        
        {/* 1. SELECTION SCREEN */}
        {step === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full space-y-8 text-center"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Mental Wellness Check
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                We'll use AI to adapt the environment to your current state, then guide you through a private clinical screening.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* PHQ-9 Card */}
              <Card className="hover:scale-105 transition-all cursor-pointer border-l-4 border-l-orange-400 shadow-lg hover:shadow-orange-100 dark:hover:shadow-none" onClick={() => startCalibration('phq9')}>
                <CardContent className="p-6 text-left">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <ThermometerSun className="text-orange-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Depression Screening</h3>
                  <p className="text-sm text-muted-foreground mt-2">PHQ-9 Standard • 9 Questions</p>
                </CardContent>
              </Card>

              {/* GAD-7 Card */}
              <Card className="hover:scale-105 transition-all cursor-pointer border-l-4 border-l-blue-400 shadow-lg hover:shadow-blue-100 dark:hover:shadow-none" onClick={() => startCalibration('gad7')}>
                <CardContent className="p-6 text-left">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <BrainCircuit className="text-blue-600 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Anxiety Screening</h3>
                  <p className="text-sm text-muted-foreground mt-2">GAD-7 Standard • 7 Questions</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* 2. CALIBRATION (THE WOW FACTOR) */}
        {step === 'calibrating' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)]">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
                <RefreshCw className="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-semibold animate-pulse">Calibrating Environment...</h2>
            <p className="text-muted-foreground mt-2">Our AI is detecting your emotional baseline to adjust the UI.</p>
          </motion.div>
        )}

        {/* 3. QUESTIONS (GAMIFIED) */}
        {step === 'questions' && (
          <motion.div 
            key={currentQIndex}
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl w-full"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8">
              <Badge variant="outline" className="px-3 py-1 bg-white/50 backdrop-blur-sm">
                {detectedEmotion ? (
                    <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        Adapted to: {detectedEmotion}
                    </span>
                ) : "Standard Mode"}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Card */}
            <h2 className="text-3xl font-bold mb-8 leading-tight text-center text-foreground">
              {currentQ}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responseOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="group relative p-6 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:shadow-xl transition-all text-left shadow-sm"
                >
                  <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">{opt.emoji}</span>
                  <span className="font-semibold text-lg">{opt.label}</span>
                </button>
              ))}
            </div>

            <Progress value={progress} className="h-2 mt-12 bg-gray-200 dark:bg-gray-800" />
          </motion.div>
        )}

        {/* 4. RESULTS (DASHBOARD) */}
        {step === 'results' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Assessment Complete</h2>
              <p className="text-muted-foreground mb-8">Here is your wellness breakdown.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Score</p>
                <p className="text-4xl font-black text-primary mt-2">{score}</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Emotional Vibe</p>
                <p className="text-4xl font-black text-purple-600 mt-2">{detectedEmotion || "N/A"}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-8">
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300">
                    <Activity className="w-4 h-4" /> Recommended Next Step
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300/80">
                    {score > 10 
                        ? "Your score suggests moderate symptoms. We recommend trying our 'Video Journaling' feature to explore your feelings further."
                        : "Your score is within a healthy range. Keep up your routine! Try a 'Smile Trainer' session to boost your mood."}
                </p>
            </div>

            <Button onClick={resetAssessment} className="w-full h-12 text-lg rounded-xl">
              Back to Dashboard
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
