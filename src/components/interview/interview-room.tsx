'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  AlertCircle,
  Loader2,
  Video,
  Volume2,
  VolumeX,
  Activity,
  Timer,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import type { InterviewSettings, LiveServerMessage, InterviewState } from '@/lib/types';

interface InterviewRoomProps {
  token: string;
  interviewId: number;
  settings: InterviewSettings;
  onComplete: (feedback: any) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export function InterviewRoom({
  token,
  settings,
  onComplete,
  onBack,
  isDarkMode,
}: InterviewRoomProps) {
  const [state, setState] = useState<InterviewState>({
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    sessionId: undefined,
    messages: [],
    currentTurn: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for media handling
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Timer for session duration
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.isConnected]);

  // Audio level monitoring
  useEffect(() => {
    if (state.isRecording && analyserRef.current) {
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        if (state.isRecording) {
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    }
  }, [state.isRecording]);

  // Initialize interview session
  useEffect(() => {
    initializeSession();
    return () => {
      cleanupSession();
    };
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request media permissions
      if (settings.enableVideo || settings.enableAudio) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: settings.enableVideo ? { width: 640, height: 480 } : false,
          audio: settings.enableAudio ? {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          } : false,
        });

        mediaStreamRef.current = stream;

        // Set up video
        if (settings.enableVideo && videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Set up audio processing
        if (settings.enableAudio) {
          await setupAudioProcessing(stream);
        }
      }

      // Initialize Gemini Live API session
      await initializeGeminiSession();

      setIsLoading(false);
      setState(prev => ({ ...prev, isConnected: true }));
      toast.success('Interview session started!');

    } catch (err) {
      console.error('Failed to initialize session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview session');
      setIsLoading(false);
      toast.error('Failed to start interview session');
    }
  };

  const setupAudioProcessing = async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const analyser = audioContext.createAnalyser();
      
      audioProcessorRef.current = processor;
      analyserRef.current = analyser;
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(processor);

