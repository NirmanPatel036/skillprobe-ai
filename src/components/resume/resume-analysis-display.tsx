"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  Star,
  Clock,
  Building
} from "lucide-react";

interface ResumeAnalysisDisplayProps {
  analysis: {
    id: number;
    jobRole: string;
    resumeText: string;
    skills: any;
    experience: any;
    geminiAnalysis: any;
    createdAt: Date;
  };
  isDarkMode: boolean;
}

export function ResumeAnalysisDisplay({ analysis, isDarkMode }: ResumeAnalysisDisplayProps) {
  const gemini = analysis.geminiAnalysis;

  // Debug logging
  console.log('Analysis data:', analysis);
  console.log('Gemini analysis:', gemini);
  console.log('Overall score:', gemini?.overallScore);

  // Safely extract data with fallbacks
  const skills = gemini?.skills || [];
  const experience = gemini?.experience || {};
  const education = gemini?.education || {};
  const strengths = gemini?.strengths || [];
  const improvementAreas = gemini?.improvementAreas || [];
  const overallScore = gemini?.overallScore || 0;
  const recommendations = gemini?.recommendations || [];

  const cardClassName = `backdrop-blur-lg border transition-all duration-300 ${
    isDarkMode
      ? 'bg-white/5 border-white/10 hover:bg-white/10'
      : 'bg-white/40 border-black/10 hover:bg-white/60'
  }`;

  const badgeVariants = {
    technical: isDarkMode ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-blue-100 text-blue-800 border-blue-300',
    programming: isDarkMode ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-green-100 text-green-800 border-green-300',
    soft: isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-purple-100 text-purple-800 border-purple-300',
    tools: isDarkMode ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' : 'bg-orange-100 text-orange-800 border-orange-300',
    certification: isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <User className="h-5 w-5" />
            Resume Analysis for {analysis.jobRole}
          </CardTitle>
          <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Overall Score: {typeof overallScore === 'number' ? overallScore : 0}/100
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={overallScore} 
            className={`w-full ${isDarkMode ? 'bg-white/20' : 'bg-black/20'}`} 
          />
        </CardContent>
      </Card>

      {/* Skills Section */}
      {(skills.technical || skills.soft || skills.programming || skills.tools) && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <Award className="h-5 w-5" />
              Skills Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.technical && (
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm border ${badgeVariants.technical}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.programming && (
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Programming Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.programming.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm border ${badgeVariants.programming}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft && (
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.soft.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm border ${badgeVariants.soft}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools && (
              <div>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm border ${badgeVariants.tools}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {experience.positions && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <Briefcase className="h-5 w-5" />
              Work Experience ({experience.totalYears || 0} years total)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.positions.map((position: any, index: number) => (
              <div key={index} className={`border-l-2 pl-4 space-y-2 ${
                isDarkMode ? 'border-blue-400' : 'border-blue-600'
              }`}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{position.role}</h4>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>at {position.company}</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{position.duration}</p>
                {position.responsibilities && (
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {position.responsibilities.map((resp: string, respIndex: number) => (
                      <li key={respIndex} className="list-disc list-inside">
                        {resp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {education.degrees && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.degrees.map((degree: any, index: number) => (
              <div key={index} className="space-y-1">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{degree.degree}</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {degree.institution} • {degree.year}
                </p>
              </div>
            ))}
            {education.certifications && education.certifications.length > 0 && (
              <div className={`pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {education.certifications.map((cert: string, index: number) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 rounded-full text-sm border ${badgeVariants.certification}`}
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strengths and Improvement Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {strengths.length > 0 && (
          <Card className={cardClassName}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                <TrendingUp className="h-5 w-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      isDarkMode ? 'bg-green-400' : 'bg-green-500'
                    }`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {improvementAreas.length > 0 && (
          <Card className={cardClassName}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                <AlertTriangle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {improvementAreas.map((area: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      isDarkMode ? 'bg-orange-400' : 'bg-orange-500'
                    }`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <Star className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec: string, index: number) => (
                <li key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                  isDarkMode ? 'bg-white/5' : 'bg-black/5'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Raw Analysis Fallback */}
      {gemini?.rawAnalysis && !gemini?.skills && (
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-black'}>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className={`text-sm whitespace-pre-wrap p-4 rounded-lg overflow-auto ${
              isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-black/5 text-gray-700'
            }`}>
              {gemini.rawAnalysis}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}