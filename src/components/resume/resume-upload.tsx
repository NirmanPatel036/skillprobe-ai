"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";

interface ResumeUploadProps {
    onAnalysisComplete?: (analysisId: number) => void;
    isDarkMode: boolean;
}

export function ResumeUpload({ onAnalysisComplete, isDarkMode }: ResumeUploadProps) {
    const [resumeText, setResumeText] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [uploadMethod, setUploadMethod] = useState<"text" | "file">("file");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useUser();

    const analyzeResumeMutation = api.resume.analyzeResume.useMutation({
        onSuccess: (data) => {
            toast.success("Success!", {
                description: "Resume analyzed successfully",
            });
            setResumeText("");
            setJobRole("");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onAnalysisComplete?.(data.analysisId);
        },
        onError: (error) => {
            toast.error(
                "Error", {
                description: error.message
            });
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Invalid file type", {
                description: "Please select a PDF file",
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large", {
                description: "Please select a file smaller than 10MB",
            });
            return;
        }

        setSelectedFile(file);
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Authentication required", {
                description: "Please sign in to analyze your resume",
            });
            return;
        }

        if (!jobRole.trim()) {
            toast.error("Job role required", {
                description: "Please enter the target job role",
            });
            return;
        }

        if (uploadMethod === "text" && !resumeText.trim()) {
            toast.error("Resume text required", {
                description: "Please enter your resume text",
            });
            return;
        }

        if (uploadMethod === "file" && !selectedFile) {
            toast.error("File required", {
                description: "Please select a PDF file",
            });
            return;
        }

        try {
            let finalResumeText = resumeText;

            if (uploadMethod === "file" && selectedFile) {
                // Convert PDF to base64 for Gemini processing
                const base64Data = await convertFileToBase64(selectedFile);
                // Use JSON format for more reliable parsing
                const fileData = {
                    type: 'PDF_FILE',
                    data: base64Data,
                    fileName: selectedFile.name
                };
                finalResumeText = JSON.stringify(fileData);
            }

            analyzeResumeMutation.mutate({
                resumeText: finalResumeText,
                jobRole: jobRole.trim(),
                userId: user.id,
            });
        } catch {
            toast.error("Error", {
                description: "Failed to process file",
            });
        }
    };

    const cardClassName = `backdrop-blur-lg border transition-all duration-300 ${
        isDarkMode
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-white/40 border-black/10 hover:bg-white/60'
    }`;

    const inputClassName = `backdrop-blur transition-all duration-300 ${
        isDarkMode
            ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400'
            : 'bg-white/20 border-black/20 text-black placeholder:text-gray-600 focus:border-blue-600'
    }`;

    const buttonActiveClassName = `px-4 py-2 rounded-lg border transition-all duration-300 ${
        isDarkMode
            ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
            : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
    }`;

    const buttonInactiveClassName = `px-4 py-2 rounded-lg border transition-all duration-300 ${
        isDarkMode
            ? 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
            : 'bg-black/5 border-black/20 text-gray-700 hover:bg-black/10'
    }`;

    return (
        <Card className={`w-full max-w-2xl mx-auto ${cardClassName}`}>
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    <FileText className="h-5 w-5" />
                    Resume Analysis
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Job Role Input */}
                    <div className="space-y-2">
                        <Label htmlFor="jobRole" className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                            Target Job Role *
                        </Label>
                        <Input
                            id="jobRole"
                            type="text"
                            placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            required
                            className={inputClassName}
                        />
                    </div>

                    {/* Upload Method Toggle */}
                    <div className="space-y-3">
                        <Label className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>Upload Method</Label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setUploadMethod("text")}
                                className={uploadMethod === "text" ? buttonActiveClassName : buttonInactiveClassName}
                            >
                                Paste Text
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMethod("file")}
                                className={uploadMethod === "file" ? buttonActiveClassName : buttonInactiveClassName}
                            >
                                Upload PDF
                            </button>
                        </div>
                    </div>

                    {/* Text Input */}
                    {uploadMethod === "text" && (
                        <div className="space-y-2">
                            <Label htmlFor="resumeText" className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                                Resume Text *
                            </Label>
                            <Textarea
                                id="resumeText"
                                placeholder="Paste your resume text here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                rows={12}
                                className={`min-h-[300px] ${inputClassName}`}
                                required
                            />
                        </div>
                    )}

                    {/* File Upload */}
                    {uploadMethod === "file" && (
                        <div className="space-y-2">
                            <Label htmlFor="resumeFile" className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>
                                Upload Resume PDF *
                            </Label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                                isDarkMode 
                                    ? 'border-white/25 hover:border-white/40' 
                                    : 'border-black/25 hover:border-black/40'
                            }`}>
                                <input
                                    ref={fileInputRef}
                                    id="resumeFile"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="space-y-2">
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                                {selectedFile.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <Upload className={`h-8 w-8 mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                                            isDarkMode
                                                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                                : 'bg-black/10 border-black/20 text-black hover:bg-black/20'
                                        }`}
                                    >
                                        {selectedFile ? "Change File" : "Select PDF File"}
                                    </button>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Maximum file size: 10MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={analyzeResumeMutation.isPending}
                        className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 text-white ${
                            analyzeResumeMutation.isPending 
                                ? 'opacity-50 cursor-not-allowed' 
                                : isDarkMode 
                                    ? 'hover:shadow-2xl hover:shadow-blue-500/25' 
                                    : 'hover:shadow-xl hover:shadow-blue-500/30'
                        }`}
                    >
                        {analyzeResumeMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                Analyzing Resume...Hold Tight
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4 inline" />
                                Analyze Resume
                            </>
                        )}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}