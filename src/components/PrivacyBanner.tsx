import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg p-4 flex items-center gap-4 max-w-md shadow-lg">
        <p className="text-slate-700 text-sm">
          MindCare values your privacy. We use cookies to ensure you get the best experience on our website.
        </p>
        <Button
          onClick={() => setIsVisible(false)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors shrink-0"
        >
          Accept
        </Button>
      </div>
    </div>
  );
}