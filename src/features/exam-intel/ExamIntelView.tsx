/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Award,
  Target,
  BarChart3,
  BrainCircuit,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FileText
} from "lucide-react";
import { ExamIntelReport } from "../../types/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

interface ExamIntelViewProps {
  spaceId: string;
  spaceName: string;
  examIntelligence: ExamIntelReport;
  onRefreshIntel: () => void;
}

export default function ExamIntelView({
  spaceId,
  spaceName,
  examIntelligence,
  onRefreshIntel
}: ExamIntelViewProps) {

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-tariro-purple" />
            <h1 className="text-h1">Exam Intelligence</h1>
          </div>
          <p className="text-caption text-lg">Predictive analytics and pattern mining for <span className="font-semibold text-foreground">{spaceName}</span>.</p>
        </div>
        <Button onClick={onRefreshIntel} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Regenerate Report
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Topics & Styles */}
        <div className="lg:col-span-2 space-y-8">

          {/* Frequency Analysis */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-h3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-tariro-indigo" /> High-Yield Topics
              </h3>
              <Badge variant="outline" className="font-mono text-[10px]">REPEATED PATTERNS</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examIntelligence.frequencyAnalysis.repeatedTopics.map((topic, i) => (
                <Card key={i} className="p-4 bg-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold truncate max-w-[70%]">{topic.topic}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">Rank #{topic.rank}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase">
                      <span>Frequency</span>
                      <span>{topic.percentageOccurrence}%</span>
                    </div>
                    <Progress value={topic.percentageOccurrence} className="h-1.5" />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Question Styles */}
          <section className="space-y-4">
            <h3 className="text-h3 flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-500" /> Examiner Style Profile
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {examIntelligence.questionStyleAnalysis.styles.map((style, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                   <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
                     <span className="text-xs font-bold text-muted-foreground">{style.percentage}%</span>
                   </div>
                   <div className="flex-1 space-y-1">
                     <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{style.styleName}</p>
                     </div>
                     <p className="text-xs text-muted-foreground leading-relaxed">{style.description}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Predicted Questions */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-h3 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-emerald-500" /> Predictive Simulations
                </h3>
                <Badge variant="success" className="font-mono text-[10px]">AI GENERATED</Badge>
             </div>
             <div className="space-y-4">
                {examIntelligence.examPrediction.predictedQuestions.map((q, i) => (
                  <Card key={i} className="overflow-hidden border-emerald-500/10">
                    <CardHeader className="bg-emerald-500/[0.03] border-b border-emerald-500/10 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Question {i+1}</span>
                        <Badge variant="outline" className={`text-[9px] font-mono ${
                          q.predictionConfidence === 'High' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                          q.predictionConfidence === 'Medium' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' :
                          'text-muted-foreground'
                        }`}>
                          {q.predictionConfidence} Confidence
                        </Badge>
                      </div>
                      <CardTitle className="text-base leading-relaxed">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">Model Solution</p>
                        <div className="p-4 rounded-lg bg-secondary/40 text-xs leading-relaxed text-muted-foreground border border-border italic whitespace-pre-wrap">
                          {q.fullModelAnswer}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {q.variations.map((v, vi) => (
                          <Badge key={vi} variant="outline" className="text-[9px] font-mono py-1 px-2">Var: {v}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </section>
        </div>

        {/* Right Column: Strategic Insights */}
        <div className="space-y-8">

          {/* Prioritization */}
          <section className="space-y-4">
            <h3 className="text-h3 text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-mono">
              <TrendingUp className="h-4 w-4" /> Study Priority
            </h3>
            <Card className="p-1">
              <div className="space-y-1">
                <div className="p-3 bg-emerald-500/5 border-l-2 border-emerald-500">
                  <p className="text-[9px] font-mono font-bold text-emerald-500 uppercase mb-1">High Focus</p>
                  <div className="space-y-1">
                    {examIntelligence.studyPrioritization.highPriority.map((p, i) => (
                      <p key={i} className="text-xs font-medium">• {p}</p>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-amber-500/5 border-l-2 border-amber-500">
                  <p className="text-[9px] font-mono font-bold text-amber-500 uppercase mb-1">Medium Focus</p>
                  <div className="space-y-1">
                    {examIntelligence.studyPrioritization.mediumPriority.map((p, i) => (
                      <p key={i} className="text-xs font-medium">• {p}</p>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-muted/20 border-l-2 border-muted">
                  <p className="text-[9px] font-mono font-bold text-muted-foreground uppercase mb-1">Low Focus</p>
                  <div className="space-y-1">
                    {examIntelligence.studyPrioritization.lowPriority.map((p, i) => (
                      <p key={i} className="text-xs font-medium text-muted-foreground">• {p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Weak Areas */}
          <section className="space-y-4">
             <h3 className="text-h3 text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-mono">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Coverage Gaps
            </h3>
            <div className="space-y-3">
              {examIntelligence.weakAreaDetection.gaps.map((gap, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2">
                   <p className="text-xs font-bold text-amber-500">{gap.topic}</p>
                   <p className="text-[11px] text-muted-foreground leading-relaxed">{gap.reason}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Patterns */}
          <section className="space-y-4">
             <h3 className="text-h3 text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-mono">
              <Lightbulb className="h-4 w-4 text-tariro-indigo" /> Examiner Patterns
            </h3>
            <Card className="p-4 space-y-6">
               <div>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-2">Recurring Phrases</p>
                  <div className="flex flex-wrap gap-2">
                     {examIntelligence.examinerPattern.recurringPhrases.map((phrase, i) => (
                       <Badge key={i} variant="secondary" className="text-[9px] italic">"{phrase}"</Badge>
                     ))}
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-2">Structural Analysis</p>
                  <p className="text-xs leading-relaxed text-muted-foreground italic">
                    {examIntelligence.examinerPattern.variationDescription}
                  </p>
               </div>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
