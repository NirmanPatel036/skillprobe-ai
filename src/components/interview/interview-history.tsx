'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Plus,
  Award,
  Target
} from 'lucide-react';
import type { InterviewDB, Skills } from '@/lib/types';

interface InterviewHistoryProps {
  interviews: InterviewDB[];
  onStartNew: () => void;
  isDarkMode: boolean;
}

const RATING_COLORS = {
  excellent: (isDarkMode: boolean) => isDarkMode 
    ? 'bg-green-500/20 text-green-300 border-green-400/30' 
    : 'bg-green-100 text-green-800 border-green-200',
  good: (isDarkMode: boolean) => isDarkMode 
    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
    : 'bg-blue-100 text-blue-800 border-blue-200',
  average: (isDarkMode: boolean) => isDarkMode 
    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' 
    : 'bg-yellow-100 text-yellow-800 border-yellow-200',
  needs_improvement: (isDarkMode: boolean) => isDarkMode 
    ? 'bg-red-500/20 text-red-300 border-red-400/30' 
    : 'bg-red-100 text-red-800 border-red-200',
};

const RATING_ICONS = {
  excellent: '⭐⭐⭐⭐⭐',
  good: '⭐⭐⭐⭐',
  average: '⭐⭐⭐',
  needs_improvement: '⭐⭐',
};

export function InterviewHistory({ interviews, onStartNew, isDarkMode }: InterviewHistoryProps) {
  const [selectedInterview, setSelectedInterview] = useState<typeof interviews[0] | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt: Date, endedAt?: Date | null) => {
    if (!endedAt) return 'In Progress';

    const duration = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (interviews.length === 0) {
    return (
      <div className="text-center space-y-8">
        <div className={`backdrop-blur-lg rounded-3xl border p-12 transition-all duration-500 ${
          isDarkMode
            ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
            : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-xl'
        }`}>
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            No Interviews Yet
          </h3>
          <p className={`text-lg mb-8 max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You haven't completed any interviews yet. Start your first interview to see your history and track your progress.
          </p>
          <Button
            onClick={onStartNew}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 text-white"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Start Your First Interview
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Interview History
          </h2>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Review your past interviews and track your progress
          </p>
        </div>
        <Button
          onClick={onStartNew}
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-white"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Interview
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      {/* Interview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interview Cards */}
        <div className="space-y-6">
          <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Recent Interviews
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className={`group relative transform transition-all duration-300 cursor-pointer ${
                  selectedInterview?.id === interview.id ? 'scale-[1.02] -translate-y-1' : 'hover:scale-[1.01] hover:-translate-y-0.5'
                }`}
                onClick={() => setSelectedInterview(interview)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-sky-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
                    : 'bg-white/70 border-white/40 hover:border-blue-500/60 shadow-lg'
                } ${selectedInterview?.id === interview.id ? 'ring-2 ring-blue-400' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {interview.jobRole}
                      </h4>
                      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Calendar className="h-4 w-4" />
                        {formatDate(interview.startedAt)}
                      </div>
                    </div>
                    <Badge 
                      variant={interview.status === 'completed' ? 'default' : 'secondary'}
                      className={interview.status === 'completed' ? 'bg-green-500/20 text-green-300' : ''}
                    >
                      {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(interview.startedAt, interview.endedAt)}</span>
                    </div>
                    {interview.feedback && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{RATING_ICONS[interview.feedback.overallRating]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Details */}
        <div className="space-y-6">
          <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Interview Details
          </h3>
          <div className={`backdrop-blur-lg rounded-2xl border transition-all duration-500 ${
            isDarkMode
              ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
              : 'bg-white/70 border-white/40 hover:border-blue-500/60 shadow-lg'
          }`}>
            {selectedInterview ? (
              <div className="p-8 space-y-6">
                <div>
                  <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {selectedInterview.jobRole}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(selectedInterview.startedAt)}
                  </p>
                </div>

                {/* Basic Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Status
                      </span>
                    </div>
                    <Badge 
                      variant={selectedInterview.status === 'completed' ? 'default' : 'secondary'}
                      className={selectedInterview.status === 'completed' ? 'bg-green-500/20 text-green-300' : ''}
                    >
                      {selectedInterview.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Duration
                      </span>
                    </div>
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {formatDuration(selectedInterview.startedAt, selectedInterview.endedAt)}
                    </span>
                  </div>
                </div>

                {/* Resume Analysis Context */}
                {selectedInterview.resumeAnalysis && (
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/20'
                  }`}>
                    <h5 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      <FileText className="h-4 w-4" />
                      Resume Context
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Skills:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(selectedInterview.resumeAnalysis.skills as unknown as Skills)?.technical?.slice(0, 4).map((skill: string) => (
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
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                {selectedInterview.feedback && (
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/20'
                  }`}>
                    <h5 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      <Award className="h-4 w-4" />
                      Performance Feedback
                    </h5>
                    <div className="space-y-4">
                      {/* Overall Rating */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Overall Rating:
                        </span>
                        <Badge className={RATING_COLORS[selectedInterview.feedback.overallRating](isDarkMode)}>
                          {selectedInterview.feedback.overallRating.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Skill Ratings */}
                      {selectedInterview.feedback.skillRatings && (
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Skill Ratings:
                          </span>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {Object.entries(selectedInterview.feedback.skillRatings as unknown as Record<string, 'excellent' | 'good' | 'average' | 'needs_improvement'>).map(([skill, rating]) => (
                              <div key={skill} className="flex items-center justify-between">
                                <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {skill}:
                                </span>
                                <Badge variant="outline" className={`text-xs ${
                                  isDarkMode 
                                    ? 'bg-gray-500/10 text-gray-300 border-gray-400/30' 
                                    : 'bg-gray-500/10 text-gray-700 border-gray-400/40'
                                }`}>
                                  {rating.replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths & Improvements */}
                      {selectedInterview.feedback.strengths && (
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Strengths:
                          </span>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedInterview.feedback.strengths}
                          </p>
                        </div>
                      )}

                      {selectedInterview.feedback.improvements && (
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                            Areas for Improvement:
                          </span>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedInterview.feedback.improvements}
                          </p>
                        </div>
                      )}

                      {/* Summary */}
                      {selectedInterview.feedback.summary && (
                        <div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Summary:
                          </span>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {selectedInterview.feedback.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Feedback */}
                {!selectedInterview.feedback && selectedInterview.status === 'completed' && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No feedback available for this interview</p>
                  </div>
                )}

                {/* In Progress */}
                {selectedInterview.status === 'in_progress' && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">This interview is still in progress</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center justify-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an interview to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {interviews.length > 0 && (
        <div className={`backdrop-blur-lg rounded-2xl border p-6 transition-all duration-500 ${
          isDarkMode
            ? 'bg-white/10 border-white/20 hover:border-blue-400/50'
            : 'bg-white/50 border-white/40 hover:border-blue-500/60 shadow-lg'
        }`}>
          <h3 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Interview Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {interviews.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Interviews
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {interviews.filter(i => i.status === 'completed').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Completed
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {interviews.filter(i => i.feedback?.overallRating === 'excellent' || i.feedback?.overallRating === 'good').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Good+ Ratings
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {interviews.filter(i => i.status === 'completed').length > 0
                  ? Math.round(interviews.filter(i => i.status === 'completed').length / interviews.length * 100)
                  : 0}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Completion Rate
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
