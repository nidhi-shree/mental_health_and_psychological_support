import { 
  Home, MessageCircle, Calendar, BookOpen, Users, 
  BarChart3, ClipboardList, Heart, User, Video, Shield, Stethoscope 
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// --- MENU DEFINITIONS ---
const userItems = [
  { title: 'Home', url: '/', icon: Home, materialIcon: 'home' },
  { title: 'Talk to Support', url: '/talk', icon: MessageCircle, materialIcon: 'chat_bubble' },
  { title: 'Book Appointment', url: '/book', icon: Calendar, materialIcon: 'calendar_month' },
  { title: 'Video Journal', url: '/journal', icon: Video, materialIcon: 'videocam' },
  { title: 'Resource Hub', url: '/resources', icon: BookOpen, materialIcon: 'book_4' },

  { title: 'Mood Tracker', url: '/mood', icon: BarChart3, materialIcon: 'sentiment_satisfied' },
  { title: 'Self-Assessment', url: '/assessment', icon: ClipboardList, materialIcon: 'checklist' },
  { title: 'Buddy Space', url: '/buddy', icon: Heart, materialIcon: 'diversity_3' },
  { title: 'Profile', url: '/profile', icon: User, materialIcon: 'person' },
];

const psychologistItems = [
  { title: 'Workspace', url: '/psychologist', icon: Stethoscope, materialIcon: 'medical_services' }, 
  { title: 'Profile', url: '/profile', icon: User, materialIcon: 'person' },
];

const adminItems = [
  { title: 'Admin Panel', url: '/admin', icon: Shield, materialIcon: 'admin_panel_settings' },
  { title: 'User Management', url: '/admin/users', icon: Users, materialIcon: 'manage_accounts' }, 
  { title: 'Profile', url: '/profile', icon: User, materialIcon: 'person' },
];

export function MindCareSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();

  // Select menu based on role
  let navigationItems = userItems; 
  if (user?.role === 'psychologist') navigationItems = psychologistItems;
  else if (user?.role === 'admin') navigationItems = adminItems;

  const roleLabel = user?.role === 'psychologist' ? 'Psychologist' 
                  : user?.role === 'admin' ? 'Administrator' 
                  : 'Student';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2">
          {/* Avatar Color Logic */}
          <div className={`rounded-full w-8 h-8 flex items-center justify-center text-white 
            ${user?.role === 'admin' ? 'bg-red-500' : 
              user?.role === 'psychologist' ? 'bg-purple-600' : 
              'bg-gradient-to-br from-primary to-accent'}`}>
            
            {user?.role === 'admin' ? <Shield className="h-4 w-4" /> :
             user?.role === 'psychologist' ? <Stethoscope className="h-4 w-4" /> :
             <User className="h-4 w-4" />}
          </div>

          {state === "expanded" && (
            <div>
              <h1 className="text-sidebar-foreground text-sm font-bold truncate max-w-[150px]">
                {user?.name || 'User'}
              </h1>
              <p className="text-sidebar-foreground/60 text-xs capitalize">
                {roleLabel}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.url}>
                        <span className="material-symbols-outlined text-base">
                          {item.materialIcon}
                        </span>
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}