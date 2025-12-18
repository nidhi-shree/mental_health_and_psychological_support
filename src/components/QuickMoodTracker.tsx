import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const moods = [
  { emoji: '🤩', label: 'Great', value: 5, color: 'bg-green-100 text-green-600 border-green-200' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { emoji: '😟', label: 'Low', value: 2, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { emoji: '😣', label: 'Bad', value: 1, color: 'bg-red-100 text-red-600 border-red-200' },
];

export function QuickMoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleMoodSelect = async (moodValue: number) => {
    setSelectedMood(moodValue);
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const token = localStorage.getItem('mindcare-token');
      if (!token) {
        toast.error("Please login to log your mood");
        setIsSubmitting(false);
        return;
      }

      // --- THE REAL BACKEND CALL (Restored) ---
      const res = await fetch('http://localhost:5000/api/moods/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mood: moodValue,
          activities: [] // Quick log sends empty activities
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Success State
        setIsSuccess(true);
        toast.success("Mood logged successfully!");
      } else {
        // Error State
        toast.error(data.error || "Failed to log mood");
        setSelectedMood(null); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection failed. Is the backend running?");
      setSelectedMood(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mindcare-card border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-700">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          How are you feeling right now?
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <div className="flex justify-between items-center gap-2 sm:gap-4 max-w-2xl mx-auto py-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                disabled={isSubmitting}
                className={`
                  group flex flex-col items-center gap-2 transition-all duration-300
                  ${selectedMood === mood.value ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className={`
                  w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-sm border-2 transition-all
                  ${selectedMood === mood.value ? `${mood.color} ring-2 ring-offset-2 ring-purple-300` : 'bg-white border-slate-100 group-hover:border-purple-200'}
                `}>
                  {isSubmitting && selectedMood === mood.value ? (
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  ) : (
                    mood.emoji
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${selectedMood === mood.value ? 'text-purple-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Mood Logged</p>
                <p className="text-xs text-green-700">Thanks for checking in!</p>
              </div>
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setIsSuccess(false); setSelectedMood(null); }} 
                    className="text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                    Undo
                </Button>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm">
                <Link to="/mood">
                    See Trends <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}