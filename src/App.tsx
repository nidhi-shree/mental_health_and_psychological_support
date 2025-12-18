import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TalkToSupport from "./pages/TalkToSupport";
import BookAppointment from "./pages/BookAppointment";
import ResourceHub from "./pages/ResourceHub";
import PeerForum from "./pages/PeerForum";
import MoodTracker from "./pages/MoodTracker";
import SelfAssessment from "./pages/SelfAssessment";
import BuddySpace from "./pages/BuddySpace";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";
import NotificationPage from './components/NotificationPage';
import MyAppointments from "./pages/MyAppointments";
import JournalPage from "./pages/JournalPage";
import AdminDashboard from "./pages/AdminDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import VideoRoom from "./pages/VideoRoom";
import UserManagement from "./pages/UserManagement"; 
// Add this route

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, fullscreen = false }: { children: React.ReactNode, fullscreen?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.profileCompleted) return <Navigate to="/complete-profile" replace />;

  // If fullscreen (like Video Room), return just the content. Otherwise, wrap in Layout.
  return fullscreen ? <>{children}</> : <Layout>{children}</Layout>;
}

// Auth Route Component (redirects to home if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-calm">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading MindCare...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } />
              <Route path="/register" element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              } />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/talk" element={
                <ProtectedRoute>
                  <TalkToSupport />
                </ProtectedRoute>
              } />
              <Route path="/book" element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                 <ProtectedRoute>
                   <MyAppointments />
                 </ProtectedRoute>
              } />

              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourceHub />
                </ProtectedRoute>
              } />
              <Route path="/forum" element={
                <ProtectedRoute>
                  <PeerForum />
                </ProtectedRoute>
              } />
              <Route path="/mood" element={
                <ProtectedRoute>
                  <MoodTracker />
                </ProtectedRoute>
              } />
              <Route path="/assessment" element={
                <ProtectedRoute>
                  <SelfAssessment />
                </ProtectedRoute>
              } />
              <Route path="/buddy" element={
                <ProtectedRoute>
                  <BuddySpace />
                </ProtectedRoute>
              } />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/profile" element={
              <ProtectedRoute>
                 <Profile />
              </ProtectedRoute>
               } />
             <Route path="/notifications" element={
            <ProtectedRoute>
               <NotificationPage />
            </ProtectedRoute>
            } />
             <Route path="/journal" element={
                <ProtectedRoute>
                  <JournalPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                 <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/psychologist" element={
                <ProtectedRoute>
                 <PsychologistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/room/:roomId" element={
                <ProtectedRoute fullscreen={true}> 
                  <VideoRoom />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } />              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
