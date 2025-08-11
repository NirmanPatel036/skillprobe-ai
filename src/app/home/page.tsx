'use client';

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Github, Moon, Sun } from 'lucide-react';
import { ContainerTextFlip } from "@/components/container-text-flip";

// Navigation Bar Component
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
        <span className={`text-xl font-bold mr-12 ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>SkillProbe</span>

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

// Animated background component with theme support
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
    
    type AnimateFn = (time: number) => void;

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

// Main component
export default function Home() {
  const { user, isLoaded } = useUser();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  // Show loading while auth loads
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
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 -mt-30">
          <div className="container max-w-4xl mx-auto text-center">
            <AnimatedText>
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur rounded-full border ${
                  isDarkMode
                    ? 'bg-blue-500/20 border-blue-400/30'
                    : 'bg-blue-500/10 border-blue-400/40'
                }`}>
                  <Sparkles className={`w-4 h-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-100' : 'text-blue-700'}`}>Built with Modern Stack</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-8 opacity-100">
                <Image src="/nextjs.png" alt="Next.js" className="w-8 h-8" />
                <Image src="/react.png" alt="React" className="w-8 h-8" />
                <Image src="/tailwindCSS.png" alt="TailwindCSS" className="w-8 h-8" />
                <Image src="/postgresSQL.png" alt="PostgreSQL" className="w-8 h-8" />
                <Image src="/trpc.svg" alt="tRPC" className="w-8 h-8" />
                <Image src="/gemini.png" alt="AI" className="w-12 h-12" />
              </div>
            </AnimatedText>
            
            <AnimatedText delay={200}>
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white via-blue-200 to-sky-200'
                  : 'bg-gradient-to-r from-black via-blue-600 to-sky-600'
              }`}>
                {user ? (
                  <>
                    Hello, <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{user.firstName}!</span>
                    <br />
                    <div className="flex items-center justify-center gap-4 text-4xl md:text-7xl mt-4 font-bold">
                        <span>Appear 10x</span>
                        <ContainerTextFlip 
                            words={["confident", "bold", "prepared", "professional"]}
                            className={`bg-gradient-to-r border ${
                            isDarkMode
                                ? 'from-blue-500/20 to-sky-500/20 border-blue-400/30'
                                : 'from-blue-500/10 to-sky-500/10 border-blue-400/40'
                            }`}
                            textClassName="text-[#deb887]"
                            interval={2000}
                            animationDuration={600}
                        />
                    </div>
                  </>
                ) : (
                  <>
                    AI Interview
                    <span className="relative">
                      <span className={`ml-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Coach</span>
                      <div className={`absolute -inset-1 blur-xl rounded-lg -z-10 ${
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
                      }`} />
                    </span>
                    <br />
                    <span className="text-3xl md:text-5xl lg:text-6xl">with Resume Parser 📑🤝</span>
                  </>
                )}
              </h1>
            </AnimatedText>
            
            <AnimatedText delay={400}>
              <div className={`text-xl md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {user ? (
                  "Choose your path to interview success. Analyze your resume or start practicing interviews with our AI-powered platform."
                ) : (
                  <>
                    The AI-powered interview coaching platform with intelligent resume parsing. Get personalized interview preparation and 
                    <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}> ace your next job interview </span>
                    with confidence.
                  </>
                )}
              </div>
            </AnimatedText>
            
            <AnimatedText delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Link href="/resume">
                      <button className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 ${
                        isDarkMode ? 'hover:shadow-2xl hover:shadow-blue-500/25' : 'hover:shadow-xl hover:shadow-blue-500/30'
                      }`}>
                        <span className="relative z-10">Resume Analysis</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </Link>
                    <Link href="/interview">
                      <button className={`group px-8 py-4 backdrop-blur rounded-xl border font-semibold text-lg transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20 hover:bg-white/20'
                          : 'bg-black/5 border-black/10 hover:bg-black/10'
                      }`}>
                        Take Interview
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <SignInButton>
                      <button className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 text-white ${
                      isDarkMode ? 'hover:shadow-2xl hover:shadow-blue-500/25' : 'hover:shadow-xl hover:shadow-blue-500/30'
                    }`}>
                        <span className="relative z-10 flex items-center gap-2">
                          Get Started
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </SignInButton>
                    
                    <button className={`group px-8 py-4 backdrop-blur rounded-xl border font-semibold text-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-white/10 border-white/20 hover:bg-white/20'
                        : 'bg-black/5 border-black/10 hover:bg-black/10'
                    }`}>
                      <span className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        View on GitHub
                      </span>
                    </button>
                  </>
                )}
              </div>
            </AnimatedText>
          </div>
        </section>
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
      </main>
    </div>
  );
}
