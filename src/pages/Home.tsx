import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { QuickMoodTracker } from '@/components/QuickMoodTracker';
import { LogOut, Heart, Brain, Users, Calendar, BookOpen, MessageCircle, Sparkles, ArrowRight, Shield, Zap, Play, Leaf, Star, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import heroIllustration from '@/assets/hero-illustration.png';

// Import generated images
import talkSupportImg from '@/assets/talk-support.jpg';
import bookAppointmentImg from '@/assets/book-appointment.jpg';
import resourceHubImg from '@/assets/resource-hub.jpg';
import peerForumImg from '@/assets/peer-forum.jpg';
import moodTrackerImg from '@/assets/mood-tracker.jpg';
import selfAssessmentImg from '@/assets/self-assessment.jpg';

const features = [
  {
    title: 'Talk to Support',
    description: 'Connect with trained professionals for immediate support.',
    link: '/talk',
    image: talkSupportImg,
    icon: MessageCircle,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Book Appointment',
    description: 'Schedule a session with a therapist at your convenience.',
    link: '/book',
    image: bookAppointmentImg,
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Resource Hub',
    description: 'Access articles, videos, and tools for mental wellness.',
    link: '/resources',
    image: resourceHubImg,
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Video Journal',
    description: 'Express your thoughts and feelings through video journaling.',
    link: '/journal',
    image: peerForumImg,
    icon: Users,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Mood Tracker',
    description: 'Monitor your emotional well-being over time.',
    link: '/mood',
    image: moodTrackerImg,
    icon: Heart,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Self-Assessment',
    description: 'Understand your mental health with confidential assessments.',
    link: '/assessment',
    image: selfAssessmentImg,
    icon: Brain,
    gradient: 'from-fuchsia-500 to-pink-600',
  },
];

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-teal-400/20 backdrop-blur-sm"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Floating lotus/leaf element
const FloatingElement = ({ delay, x, y, children }: { delay: number; x: string; y: string; children: React.ReactNode }) => (
  <motion.div
    className="absolute text-pink-300/40 dark:text-pink-500/30"
    style={{ left: x, top: y }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Animated stats component
const StatCard = ({ number, label, icon: Icon, delay }: { number: string; label: string; icon: any; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center text-white"
  >
    <Icon className="w-6 h-6 mx-auto mb-2 opacity-80" />
    <motion.div
      className="text-3xl md:text-4xl font-bold"
      initial={{ scale: 0.5 }}
      whileInView={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: delay + 0.2 }}
      viewport={{ once: true }}
    >
      {number}
    </motion.div>
    <p className="text-white/80 mt-1 text-sm">{label}</p>
  </motion.div>
);

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/login');
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      
      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 md:w-[500px] md:h-[500px] bg-purple-300/40 dark:bg-purple-600/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-80 h-80 md:w-[500px] md:h-[500px] bg-teal-300/40 dark:bg-teal-600/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating Particles */}
          <FloatingParticle delay={0} duration={6} x="10%" y="20%" size={24} />
          <FloatingParticle delay={1} duration={7} x="85%" y="15%" size={18} />
          <FloatingParticle delay={2} duration={5} x="75%" y="70%" size={28} />
          <FloatingParticle delay={0.5} duration={8} x="15%" y="75%" size={20} />
          <FloatingParticle delay={3} duration={6} x="92%" y="50%" size={14} />
          <FloatingParticle delay={1.5} duration={7} x="5%" y="55%" size={26} />

          {/* Floating Elements */}
          <FloatingElement delay={0} x="12%" y="25%">
            <Leaf className="w-10 h-10" />
          </FloatingElement>
          <FloatingElement delay={1.5} x="88%" y="20%">
            <Star className="w-8 h-8" />
          </FloatingElement>
          <FloatingElement delay={0.8} x="78%" y="68%">
            <Heart className="w-9 h-9" />
          </FloatingElement>
          <FloatingElement delay={2} x="22%" y="72%">
            <Sparkles className="w-8 h-8" />
          </FloatingElement>

          {/* Decorative Sun */}
          <motion.div
            className="absolute top-16 right-16 text-amber-300/30 dark:text-amber-400/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <Sun className="w-20 h-20" />
          </motion.div>
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 z-[1]" />

        {/* Header with logout */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 right-6 z-20"
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 backdrop-blur-md bg-white/50 dark:bg-zinc-800/50 border-white/30"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </motion.div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Your Mental Wellness Journey Starts Here
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-teal-500 bg-clip-text text-transparent">
                  Find Peace
                </span>
                <br />
                <span className="text-foreground">Within Yourself</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0"
              >
                A safe, supportive space designed for students to explore, understand, and nurture their mental health with professional support and peer community.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate('/talk')}
                    className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    Start Your Journey
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/resources')}
                    className="px-8 py-6 text-lg rounded-full border-2 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Explore Resources
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Illustration with animations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              {/* Glow effect behind image */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-teal-400/50 rounded-full blur-3xl scale-90"
                animate={{
                  scale: [0.85, 0.95, 0.85],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main illustration with floating animation */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <img
                  src={heroIllustration}
                  alt="Peaceful meditation illustration"
                  className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl shadow-purple-500/30"
                />

                {/* Floating decorative elements around image */}
                <motion.div
                  className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Heart className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-10 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-xl"
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>

                <motion.div
                  className="absolute bottom-1/4 -left-8 w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-7 h-12 rounded-full border-2 border-purple-400 dark:border-purple-500 flex justify-center pt-2"
          >
            <motion.div
              className="w-1.5 h-3 bg-purple-500 rounded-full"
              animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <StatCard number="24/7" label="Emotional Support" icon={Heart} delay={0} />
            <StatCard number="Private" label="Confidential & Secure" icon={Shield} delay={0.1} />
            <StatCard number="AI-Powered" label="Mood Understanding" icon={Zap} delay={0.2} />
            <StatCard number="Peer & Professional" label="Dual Support System" icon={Users} delay={0.3} />
          </motion.div>
        </div>
      </section>

      {/* Mood Tracker Section */}
      <section className="relative py-16 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <QuickMoodTracker />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-teal-500 bg-clip-text text-transparent">Thrive</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive tools and resources designed with your well-being in mind
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={feature.link} className="block group">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="relative overflow-hidden h-full border-0 bg-card shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${feature.image})` }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-60 group-hover:opacity-70 transition-opacity`} />
                          
                          {/* Icon */}
                          <motion.div
                            className="absolute top-4 left-4 p-3 rounded-xl bg-white/20 backdrop-blur-md"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          {/* Title on image */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg">{feature.title}</h3>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {feature.description}
                          </p>
                          <motion.div 
                            className="flex items-center gap-2 mt-4 text-purple-600 dark:text-purple-400 font-medium text-sm"
                            whileHover={{ x: 5 }}
                          >
                            Explore <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Buddy Space - Featured Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <Link to="/buddy" className="block group">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-600 via-pink-600 to-teal-500 shadow-2xl shadow-purple-500/30">
                  <motion.div 
                    className="absolute inset-0 opacity-20"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.2"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}
                  />
                  <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                      >
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-sm text-white font-medium">Community</span>
                      </motion.div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">Buddy Space</h3>
                      <p className="text-white/80 text-lg max-w-md">
                        Connect with peers who understand. Find your support buddy and grow together.
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg rounded-full shadow-xl group"
                      >
                        Join Community
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Take the first step towards better mental health. We're here to support you every step of the way.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-white/30 transition-all duration-300">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
