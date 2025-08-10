'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Play } from 'lucide-react';
import type { InterviewSettings, ResumeAnalysisDB, Skills, Experience } from '@/lib/types';

interface InterviewSettingsProps {
  settings: InterviewSettings;
  onSettingsChange: (settings: InterviewSettings) => void;
  onStartInterview: () => void;
  isLoading: boolean;
  recentAnalysis?: ResumeAnalysisDB | null;
  isDarkMode: boolean;
}

const VOICE_OPTIONS = [
  { value: 'Zephyr', label: 'Zephyr (Professional)' },
  { value: 'Kore', label: 'Kore (Friendly)' },
  { value: 'Puck', label: 'Puck (Energetic)' },
  { value: 'Charon', label: 'Charon (Calm)' },
  { value: 'Fenrir', label: 'Fenrir (Authoritative)' },
  { value: 'Aoede', label: 'Aoede (Warm)' },
  { value: 'Leda', label: 'Leda (Clear)' },
  { value: 'Orus', label: 'Orus (Confident)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-IN', label: 'English (India)' },
  { value: 'es-US', label: 'Spanish (US)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese (Japan)' },
  { value: 'ko-KR', label: 'Korean (South Korea)' },
  { value: 'zh-CN', label: 'Chinese (Mandarin)' },
];

export function InterviewSettings({
  settings,
  onSettingsChange,
  onStartInterview,
  isLoading,
  recentAnalysis,
  isDarkMode,
}: InterviewSettingsProps) {
  const [jobRole, setJobRole] = useState(settings.jobRole);

  const handleJobRoleChange = (value: string) => {
    setJobRole(value);
    onSettingsChange({ ...settings, jobRole: value });
  };

  const handleVoiceChange = (value: string) => {
    onSettingsChange({ ...settings, voiceName: value });
  };

  const handleLanguageChange = (value: string) => {
    onSettingsChange({ ...settings, languageCode: value });
  };

  const handleVideoToggle = (enabled: boolean) => {
    onSettingsChange({ ...settings, enableVideo: enabled });
  };

  const handleAudioToggle = (enabled: boolean) => {
    onSettingsChange({ ...settings, enableAudio: enabled });
  };

  return (
    <div className="space-y-6">
      {/* Job Role */}
      <div className="space-y-3">
        <Label htmlFor="job-role" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Job Role / Position
        </Label>
        <div className="flex gap-2">
          <Input
            id="job-role"
            placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
            value={jobRole}
            onChange={(e) => handleJobRoleChange(e.target.value)}
            className={`flex-1 backdrop-blur-sm border transition-colors ${
              isDarkMode
                ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400/50'
                : 'bg-white/50 border-white/40 text-black placeholder:text-gray-500 focus:border-blue-500/60'
            }`}
          />
          {recentAnalysis?.jobRole && jobRole !== recentAnalysis.jobRole && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleJobRoleChange(recentAnalysis.jobRole)}
              className={isDarkMode 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-black/5 border-black/10 text-black hover:bg-black/10'}
            >
              Use Recent
            </Button>
          )}
        </div>
        {recentAnalysis?.jobRole && (
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Recent analysis:
            </span>
            <Badge 
              variant="secondary"
              className={isDarkMode 
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                : 'bg-blue-500/10 text-blue-700 border-blue-400/40'}
            >
              {recentAnalysis.jobRole}
            </Badge>
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="voice" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            AI Voice
          </Label>
          <Select value={settings.voiceName} onValueChange={handleVoiceChange}>
            <SelectTrigger className={`backdrop-blur-sm border transition-colors ${
              isDarkMode
                ? 'bg-white/5 border-white/20 text-white hover:border-blue-400/50'
                : 'bg-white/50 border-white/40 text-black hover:border-blue-500/60'
            }`}>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? 'bg-black/90 border-white/20' : 'bg-white/90 border-black/20'}>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem 
                  key={voice.value} 
                  value={voice.value}
                  className={isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}
                >
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="language" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Language
          </Label>
          <Select value={settings.languageCode} onValueChange={handleLanguageChange}>
            <SelectTrigger className={`backdrop-blur-sm border transition-colors ${
              isDarkMode
                ? 'bg-white/5 border-white/20 text-white hover:border-blue-400/50'
                : 'bg-white/50 border-white/40 text-black hover:border-blue-500/60'
            }`}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? 'bg-black/90 border-white/20' : 'bg-white/90 border-black/20'}>
              {LANGUAGE_OPTIONS.map((language) => (
                <SelectItem 
                  key={language.value} 
                  value={language.value}
                  className={isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}
                >
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Media Settings Card */}
      <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
        isDarkMode
          ? 'bg-white/5 border-white/20 hover:border-blue-400/50'
          : 'bg-white/30 border-white/40 hover:border-blue-500/60'
      }`}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Media Settings
            </h4>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Configure audio and video options for your interview
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-transparent to-blue-500/5">
            <div className="space-y-1">
              <Label htmlFor="audio-toggle" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Enable Audio
              </Label>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Allow the AI to speak and hear your responses
              </p>
            </div>
            <Switch
              id="audio-toggle"
              checked={settings.enableAudio}
              onCheckedChange={handleAudioToggle}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-transparent to-blue-500/5">
            <div className="space-y-1">
              <Label htmlFor="video-toggle" className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Enable Video
              </Label>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Use webcam for face-to-face interview experience
              </p>
            </div>
            <Switch
              id="video-toggle"
              checked={settings.enableVideo}
              onCheckedChange={handleVideoToggle}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Recent Analysis Context */}
      {recentAnalysis && (
        <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
          isDarkMode
            ? 'bg-white/5 border-white/20 hover:border-blue-400/50'
            : 'bg-white/30 border-white/40 hover:border-blue-500/60'
        }`}>
          <div className="mb-4">
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Interview Context
            </h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your resume analysis will provide context for the interview
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Skills
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(recentAnalysis.skills as unknown as Skills)?.technical?.slice(0, 5).map((skill: string) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className={`text-xs ${
                      isDarkMode 
                        ? 'bg-blue-500/10 text-blue-300 border-blue-400/30' 
                        : 'bg-blue-500/10 text-blue-700 border-blue-400/40'
                    }`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Experience
              </Label>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {(recentAnalysis.experience as unknown as Experience)?.totalYears || 'N/A'} years of experience
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <Button
        onClick={onStartInterview}
        disabled={isLoading || !jobRole.trim()}
        className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 mr-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Interview Session...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            Start Interview
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </div>
  );
}