      processor.onaudioprocess = (event) => {
        if (state.isRecording && sessionRef.current) {
          const inputData = event.inputBuffer.getChannelData(0);
          const audioData = convertFloat32ToInt16(inputData);
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData.buffer)));

          sessionRef.current.sendRealtimeInput({
            audio: {
              data: base64Audio,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        }
      };

      processor.connect(audioContext.destination);

    } catch (err) {
      console.error('Failed to setup audio processing:', err);
      throw err;
    }
  };

  const convertFloat32ToInt16 = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i] ?? 0));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  };

  const initializeGeminiSession = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { GoogleGenAI, Modality, MediaResolution } = await import('@google/genai');

      const ai = new GoogleGenAI({
        apiKey: token, // Use ephemeral token
        httpOptions: { apiVersion: 'v1alpha' }
      });

      const model = 'gemini-2.5-flash-preview-native-audio-dialog';
      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: settings.voiceName,
            }
          },
          languageCode: settings.languageCode,
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            startOfSpeechSensitivity: 'START_SENSITIVITY_LOW' as any,
            endOfSpeechSensitivity: 'END_SENSITIVITY_LOW' as any,
            prefixPaddingMs: 20,
            silenceDurationMs: 100,
          }
        },
      };

      const responseQueue: LiveServerMessage[] = [];

      const session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            console.log('Gemini session opened');
            setState(prev => ({ ...prev, isConnected: true }));
          },
          onmessage: (message: any) => {
            responseQueue.push(message);
            handleGeminiMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini session error:', e.message);
            setError(`Session error: ${e.message}`);
            toast.error('Interview session error');
          },
          onclose: (e: CloseEvent) => {
            console.log('Gemini session closed:', e.reason);
            setState(prev => ({ ...prev, isConnected: false }));
            if (e.reason !== 'user_initiated') {
              toast.error('Interview session ended unexpectedly');
            }
          },
        },
        config
      });

      sessionRef.current = session;

      // Send initial context
      const systemPrompt = `You are an AI interviewer conducting a professional interview for a ${settings.jobRole} position. 
      Be professional, ask relevant questions, and provide constructive feedback. 
      Keep responses concise and natural.`;

      session.sendClientContent({
        turns: systemPrompt
      });

    } catch (err) {
      console.error('Failed to initialize Gemini session:', err);
      throw err;
    }
  };

  const handleGeminiMessage = (message: any) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      currentTurn: [...prev.currentTurn, message],
    }));

    // Handle audio output
    if (message.data && audioRef.current) {
      const audioBuffer = new Int16Array(
        new Uint8Array(message.data.split('').map((c: string) => c.charCodeAt(0))).buffer
      );
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
      
      setState(prev => ({ ...prev, isSpeaking: true }));
      
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
      };
    }

    // Handle text output
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0];
      if (part?.text) {
        console.log('AI Response:', part.text);
      }
    }

    // Handle turn completion
    if (message.serverContent?.turnComplete) {
      setState(prev => ({ ...prev, currentTurn: [] }));
    }

    // Handle interruptions
    if (message.serverContent?.interrupted) {
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const toggleRecording = () => {
    if (!state.isConnected) return;

    setState(prev => ({ ...prev, isRecording: !prev.isRecording }));
    
    if (!state.isRecording) {
      toast.success('Recording started');
    } else {
      toast.info('Recording stopped');
    }
  };

  const cleanupSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    setState(prev => ({ ...prev, isConnected: false }));
  };

  const handleEndInterview = () => {
    cleanupSession();
    
    // Generate basic feedback based on session
    const feedback = {
      overallRating: 'good' as const,
      strengths: 'Good communication and technical knowledge demonstrated.',
      improvements: 'Consider providing more specific examples in responses.',
      summary: 'Interview completed successfully with good engagement.',
      skillRatings: {
        communication: 'good' as const,
        technical: 'good' as const,
        behavioral: 'good' as const,
      },
      geminiInsights: {
        sessionDuration: sessionDuration,
        messagesCount: state.messages.length,
        jobRole: settings.jobRole,
      },
    };

    onComplete(feedback);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[500px] backdrop-blur-lg rounded-2xl border ${
        isDarkMode
          ? 'bg-white/10 border-white/20'
          : 'bg-white/50 border-white/40 shadow-lg'
      }`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Initializing Interview Session
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Setting up your personalized AI interview experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`backdrop-blur-lg rounded-2xl border p-8 ${
        isDarkMode
          ? 'bg-white/10 border-white/20'
          : 'bg-white/50 border-white/40 shadow-lg'
      }`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Session Error
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {error}
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
        isDarkMode
          ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
          : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Live Interview Session
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {settings.jobRole}
              </p>
              <div className="flex items-center gap-2">
                <Timer className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={`font-mono text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {formatDuration(sessionDuration)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={state.isConnected ? 'default' : 'secondary'}
              className={state.isConnected 
                ? 'bg-green-500/20 text-green-300 px-3 py-1' 
                : 'bg-red-500/20 text-red-300 px-3 py-1'
              }
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${
                state.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              {state.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
              className={isDarkMode 
                ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                : 'bg-black/5 border-black/10 hover:bg-black/10'
              }
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video/Audio Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Feed */}
          {settings.enableVideo && (
            <div className={`backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
              isDarkMode
                ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Your Video
                  </h3>
                </div>
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!mediaStreamRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                      <div className="text-center">
                        <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera not available</p>
                      </div>
                    </div>
                  )}
                  {/* Recording indicator */}
                  {state.isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Audio Controls */}
          {settings.enableAudio && (
            <div className={`backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
              isDarkMode
                ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Audio Controls
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant={state.isRecording ? 'destructive' : 'default'}
                      onClick={toggleRecording}
                      disabled={!state.isConnected}
                      className={`flex-1 mr-4 ${state.isRecording 
                        ? '' 
                        : 'bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:scale-105 transition-transform'
                      }`}
                    >
                      {state.isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {state.isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {state.isSpeaking ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  
                  {/* Audio level indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Audio Level</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{Math.round(audioLevel * 100)}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-150"
                        style={{ width: `${audioLevel * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Activity className={`w-4 h-4 ${state.isSpeaking ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {state.isSpeaking ? 'AI Speaking...' : state.isRecording ? 'Listening...' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat/Status Area */}
        <div className="space-y-6">
          {/* Session Status */}
          <div className={`backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
            isDarkMode
              ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
              : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
          }`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Session Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration</span>
                  <span className={`font-mono text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Messages</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {state.messages.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</span>
                  <Badge variant={state.isConnected ? 'default' : 'secondary'} className={
                    state.isConnected 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }>
                    {state.isConnected ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className={`backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
            isDarkMode
              ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
              : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
          }`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Conversation
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {state.messages.slice(-5).map((message, index) => (
                  <div key={index} className={`p-3 rounded-xl text-sm ${
                    isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/30 border border-white/20'
                  }`}>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      AI Interviewer
                    </div>
                    <div className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                      {message.serverContent?.modelTurn?.parts?.[0]?.text || 
                       message.text || 
                       '🎵 Audio message'}
                    </div>
                  </div>
                ))}
                {state.messages.length === 0 && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Conversation will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleEndInterview}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Interview
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden audio element for AI responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}