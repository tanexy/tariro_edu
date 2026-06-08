/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Target,
  Sparkles,
  Award,
  AlertCircle
} from "lucide-react";
import { QuizQuestion } from "../../types/index";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

interface AssessmentViewProps {
  spaceName: string;
  quizzes: QuizQuestion[];
}

export default function AssessmentView({
  spaceName,
  quizzes
}: AssessmentViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{questionId: string, isCorrect: boolean}[]>([]);

  if (quizzes.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold mb-2">No assessments generated yet</h3>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Please wait for the AI to analyze your documents and generate questions.
        </p>
      </div>
    );
  }

  const activeQuestion = quizzes[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswers(prev => [...prev, { questionId: activeQuestion.id, isCorrect }]);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
  };

  if (showResult) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8">
        <div className="relative">
          <div className={`h-32 w-32 rounded-full border-4 flex items-center justify-center bg-secondary/30 ${
            percentage >= 70 ? 'border-emerald-500' : percentage >= 40 ? 'border-amber-500' : 'border-destructive'
          }`}>
             <Award className={`h-16 w-16 ${
               percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-amber-500' : 'text-destructive'
             }`} />
          </div>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 text-lg font-display">
            {percentage}%
          </Badge>
        </div>

        <div className="space-y-2">
          <h2 className="text-h2">Assessment Complete</h2>
          <p className="text-muted-foreground">
            You scored <span className="text-foreground font-bold">{score} out of {quizzes.length}</span> on the <span className="font-medium text-foreground">{spaceName}</span> assessment.
          </p>
        </div>

        <Card className="w-full">
           <CardContent className="pt-6 grid grid-cols-5 gap-2">
             {answers.map((ans, i) => (
               <div
                 key={i}
                 className={`h-10 rounded-lg flex items-center justify-center border ${
                   ans.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-destructive/10 border-destructive/30 text-destructive'
                 }`}
               >
                 {i + 1}
               </div>
             ))}
           </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={resetQuiz} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Retake Quiz
          </Button>
          <Button className="gap-2">
             View Performance Report <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / quizzes.length) * 100;

  return (
    <div className="p-8 h-full flex flex-col max-w-4xl mx-auto space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-5 w-5 text-sky-500" />
            <h2 className="text-h2">Knowledge Assessment</h2>
          </div>
          <p className="text-caption">Validating depth of understanding for <span className="font-medium text-foreground">{spaceName}</span>.</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="font-mono text-[10px] py-1 px-3">
             Question {currentIndex + 1} of {quizzes.length}
           </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Question Area */}
      <div className="flex-1 flex flex-col space-y-8">
        <div className="space-y-4">
           <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-widest px-2">
             {activeQuestion.type.replace('-', ' ')}
           </Badge>
           <h3 className="text-xl md:text-2xl font-display font-bold leading-tight">
             {activeQuestion.question}
           </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
           {activeQuestion.options.map((option, i) => {
             const isSelected = selectedOption === option;
             const isCorrect = option === activeQuestion.correctAnswer;
             const showSuccess = isSubmitted && isCorrect;
             const showDanger = isSubmitted && isSelected && !isCorrect;

             return (
               <button
                 key={i}
                 onClick={() => handleOptionSelect(option)}
                 disabled={isSubmitted}
                 className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                   showSuccess ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                   showDanger ? 'bg-destructive/10 border-destructive text-destructive' :
                   isSelected ? 'bg-primary/5 border-primary text-primary' :
                   'bg-secondary/30 border-border hover:border-primary/30 hover:bg-secondary/50'
                 }`}
               >
                 <span className="text-sm font-medium">{option}</span>
                 {showSuccess && <CheckCircle2 className="h-5 w-5" />}
                 {showDanger && <XCircle className="h-5 w-5" />}
               </button>
             );
           })}
        </div>

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`${selectedOption === activeQuestion.correctAnswer ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <CardContent className="pt-6 flex gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedOption === activeQuestion.correctAnswer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest font-mono">Explanation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">{activeQuestion.explanation}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-border flex items-center justify-between">
         <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
           <Sparkles className="h-3.5 w-3.5 text-tariro-indigo" />
           AI Verified Evaluation
         </div>
         <div className="flex gap-3">
           {!isSubmitted ? (
             <Button
               onClick={handleSubmit}
               disabled={!selectedOption}
               className="px-8"
             >
               Submit Answer
             </Button>
           ) : (
             <Button
               onClick={handleNext}
               className="px-8 gap-2"
             >
               {currentIndex < quizzes.length - 1 ? 'Next Question' : 'View Results'}
               <ChevronRight className="h-4 w-4" />
             </Button>
           )}
         </div>
      </div>
    </div>
  );
}
