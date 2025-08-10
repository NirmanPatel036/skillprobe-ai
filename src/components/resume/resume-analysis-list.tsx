"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  Briefcase, 
  Eye, 
  Trash2,
  Star
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface ResumeAnalysisListProps {
  userId: string;
  onViewAnalysis?: (analysisId: number) => void;
  isDarkMode: boolean;
}

export function ResumeAnalysisList({ userId, onViewAnalysis, isDarkMode }: ResumeAnalysisListProps) {
  const { data: analyses, isLoading, refetch } = api.resume.getUserAnalyses.useQuery({ userId });

  const deleteAnalysisMutation = api.resume.deleteAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Analysis deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete analysis");
    },
  });

  const handleDelete = (analysisId: number) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysisMutation.mutate({ analysisId, userId });
    }
  };

  const cardClassName = `backdrop-blur-lg border transition-all duration-300 ${
    isDarkMode
      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10'
      : 'bg-white/40 border-black/10 hover:bg-white/60 hover:shadow-xl hover:shadow-blue-500/20'
  }`;

  const buttonClassName = `px-4 py-2 rounded-lg border font-medium transition-all duration-300 ${
    isDarkMode
      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
      : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
  }`;

  const primaryButtonClassName = `px-4 py-2 flex items-center justify-center bg-gradient-to-r from-blue-600 to-sky-600 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-white ${
    isDarkMode ? 'hover:shadow-lg hover:shadow-blue-500/25' : 'hover:shadow-lg hover:shadow-blue-500/30'
  }`;

  if (isLoading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${cardClassName}`}>
        <CardContent className="p-8">
          <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            Loading your resume analyses...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${cardClassName}`}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur rounded-full border ${
              isDarkMode
                ? 'bg-blue-500/20 border-blue-400/30'
                : 'bg-blue-500/10 border-blue-400/40'
            }`}>
              <FileText className={`h-8 w-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                No Resume Analyses Yet
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Upload your first resume to get started with AI-powered analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Your Resume Analyses
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm border ${
          isDarkMode 
            ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
            : 'bg-blue-100 text-blue-800 border-blue-300'
        }`}>
          {analyses.length} total
        </span>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis) => {
          const gemini = analysis.geminiAnalysis as any;
          const overallScore = gemini?.overallScore || 0;
          const skillsCount = gemini?.skills ? 
            Object.values(gemini.skills).flat().length : 0;

          return (
            <Card key={analysis.id} className={cardClassName}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      <Briefcase className="h-5 w-5" />
                      {analysis.jobRole}
                    </CardTitle>
                    <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </div>
                      {overallScore > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Score: {overallScore}/100
                        </div>
                      )}
                      {skillsCount > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          isDarkMode 
                            ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                            : 'bg-green-100 text-green-800 border-green-300'
                        }`}>
                          {skillsCount} skills identified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onViewAnalysis?.(analysis.id)}
                      className={primaryButtonClassName}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      disabled={deleteAnalysisMutation.isPending}
                      className={`${buttonClassName} ${
                        deleteAnalysisMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-400 hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {gemini && (
                <CardContent className="pt-0">
                  <Separator className={`mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                  
                  {/* Quick Preview */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {gemini.strengths && gemini.strengths.length > 0 && (
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          Key Strengths
                        </h4>
                        <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {gemini.strengths.slice(0, 2).map((strength: string, index: number) => (
                            <li key={index}>
                              • {strength.length > 50 ? `${strength.substring(0, 50)}...` : strength}
                            </li>
                          ))}
                          {gemini.strengths.length > 2 && (
                            <li className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{gemini.strengths.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {gemini.skills?.technical && (
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          Technical Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {gemini.skills.technical.slice(0, 3).map((skill: string, index: number) => (
                            <span 
                              key={index} 
                              className={`px-2 py-1 rounded-full text-xs border ${
                                isDarkMode 
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {gemini.skills.technical.length > 3 && (
                            <span className={`px-2 py-1 rounded-full text-xs border ${
                              isDarkMode 
                                ? 'bg-white/10 text-gray-300 border-white/20' 
                                : 'bg-black/10 text-gray-700 border-black/20'
                            }`}>
                              +{gemini.skills.technical.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {gemini.experience?.totalYears && (
                      <div>
                        <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          Experience
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {gemini.experience.totalYears} years total
                        </p>
                        {gemini.experience.positions && (
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gemini.experience.positions.length} position(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resume Text Preview */}
                  {analysis.resumeText && (
                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                      <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Resume Preview
                      </h4>
                      <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {analysis.resumeText.substring(0, 200)}...
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}