"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { ResumeAnalysisList } from "@/components/resume/resume-analysis-list";
import { ResumeAnalysisDisplay } from "@/components/resume/resume-analysis-display";
import { api } from "@/trpc/react";
import { FileText, Upload, History, Sun, Moon, ArrowLeft } from "lucide-react";

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

// Animated background component (same as landing page)
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
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    
    type AnimateFn = {
      (time: number): void;
    };

    const animate: AnimateFn = (time) => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Dynamic gradient background based on theme
      const gradient: CanvasGradient = ctx!.createLinearGradient(0, 0, 0, canvas!.height);
      
      if (isDarkMode) {
        // Dark mode: black and blue
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      } else {
        // Light mode: white and blue
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
        
        // Dynamic particle color based on theme
        if (isDarkMode) {
          ctx!.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        } else {
          ctx!.fillStyle = `rgba(37, 99, 235, ${particle.opacity * 0.7})`;
        }
        ctx!.fill();
      });

      // Add subtle wave effect
      const waveOffset: number = Math.sin(time * 0.001) * 50;
      ctx!.fillStyle = isDarkMode 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'rgba(37, 99, 235, 0.05)';
      
      ctx!.beginPath();
      for (let x = 0; x <= canvas!.width; x += 10) {
        const y: number = canvas!.height * 0.7 + Math.sin((x + waveOffset) * 0.01) * 30;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.lineTo(canvas!.width, canvas!.height);
      ctx!.lineTo(0, canvas!.height);
      ctx!.closePath();
      ctx!.fill();

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

export default function ResumePage() {
  const { user, isLoaded } = useUser();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: selectedAnalysis } = api.resume.getAnalysis.useQuery(
    { analysisId: selectedAnalysisId! },
    { enabled: !!selectedAnalysisId }
  );

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

  if (!isLoaded) {
    return (
      <div className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'text-white' : 'text-black'
      }`}>
        <AnimatedBackground isDarkMode={isDarkMode} />
        <NavigationBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
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
        
        <main className="relative z-10 pt-20">
          <div className="container mx-auto px-4 py-8">
            <AnimatedText>
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h1 className={`text-4xl font-bold bg-clip-text ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-white via-blue-200 to-sky-200'
                      : 'bg-gradient-to-r from-black via-blue-600 to-sky-600'
                  }`}>
                    Resume Analysis
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sign in to analyze your resume with AI-powered insights
                  </p>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur rounded-full border ${
                  isDarkMode
                    ? 'bg-blue-500/20 border-blue-400/30'
                    : 'bg-blue-500/10 border-blue-400/40'
                }`}>
                  <FileText className={`w-8 h-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                
                <div className="space-y-4">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get detailed analysis of your resume including:
                  </p>
                  <ul className={`text-sm text-left space-y-2 max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• Skills identification and categorization</li>
                    <li>• Experience analysis and gap identification</li>
                    <li>• Tailored recommendations for specific job roles</li>
                    <li>• Overall resume scoring and feedback</li>
                  </ul>
                </div>
              </div>
            </AnimatedText>
          </div>
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

  const handleAnalysisComplete = (analysisId: number) => {
    setSelectedAnalysisId(analysisId);
    setActiveTab("view");
  };

  const handleViewAnalysis = (analysisId: number) => {
    setSelectedAnalysisId(analysisId);
    setActiveTab("view");
  };

  const handleBackToList = () => {
    setSelectedAnalysisId(null);
    setActiveTab("history");
  };

  if (selectedAnalysis && activeTab === "view") {
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
        
        <main className="relative z-10 pt-4">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className={`group px-4 py-2 backdrop-blur rounded-xl border font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20 hover:bg-white/20'
                    : 'bg-black/5 border-black/10 hover:bg-black/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Analyses
                </span>
              </button>
            </div>
            <ResumeAnalysisDisplay analysis={selectedAnalysis} isDarkMode={isDarkMode} />
          </div>
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
      
      <main className="relative z-10 pt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <AnimatedText>
              <div className="text-center space-y-4">
                <h1 className={`text-4xl font-bold bg-clip-text ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-white via-blue-200 to-sky-200'
                    : 'bg-gradient-to-r from-black via-blue-600 to-sky-600'
                }`}>
                  Resume Analysis
                </h1>
                <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Get AI-powered insights on your resume. Upload your resume or paste the text, 
                  and our advanced AI will provide detailed analysis and recommendations.
                </p>
              </div>
            </AnimatedText>

            {/* Main Content */}
            <AnimatedText delay={200}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full grid-cols-2 max-w-md mx-auto backdrop-blur ${
                  isDarkMode 
                    ? 'bg-black/20 border border-white/10' 
                    : 'bg-white/20 border border-black/10'
                }`}>
                  <TabsTrigger 
                    value="upload" 
                    className={`flex items-center gap-2 ${
                      isDarkMode 
                        ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white' 
                        : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    New Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className={`flex items-center gap-2 ${
                      isDarkMode 
                        ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white' 
                        : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    Past Analyses
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-8">
                  <ResumeUpload onAnalysisComplete={handleAnalysisComplete} isDarkMode={isDarkMode} />
                </TabsContent>

                <TabsContent value="history" className="mt-8">
                  <ResumeAnalysisList userId={user.id} onViewAnalysis={handleViewAnalysis} isDarkMode={isDarkMode} />
                </TabsContent>
              </Tabs>
            </AnimatedText>
          </div>
        </div>
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
