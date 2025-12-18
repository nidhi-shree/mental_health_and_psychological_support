import { ReactNode } from 'react';
import { MindCareSidebar } from './MindCareSidebar';
import { PrivacyBanner } from './PrivacyBanner';
import { EmergencyButton } from './EmergencyButton';
import { ThemeToggle } from './ThemeToggle';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext'; // <--- Import useAuth

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth(); // <--- Get current user

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full font-manrope bg-background text-foreground">
        {/* Privacy Banner (Optional: Hide for admin/psychologist if desired) */}
        <PrivacyBanner />
        
        {/* Sidebar */}
        <MindCareSidebar />
        
        {/* Main Content */}
        <SidebarInset>
          {/* Header Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-sidebar-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="ml-0" />
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* CONDITIONAL RENDER: Only show Emergency Button for regular users */}
              {user?.role === 'user' && <EmergencyButton />}
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}