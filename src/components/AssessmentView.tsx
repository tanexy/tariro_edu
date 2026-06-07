/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Flame
} from "lucide-react";
import { QuizQuestion } from "../types";

interface AssessmentViewProps {
  spaceName: string;
  quizzes: QuizQuestion[];
}

export default function AssessmentView({ spaceName, quizzes }: AssessmentViewProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<{ idx: number; chosen: string; correct: boolean }[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const activeQuestion = quizzes[activeIdx];

  const handleSelectOption = (opt: string) => {
    if (!isAnswerChecked) {
      setSelectedOption(opt);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswerChecked) return;
    
    setIsAnswerChecked(true);
    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    setSessionAnswers(prev => [...prev, {
      idx: activeIdx,
      chosen: selectedOption,
      correct: isCorrect
    }]);
  };

  const handleNext = () => {
    if (activeIdx < quizzes.length - 1) {
      setActiveIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setActiveIdx(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setSessionAnswers([]);
    setIsQuizComplete(false);
  };

  const correctAnswersCount = sessionAnswers.filter(a => a.correct).length;
  const gradePercentage = quizzes.length > 0
    ? Math.round((correctAnswersCount / quizzes.length) * 100)
    : 0;

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-6 flex flex-col font-sans" id="assessment-panel">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <BookOpen className="w-5.3 h-5.3" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Knowledge Check Assessments</h2>
            <p className="text-xs text-gray-400 mt-0.5">Validate your understanding of uploaded learning modules.</p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-cosmic-border flex items-center gap-2 text-xs font-mono">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-gray-300">Space Mode: <span className="text-white font-bold">EXAM PREP</span></span>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="border border-dashed border-cosmic-border rounded-2xl bg-cosmic-card/20 py-16 text-center select-none flex-1 flex flex-col items-center justify-center p-6">
          <HelpCircle className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="font-display font-medium text-white text-sm">No Assessments Extracted</h3>
          <p className="text-gray-500 text-xs mt-1.5 max-w-sm mx-auto">Upload more complete documents or scan additional folders to extract interactive questions.</p>
        </div>
      ) : isQuizComplete ? (
        /* QUIZ RECAP SCREEN */
        <div className="max-w-md mx-auto w-full bg-cosmic-card border border-cosmic-border rounded-2xl p-6 shadow-2xl text-center space-y-6 my-auto">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border-2 border-cosmic-accent flex items-center justify-center text-cosmic-accent mx-auto">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-white font-display font-bold text-lg">Evaluation Concluded</h3>
            <span className="text-xs text-gray-400 block mt-1">Grounded assessment for workspace <span className="text-white font-semibold">{spaceName}</span></span>
          </div>

          {/* Grade banner */}
          <div className="bg-cosmic-bg border border-cosmic-border rounded-xl p-5 space-y-3">
            <div className="text-sm font-semibold text-gray-400 font-mono tracking-wider uppercase">Your Score</div>
            <div className="text-4xl font-extrabold text-white font-display tracking-tight leading-none">
              {gradePercentage}%
            </div>
            <p className="text-xs font-medium text-gray-300">
               ({correctAnswersCount} correct out of {quizzes.length} total items)
            </p>
            
            {/* Custom feedback message */}
            <p className="text-xs text-indigo-300 font-mono italic pt-1">
              {gradePercentage >= 80 ? "🏆 Executive Mastery Achieved" :
               gradePercentage >= 50 ? "⚡ Basic Proficiency Verified" :
               "🧭 Further Research & Tutor study recommended"}
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-2.8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="w-4 h-4" /> Reset Assessment
          </button>
        </div>
      ) : (
        /* QUIZ ACTIVE SCREEN */
        <div className="max-w-2xl mx-auto w-full space-y-4 flex-1 flex flex-col justify-center">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-gray-500 uppercase">
              <span>Question {activeIdx + 1} of {quizzes.length}</span>
              <span>{Math.round(((activeIdx + 1) / quizzes.length) * 100)}% progress</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${((activeIdx + 1) / quizzes.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5.5 space-y-5 shadow-xl">
            {/* Header info */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono border border-sky-500/20 bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded capitalize">
                {activeQuestion.type || "Multiple Choice"}
              </span>
            </div>

            {/* Question prompt */}
            <p className="text-sm font-display font-semibold text-white leading-snug">
              {activeQuestion.question}
            </p>

            {/* Interactive Options list */}
            <div className="space-y-2.5">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                
                // Styling configurations depending on answer state
                let optionStyle = "border-cosmic-border bg-cosmic-bg/40 hover:border-slate-700 text-gray-300";
                
                if (isSelected) {
                  optionStyle = "border-indigo-500 bg-indigo-500/10 text-white font-semibold";
                }

                if (isAnswerChecked) {
                  const isOptCorrect = opt === activeQuestion.correctAnswer;
                  if (isOptCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                  } else if (isSelected) {
                    optionStyle = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold";
                  } else {
                    optionStyle = "border-cosmic-border/40 opacity-45 text-gray-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-3.5 px-4 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer leading-tight ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && opt === activeQuestion.correctAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {isAnswerChecked && isSelected && opt !== activeQuestion.correctAnswer && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {isAnswerChecked && (
              <div className="mt-4 p-4.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5 animate-fade-in text-xs leading-relaxed select-text">
                <span className="font-mono text-[10.5px] font-bold text-emerald-400 flex items-center gap-1.5">
                   🎓 SCORE CRITIQUE EXPLANATION
                </span>
                <p className="text-gray-300 text-[11.5px] leading-relaxed">
                  {activeQuestion.explanation}
                </p>
              </div>
            )}

            {/* Footer action */}
            <div className="flex items-center justify-end text-xs font-semibold pt-2 border-t border-cosmic-border/60">
              {!isAnswerChecked ? (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="px-4 py-2 rounded-lg bg-indigo-600 border border-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  Verify Selection
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
                >
                  {activeIdx === quizzes.length - 1 ? "Evaluate Session" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
