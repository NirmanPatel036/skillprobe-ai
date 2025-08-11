'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { api } from '@/trpc/react';
import { InterviewRoom } from '@/components/interview/interview-room';
import { InterviewSettings } from '@/components/interview/interview-settings';
import { InterviewHistory } from '@/components/interview/interview-history';
import { Moon, Sun, Sparkles, Brain } from 'lucide-react';
import type { InterviewSettings as InterviewSettingsType, ResumeAnalysisDB, InterviewDB, Skills, Experience } from '@/lib/types';

// Navigation Bar Component (same as landing page)
const NavigationBar = ({ isDarkMode, setIsDarkMode }: { 
  isDarkMode: boolean; 
  setIsDarkMode: (value: boolean) => void; 
}) => {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center justify-between px-8 py-4 rounded-full backdrop-blur-lg border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-black/80 border-white/10' 
          : 'bg-white/80 border-black/10'
      }`}>
        {/* Left - SkillProbe Logo */}
        <Link href="/home" className={`text-xl font-bold mr-12 ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>SkillProbe</Link>

        {/* Right - Navigation Items */}
        <div className="flex items-center gap-8">
          {/* Home Link */}
          <Link 
            href="/home" 
            className={`font-medium transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-700 hover:text-black'
            }`}
          >
            Home
          </Link>

          {/* Theme Toggle Switch */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle theme"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            <Sun className={`absolute left-1.5 w-3 h-3 transition-opacity duration-200 ${
              isDarkMode ? 'opacity-0 text-gray-400' : 'opacity-100 text-yellow-500'
            }`} />
            <Moon className={`absolute right-1.5 w-3 h-3 transition-opacity duration-200 ${
              isDarkMode ? 'opacity-100 text-blue-300' : 'opacity-0 text-gray-400'
            }`} />
          </button>

          {/* About Me Link */}
          <Link 
            href="https://nirmanhere.vercel.app/"
            target="_blank"
            className={`font-medium transition-colors duration-200 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-700 hover:text-black'
            }`}
          >
            About Me
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Animated background component
const AnimatedBackground = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId: number;
    
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const particles: Particle[] = [];
    const particleCount = 30; // Fewer particles for subtle effect
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    
    type AnimateFn = (time: number) => void;

    const animate: AnimateFn = (_time) => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Dynamic gradient background based on theme
      const gradient: CanvasGradient = ctx!.createLinearGradient(0, 0, 0, canvas!.height);
      
      if (isDarkMode) {
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      }
      
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Animate particles
      particles.forEach((particle: Particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas!.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas!.width;
        if (particle.y > canvas!.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas!.height;

        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        if (isDarkMode) {
          ctx!.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        } else {
          ctx!.fillStyle = `rgba(37, 99, 235, ${particle.opacity * 0.7})`;
        }
        ctx!.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    
    resize();
    animate(0);
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

// Animated text component
type AnimatedTextProps = {
  children: React.ReactNode;
  delay?: number;
};

const AnimatedText = ({ children, delay = 0 }: AnimatedTextProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div className={`transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      {children}
    </div>
  );
};

