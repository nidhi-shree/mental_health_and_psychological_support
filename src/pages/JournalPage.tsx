import VideoJournal from '@/components/VideoJournal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JournalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Back Button for better UX */}
      <div className="max-w-5xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="hover:bg-transparent hover:text-primary p-0 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      {/* The Video Journal Component */}
      <VideoJournal />
    </div>
  );
}
