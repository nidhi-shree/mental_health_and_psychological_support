
import { Calendar, TrendingUp, Smile, Meh, Frown, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import MoodMirror from '@/components/MoodMirror'; 
import { useRef } from 'react'; 
// ---- Date helper to avoid timezone bug ----
function formatDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// Helper to check if a date is in the current week (Mon-Sun)
const isInCurrentWeek = (dateStr: string) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  
  // Calculate "Monday" of the current week
  // If today is Sun(0), we go back 6 days. If Mon(1), go back 0.
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  // Compare the entry date
  // Note: We create a date object from the string and reset hours to avoid timezone mismatches
  const entryDate = new Date(dateStr);
  entryDate.setHours(12, 0, 0, 0); // Set to noon to avoid edge-case timezone shifts
  
  return entryDate >= monday && entryDate <= sunday;
};
const moodEmojis = [
  { emoji: '😄', value: 5, label: 'Excellent', color: 'text-green-500' },
  { emoji: '😊', value: 4, label: 'Good', color: 'text-blue-500' },
  { emoji: '😐', value: 3, label: 'Okay', color: 'text-yellow-500' },
  { emoji: '😔', value: 2, label: 'Low', color: 'text-orange-500' },
  { emoji: '😢', value: 1, label: 'Very Low', color: 'text-red-500' },
];

const activities = [
  'Exercise', 'Sleep Well', 'Social Time', 'Work/Study',
  'Meditation', 'Hobbies', 'Nature', 'Music'
];


export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [weeklyMoodData, setWeeklyMoodData] = useState<any[]>([]);
  const [monthlyMoods, setMonthlyMoods] = useState<any[]>([]); // array of {date, mood, activities}
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const token = localStorage.getItem('mindcare-token');
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
const [insightsJson, setInsightsJson] = useState<any>(null);

useEffect(() => {
    const fetchMoods = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/moods/", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("mindcare-token"),
          },
        });

        const data = await res.json();

        // 1. Set FULL history for the Heatmap & AI Insights
        setMonthlyMoods(data);

        // 2. Filter ONLY current week for the Trend Chart
        const currentWeekData = data.filter((item: any) => isInCurrentWeek(item.date));
        setWeeklyMoodData(currentWeekData);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMoods();
  }, []);

  
  
  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };
  const mirrorRef = useRef<HTMLDivElement>(null);

const scrollToMirror = () => {
  mirrorRef.current?.scrollIntoView({ behavior: 'smooth' });
};

// Callback when AI detects mood
// Callback when AI detects mood
const handleAiMoodSelection = (moodVal: number, emotionLabel: string) => {
  // 1. Select the emoji (1-5)
  setSelectedMood(moodVal);

  // 2. Auto-Tag the specific emotion as an "Activity/Factor"
  // We check if it's already selected to avoid duplicates
  const aiTag = `AI: ${emotionLabel}`; 
  if (!selectedActivities.includes(aiTag)) {
    setSelectedActivities(prev => [...prev, aiTag]);
  }

  // 3. Smooth scroll back up
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  const handleSubmit = async () => {
  if (!selectedMood) return;

  try {
    const res = await fetch('http://localhost:5000/api/moods/', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("mindcare-token")
  },
  body: JSON.stringify({
    mood: selectedMood,
    activities: selectedActivities
  })
});

    
    const data = await res.json();

    if (res.ok) {
      const newEntry = {
        date: data.date, // <-- use backend date
        mood: data.mood,
        activities: data.activities
      };

      // Replace if entry for same date already exists
      setWeeklyMoodData(prev => {
        const otherDays = prev.filter(d => d.date !== newEntry.date);
        return [...otherDays, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
      setMonthlyMoods(prev => {
  const other = prev.filter(d => d.date !== newEntry.date);
  return [...other, newEntry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
});


      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedMood(null);
        setSelectedActivities([]);
      }, 2000);

      alert(data.message); // show "Mood logged successfully" or "Mood updated successfully"

    } else {
      alert(data.error || "Failed to log mood");
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Try again later.");
  }
};
// ---------- Month heatmap helpers ----------
  const getCurrentMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days; // array of Date objects for current month
  };

  // create a map of dateStr -> mood entry for quick lookup
  const moodMap = monthlyMoods.reduce((acc: any, item: any) => {
  const dateKey = (item.date + "").split("T")[0];
  acc[dateKey] = item;
  return acc;
}, {});


  const colorForMood = (moodVal?: number) => {
    if (!moodVal) return 'bg-muted';
    if (moodVal >= 4) return 'bg-green-500';
    if (moodVal >= 3) return 'bg-blue-500';
    if (moodVal >= 2) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  // ---------- AI insights ----------
 const fetchAiInsights = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/moods/ai-insights", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    const parsed = typeof data.insights === "string" 
      ? JSON.parse(data.insights) 
      : data.insights;

    setInsightsJson(parsed);
    setInsightsModalOpen(true);

  } catch (err) {
    console.error(err);
    alert("Failed to get AI insights.");
  }
};


  // ---------- PDF download ----------
  const downloadPdf = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/moods/export-pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to download PDF');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindcare_mood_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF');
    }
  };

  // UI helpers
  const days = getCurrentMonthDays();
  const activeCount = Object.keys(moodMap).length;

  const allActivities = monthlyMoods.flatMap(d => d.activities);