export default function InterviewPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentView, setCurrentView] = useState<'setup' | 'room' | 'history'>('setup');
    const [interviewId, setInterviewId] = useState<number | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [settings, setSettings] = useState<InterviewSettingsType>({
        jobRole: '',
        voiceName: 'Zephyr',
        languageCode: 'en-US',
        enableVideo: true,
        enableAudio: true,
    });

    // Mouse position tracking
    useEffect(() => {
      type MouseEventHandler = {
        (e: MouseEvent): void;
      };

      const handleMouseMove: MouseEventHandler = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Fetch user's recent resume analysis and interview stats
    const { data: recentAnalysis, isLoading: loadingAnalysis } = api.interview.getRecentResumeAnalysis.useQuery();
    const { data: stats, isLoading: loadingStats } = api.interview.getInterviewStats.useQuery();
    const { data: recentInterviews } = api.interview.getUserInterviews.useQuery({ limit: 5 });

    // Create interview session mutation
    const createSession = api.interview.createEphemeralToken.useMutation({
        onSuccess: (data) => {
            setInterviewId(data.interviewId);
            setSessionToken(data.token || null);
            setCurrentView('room');
            toast.success('Interview session created successfully!');
        },
        onError: (error) => {
            toast.error(`Failed to create interview session: ${error.message}`);
        },
    });

    // Complete interview mutation
    const completeInterview = api.interview.completeInterview.useMutation({
        onSuccess: () => {
            toast.success('Interview completed successfully!');
            setCurrentView('history');
            setInterviewId(null);
            setSessionToken(null);
        },
        onError: (error) => {
            toast.error(`Failed to complete interview: ${error.message}`);
        },
    });

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/');
        }
    }, [isLoaded, user, router]);

    if (!isLoaded) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-black to-blue-900' 
                  : 'bg-gradient-to-b from-white to-blue-100'
              }`}>
                <div className={`text-xl ${isDarkMode ? 'text-white' : 'text-black'}`}>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleStartInterview = () => {
        if (!settings.jobRole.trim()) {
            toast.error('Please enter a job role');
            return;
        }

        createSession.mutate({
            jobRole: settings.jobRole,
            resumeAnalysisId: recentAnalysis?.id,
            settings,
        });
    };

    const handleCompleteInterview = (feedback: any) => {
        if (interviewId) {
            completeInterview.mutate({
                interviewId,
                feedback,
            });
        }
    };

    const handleBackToSetup = () => {
        setCurrentView('setup');
        setInterviewId(null);
        setSessionToken(null);
    };

    return (
        <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-black'
        }`}>
            <AnimatedBackground isDarkMode={isDarkMode} />
            <NavigationBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

            {/* Mouse follower */}
            <div
                className={`fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-screen transition-transform duration-150 ease-out ${
                isDarkMode ? 'bg-blue-400/30' : 'bg-blue-600/40'
                }`}
                style={{
                left: mousePosition.x - 12,
                top: mousePosition.y - 12,
                transform: 'scale(1)',
                }}
            />

            <main className="relative z-10 container mx-auto p-6 space-y-6">
                {/* Header */}
                <AnimatedText>
                    <div className="flex items-center justify-between mt-8 mb-8">
                        <div>
                            <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-clip-text ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-white via-blue-200 to-sky-200'
                                  : 'bg-gradient-to-r from-black via-blue-600 to-sky-600'
                              }`}>
                                AI Interview Coach
                            </h1>
                            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Practice your interview skills with our AI-powered interviewer
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={currentView === 'setup' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('setup')}
                                className={currentView !== 'setup' ? (isDarkMode 
                                    ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                                    : 'bg-black/5 border-black/10 hover:bg-black/10') : ''}
                            >
                                New Interview
                            </Button>
                            <Button
                                variant={currentView === 'history' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('history')}
                                className={currentView !== 'history' ? (isDarkMode 
                                    ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                                    : 'bg-black/5 border-black/10 hover:bg-black/10') : ''}
                            >
                                History
                            </Button>
                        </div>
                    </div>
                </AnimatedText>

                {/* Stats Cards */}
                <AnimatedText delay={200}>
                    {!loadingStats && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                                isDarkMode
                                  ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                                  : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Total Interviews
                                    </span>
                                </div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                    {stats.totalInterviews}
                                </div>
                            </div>
                            
                            <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                                isDarkMode
                                  ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                                  : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-white" />
                                    </div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Completed
                                    </span>
                                </div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                    {stats.completedInterviews}
                                </div>
                            </div>
                            
                            <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                                isDarkMode
                                  ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                                  : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
                              }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">★</span>
                                    </div>
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Average Rating
                                    </span>
                                </div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatedText>

                <div className={`h-px bg-gradient-to-r ${
                    isDarkMode 
                      ? 'from-transparent via-white/20 to-transparent' 
                      : 'from-transparent via-black/20 to-transparent'
                } mb-8`} />

                {/* Main Content */}
                <AnimatedText delay={400}>
                    {currentView === 'setup' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Interview Setup */}
                            <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                                isDarkMode
                                  ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                                  : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
                              }`}>
                                <div className="mb-6">
                                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        Interview Setup
                                    </h3>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Configure your interview session and start practicing
                                    </p>
                                </div>
                                <InterviewSettings
                                    settings={settings}
                                    onSettingsChange={setSettings}
                                    onStartInterview={handleStartInterview}
                                    isLoading={createSession.isPending}
                                    recentAnalysis={recentAnalysis as ResumeAnalysisDB}
                                    isDarkMode={isDarkMode}
                                />
                            </div>

                            {/* Recent Analysis */}
                            <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                                isDarkMode
                                  ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                                  : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
                              }`}>
                                <div className="mb-6">
                                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        Recent Resume Analysis
                                    </h3>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Your latest resume analysis will be used as context
                                    </p>
                                </div>
                                {loadingAnalysis ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : recentAnalysis ? (
                                    <div className="space-y-3">
                                        <div>
                                            <Badge 
                                                variant="secondary"
                                                className={isDarkMode 
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                                                    : 'bg-blue-500/10 text-blue-700 border-blue-400/40'}
                                            >
                                                {recentAnalysis.jobRole}
                                            </Badge>
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            <p>Skills: {(recentAnalysis.skills as Skills)?.technical?.slice(0, 3).join(', ') || 'N/A'}...</p>
                                            <p>Experience: {(recentAnalysis.experience as Experience)?.totalYears || 'N/A'} years</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No recent resume analysis found. Upload your resume first.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {currentView === 'room' && sessionToken && interviewId && (
                        <InterviewRoom
                            token={sessionToken}
                            interviewId={interviewId}
                            settings={settings}
                            onComplete={handleCompleteInterview}
                            onBack={handleBackToSetup}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {currentView === 'history' && (
                        <InterviewHistory
                            interviews={(recentInterviews as InterviewDB[]) || []}
                            onStartNew={() => setCurrentView('setup')}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </AnimatedText>
            </main>

            {/* Footer */}
            <footer className={`py-8 px-4`}>
                <div
                className={`border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'} max-w-xl mx-auto`}
                >
                <p
                    className={`mt-4 text-sm text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                    © 2025 SkillProbe. Built with effort for confident interview preparation.
                </p>
                </div>
            </footer>
        </div>
    );
}
