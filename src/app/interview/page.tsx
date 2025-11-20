'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';

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
        <Link href="/home" className={`text-xl font-bold mr-12 ${
          isDarkMode ? 'text-white' : 'text-black'
        }`}>SkillProbe</Link>

        <div className="flex items-center gap-8">
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
    const particleCount = 30;
    
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
    
    const animate = () => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const gradient = ctx!.createLinearGradient(0, 0, 0, canvas!.height);
      
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

      particles.forEach((particle) => {
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
    animate();
    window.addEventListener('resize', resize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);
  
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

export default function InterviewPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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

            <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
                <div className="text-center space-y-8 animate-fade-in">
                    <h1 className={`text-6xl md:text-8xl font-bold bg-clip-text text-transparent ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-white via-blue-200 to-sky-200'
                          : 'bg-gradient-to-r from-blue-800 via-blue-500 to-sky-600'
                    }`}>
                        Coming Soon
                    </h1>

                    <div className={`mt-12 inline-block px-8 py-3 rounded-full backdrop-blur-lg border ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20'
                          : 'bg-white/50 border-white/40 shadow-lg'
                    }`}>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            AI Interview Coach is under development 💻
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`py-8 px-4 absolute bottom-0 w-full`}>
                <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'} max-w-xl mx-auto`}>
                    <p className={`mt-4 text-sm text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        © 2025 SkillProbe. Built with effort for confident interview preparation.
                    </p>
                </div>
            </footer>
        </div>
    );
}
