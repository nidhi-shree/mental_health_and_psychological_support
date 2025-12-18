import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function EmergencyButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 shadow-sm animate-pulse-slow">
          <AlertTriangle className="h-4 w-4" />
          Emergency Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <Phone className="h-6 w-6" />
            Emergency Resources (India)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Critical Numbers */}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
            <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              24/7 Crisis Helplines
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-red-200/50 pb-2">
                <span>Tele MANAS (Govt of India):</span>
                <a href="tel:14416" className="font-bold text-lg hover:underline">14416</a>
              </div>
              <div className="flex justify-between items-center border-b border-red-200/50 pb-2">
                <span>Kiran (Mental Health Rehab):</span>
                <a href="tel:18005990019" className="font-bold hover:underline">1800-599-0019</a>
              </div>
              <div className="flex justify-between items-center border-b border-red-200/50 pb-2">
                <span>Vandrevala Foundation:</span>
                <a href="tel:18602662345" className="font-bold hover:underline">1860-266-2345</a>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Police / Ambulance:</span>
                <a href="tel:112" className="font-bold text-xl text-red-600">112</a>
              </div>
            </div>
          </div>
          
          {/* Support Organizations */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Other Support Organizations</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex justify-between">
                <span>• iCall (TISS):</span> 
                <span className="font-mono text-foreground">91529-87821</span>
              </p>
              <p className="flex justify-between">
                <span>• Parivarthan:</span> 
                <span className="font-mono text-foreground">080-65333323</span>
              </p>
              <p className="flex justify-between">
                <span>• AASRA (Suicide Prevention):</span> 
                <span className="font-mono text-foreground">98204-66726</span>
              </p>
            </div>
          </div>
          
          <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-xs text-muted-foreground text-center">
            If you or someone you know is in immediate danger, please visit the nearest hospital emergency room or call <strong>112</strong> immediately.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}