const mostFrequent = allActivities.sort((a,b) =>
  allActivities.filter(v=>v===b).length - allActivities.filter(v=>v===a).length
)[0] || 'None';
  const getWeekAlignedData = () => {
  const week = new Array(7).fill(null); 

  weeklyMoodData.forEach(entry => {
    const dayIndex = new Date(entry.date).getDay(); 
    // JS getDay(): Sun=0, Mon=1 ... Sat=6

    const correctedIndex = (dayIndex === 0 ? 6 : dayIndex - 1);
    // convert → Mon=0 ... Sun=6

    week[correctedIndex] = entry;
  });

  return week;
};

const alignedWeek = getWeekAlignedData();


  const getAverageMood = () => {
    const sum = weeklyMoodData.reduce((acc, day) => acc + day.mood, 0);
    return (sum / weeklyMoodData.length).toFixed(1);
  };

  const getMoodInsights = () => {
    const recentMoods = weeklyMoodData.slice(-3);
    const avgRecent = recentMoods.reduce((acc, day) => acc + day.mood, 0) / recentMoods.length;

    if (avgRecent >= 4) {
      return {
        message: "You've been feeling great lately! Keep up the positive momentum.",
        suggestion: "Continue with activities that bring you joy and consider sharing your strategies with others.",
        icon: <Heart className="h-5 w-5 text-green-500" />
      };
    } else if (avgRecent >= 3) {
      return {
        message: "Your mood has been stable. There's room for some uplifting activities.",
        suggestion: "Try incorporating more exercise or social activities into your routine.",
        icon: <Zap className="h-5 w-5 text-blue-500" />
      };
    } else {
      return {
        message: "It looks like you've been going through a tough time. That's okay and normal.",
        suggestion: "Consider reaching out to our support chat or booking a professional appointment.",
        icon: <Heart className="h-5 w-5 text-orange-500" />
      };
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Card className="mindcare-card text-center animate-fade-in">
          <CardContent className="p-8">
            <div className="text-6xl mb-4 animate-bounce-gentle">✨</div>
            <h2 className="text-2xl font-bold mb-2">Mood Logged Successfully!</h2>
            <p className="text-muted-foreground">
              Thank you for taking time to reflect on your wellbeing today.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Daily Mood Check-in</h1>
        <p className="text-muted-foreground">
          Track your emotions and activities to better understand your mental health patterns.
        </p>
        <Button onClick={fetchAiInsights}>AI Insights</Button>
          <Button variant="outline" onClick={downloadPdf}>Download PDF</Button>
      </div>

      {/* Today's Mood Entry */}
      <Card className="mindcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            
            {/* --- NEW HEADER WITH AI BUTTON --- */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select your mood:</h3>
              <Button 
                variant="link" 
                onClick={scrollToMirror}
                className="text-sm text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
              >
                Not sure? Ask AI ✨
              </Button>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`mood-emoji flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    selectedMood === mood.value
                      ? 'border-primary bg-primary/10 selected'
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <span className="text-4xl mb-2">{mood.emoji}</span>
                  <span className={`text-sm font-medium ${mood.color}`}>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activities */}
          {/* Activities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">What influenced your mood today?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              
              {/* 1. Render Standard Activities */}
              {activities.map((activity) => (
                <Button
                  key={activity}
                  variant={selectedActivities.includes(activity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(activity)}
                  className="text-sm"
                >
                  {activity}
                </Button>
              ))}

              {/* 2. Render AI Detected Tags (if any exist) */}
              {selectedActivities
                .filter(act => act.startsWith("AI:")) // Only show AI tags here
                .map((aiTag) => (
                  <Button
                    key={aiTag}
                    variant="default" // Always selected (purple/primary)
                    size="sm"
                    onClick={() => toggleActivity(aiTag)} // Allow user to remove it
                    className="text-sm bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                  >
                    ✨ {aiTag.replace("AI: ", "")}
                  </Button>
              ))}

            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="w-full mindcare-button-hero"
          >
            Log Today's Mood
          </Button>
        </CardContent>
      </Card>
      {/* --- AI MOOD MIRROR SECTION (Hidden target for scroll) --- */}
      <div ref={mirrorRef} className="scroll-mt-8">
        <MoodMirror onMoodDetected={handleAiMoodSelection} />
      </div>
      {/* Weekly Trend */}
      <Card className="mindcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Weekly Mood Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Mood This Week</p>
              <p className="text-2xl font-bold text-primary">{getAverageMood()}/5.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Days Tracked</p>
              <p className="text-2xl font-bold text-accent">{weeklyMoodData.length}</p>
            </div>
          </div>
          
          {/* Simple mood chart visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
            <div className="flex justify-between items-end h-20 bg-muted/20 rounded-lg p-2">
              {alignedWeek.map((day, index) => (
  <div key={index} className="flex flex-col items-center">
    <div
      className={`w-6 rounded-t mb-1 ${
        day
          ? day.mood >= 4
            ? 'bg-green-500'
            : day.mood >= 3
            ? 'bg-blue-500'
            : day.mood >= 2
            ? 'bg-yellow-500'
            : 'bg-red-500'
          : 'bg-muted'
      }`}
      style={{ height: day ? `${(day.mood / 5) * 60}px` : "8px" }}
    />
    <span className="text-xs">
      {day ? moodEmojis.find(m => m.value === day.mood)?.emoji : '-'}
    </span>
  </div>
))}

            </div>
          </div>
        </CardContent>
      </Card>
       {/* Heatmap */}
      <Card className="mindcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Current Month Mood Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">Days with recorded moods: {activeCount}</div>

          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-xs text-center text-muted-foreground">{d}</div>
            ))}

            {/* Start-of-month offset: align 1st day correctly (Mon-first layout) */}
            {(() => {
              const firstDate = days[0];
              const firstWeekday = firstDate.getDay(); // Sun=0
              const offset = firstWeekday === 0 ? 6 : (firstWeekday - 1); // convert Sun->6, Mon->0...
              // push placeholders for offset
              const cells: any[] = [];
              for (let i = 0; i < offset; i++) cells.push(<div key={`pad-${i}`} className="w-8 h-8"></div>);
              // actual days
              days.forEach((d) => {
                const iso = formatDateLocal(d);
                const entry = moodMap[iso];
                const moodVal = entry?.mood;
                const colorClass = moodVal ? colorForMood(moodVal) : 'bg-muted/30';
                cells.push(
                  <div key={iso} title={entry ? `${iso} — mood ${moodVal}` : iso} className="flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-sm ${colorClass} flex items-center justify-center`}>
                      <span className="text-xs">{d.getDate()}</span>
                    </div>
                  </div>
                );
              });
              return cells;
            })()}
          </div>
        </CardContent>
      </Card>
      {/* Insights & Suggestions */}
      <Card className="mindcare-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">Recent activity: {monthlyMoods.length} recorded day(s) in the last 30 days.</p>
            <p className="text-muted-foreground">Use AI Insights to get a short summary of your recent mood trend.</p>
            <Badge variant="secondary">💪 Most frequent: {mostFrequent}</Badge>
          </div>
        </CardContent>
      </Card>
      {/* AI Insights Modal */}
{insightsModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl max-w-lg w-full animate-scale-up">
      
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Heart className="h-6 w-6 text-pink-500" />
        AI Mood Insights
      </h2>

      {insightsJson && (
        <div className="space-y-3 text-sm leading-relaxed">
          
          <div>
            <p className="font-semibold text-primary">Summary</p>
            <p className="text-muted-foreground">{insightsJson.summary}</p>
          </div>
          
          <div>
            <p className="font-semibold text-primary">Trend</p>
            <p className="text-muted-foreground capitalize">{insightsJson.trend}</p>
          </div>

          <div>
            <p className="font-semibold text-primary">Patterns</p>
            <p className="text-muted-foreground">{insightsJson.patterns}</p>
          </div>

          <div>
            <p className="font-semibold text-primary">Possible Causes</p>
            <p className="text-muted-foreground">{insightsJson.possible_causes}</p>
          </div>

          <div>
            <p className="font-semibold text-primary">Suggestions</p>
            <p className="text-muted-foreground whitespace-pre-line">
              {insightsJson.suggestions}
            </p>
          </div>

          {insightsJson.warnings && (
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="font-semibold text-red-600 dark:text-red-400">Warnings</p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {insightsJson.warnings}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setInsightsModalOpen(false)} variant="outline">
          Close
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}