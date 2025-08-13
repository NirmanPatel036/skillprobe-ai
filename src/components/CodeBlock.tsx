'use client';

import React, { useEffect, useState } from 'react';

const TypewriterCode = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  
  const codeLines = [
    'onClick("Start Interview", async () => {',
    '  const questions = await trpc.startInterview.query();',
    '  if (!clerk.isUserAllowed(currentUser)) {',
    '    throw new Error("Access denied");',
    '  }',
    '  const generatedQuestions = await gemini.generateQuestions(',
    '    currentUser.profile',
    '  );',
    '  showQuestions(generatedQuestions);',
    '  const answers = await collectAnswers();',
    '  const response = await gemini.evaluateAnswers(answers);',
    '  await db.saveInterview({',
    '    userId: currentUser.id,',
    '    questions: generatedQuestions,',
    '    answers,',
    '    response,',
    '  });',
    '  displayResults(response);',
    '});'
  ];

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) return;

    const currentLine = codeLines[currentLineIndex];
    
    if (currentLine !== undefined && currentCharIndex <= currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.substring(0, currentCharIndex);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timer);
    } else if (currentLine !== undefined) {
      const timer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex, codeLines]);

  return (
    <div className={`w-full max-w-2xl h-[530px] rounded-2xl overflow-hidden shadow-2xl ${
      isDarkMode 
        ? 'bg-slate-900 border border-slate-700' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Code Editor Header */}
      <div className={`flex items-center px-4 py-3 border-b ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className={`ml-4 text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          interviewFlow.js
        </div>
      </div>
      
      {/* Code Content */}
      <div className="p-4 font-mono text-sm h-full overflow-y-auto">
        {displayedLines.map((line, index) => (
          <div key={index} className="min-h-[1.5rem] flex">
            <span className={`w-8 text-right pr-2 select-none ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {line.trim() ? index + 1 : ''}
            </span>
            <span className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} whitespace-pre`}>
              {(() => {
                const tokens = [];
                const fullLine = codeLines[index] || '';
                let i = 0;

                while (i < line.length) {
                  // Keywords
                  const keywordMap: Record<string, string> = {
                    'const': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                    'let': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                    'async': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                    'await': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                    'if': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                    'throw': isDarkMode ? 'text-purple-400' : 'text-purple-700',
                  };
                  const keyword = Object.keys(keywordMap).find(kw => fullLine.startsWith(kw, i));
                  if (keyword && line.length >= i + keyword.length) {
                    tokens.push(<span key={i} className={keywordMap[keyword]}>{keyword}</span>);
                    i += keyword.length;
                    continue;
                  }

                  // Strings
                  const stringChars = ['"', "'", '`'];
                  if (typeof fullLine[i] === 'string' && stringChars.includes(fullLine[i]!)) {
                    const quote = fullLine[i]!;
                    const stringEnd = fullLine.indexOf(quote, i + 1);
                    if (stringEnd !== -1 && stringEnd < line.length) {
                      const stringContent = fullLine.substring(i, stringEnd + 1);
                      const stringColor = isDarkMode ? 'text-green-400' : 'text-green-700';
                      tokens.push(<span key={i} className={stringColor}>{stringContent}</span>);
                      i = stringEnd + 1;
                      continue;
                    }
                  }

                  // Variables / functions
                  const vars = [
                    'onClick', 'trpc', 'clerk', 'gemini', 'showQuestions', 
                    'collectAnswers', 'db', 'displayResults', 'currentUser', 'profile'
                  ];
                  const variable = vars.find(v => fullLine.startsWith(v, i));
                  if (variable && line.length >= i + variable.length) {
                    const variableColor = isDarkMode ? 'text-yellow-300' : 'text-[#b8860b]';
                    tokens.push(
                      <span key={i} className={variableColor}>{variable}</span>
                    );
                    i += variable.length;
                    continue;
                  }

                  // Default
                  tokens.push(<span key={i}>{fullLine[i]}</span>);
                  i++;
                }

                // Cursor
                if (index === currentLineIndex && currentCharIndex === line.length) {
                  tokens.push(
                    <span key="cursor" className={`animate-pulse ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>|</span>
                  );
                }

                return tokens;
              })()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypewriterCode;
