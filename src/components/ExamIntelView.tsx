/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Award, 
  HelpCircle, 
  RefreshCw, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle as QuestionIcon, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  FileText, 
  Target, 
  Compass, 
  Info,
  Sliders,
  ChevronDown,
  ListFilter
} from "lucide-react";
import { ExamIntelReport, ExamQuestionIntel } from "../types";

interface ExamIntelViewProps {
  spaceId: string;
  spaceName: string;
  examIntelligence?: ExamIntelReport;
  onRefreshIntel: () => Promise<void>;
}

export default function ExamIntelView({ 
  spaceId, 
  spaceName, 
  examIntelligence, 
  onRefreshIntel 
}: ExamIntelViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "clusters" | "predictions">("dashboard");
  const [expandedPredictedIdx, setExpandedPredictedIdx] = useState<number | null>(0);

  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await onRefreshIntel();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract unique question clusters / groups
  const questionsList: ExamQuestionIntel[] = examIntelligence?.patternMining?.extractedQuestions || [];
  const groupsList = Array.from(new Set(questionsList.map(q => q.group)));

  // If no group selected, default to the first group
  const activeClusterGroup = selectedGroup || (groupsList.length > 0 ? groupsList[0] : null);
  const filteredQuestions = activeClusterGroup 
    ? questionsList.filter(q => q.group === activeClusterGroup)
    : questionsList;

  // Render Loading / Processing state
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-cosmic-bg text-gray-400 p-6" id="exam-intel-loading">
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
          <Award className="w-6 h-6 text-indigo-400 absolute animate-pulse animate-duration-1000" />
        </div>
        <h3 className="font-display font-medium text-white text-base">Running Past Exam Intelligence Engine...</h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm text-center font-mono leading-relaxed uppercase tracking-wider">
          Mining question patterns • Mapping topic frequencies • Extracting examiner structures • Simulating predictive solutions
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-6 flex flex-col font-sans" id="exam-intel-panel">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-5.3 h-5.3" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Past Exam Pattern & Intelligence</h2>
            <p className="text-xs text-gray-400 mt-0.5">Extract examiner phrasing conventions, frequency trends, and worked predictive solutions.</p>
          </div>
        </div>

        <button
          onClick={handleTriggerAnalysis}
          className="px-3.5 py-1.8 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-xs text-white font-medium transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-run Pattern Mining
        </button>
      </div>

      {!examIntelligence ? (
        /* EMPTY STATE / INITIALIZE */
        <div className="border border-dashed border-cosmic-border rounded-2xl bg-cosmic-card/20 py-20 text-center select-none flex-1 flex flex-col items-center justify-center p-6">
          <Award className="w-14 h-14 text-indigo-500/20 mb-4" />
          <h3 className="font-display font-semibold text-white text-base">Past Exam Intelligence Unrefined</h3>
          <p className="text-gray-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            Unleash the Tariro academic pipeline over your uploads to mine comparative patterns, compile topic probability ratings, study weak points, and compile predictions on upcoming papers.
          </p>
          <button
            onClick={handleTriggerAnalysis}
            className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-xs text-white font-semibold cursor-pointer shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Initialize Past Exam Analysis
          </button>
        </div>
      ) : (
        /* RICH INTELLIGENCE VIEW */
        <div className="space-y-6 flex-1 flex flex-col">
          
          {/* Internal Tab Controls */}
          <div className="flex border-b border-cosmic-border/50 gap-6 text-xs font-mono tracking-wider transition-all">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                activeTab === "dashboard" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              📊 FREQUENCY & STYLE INDEX
            </button>
            <button
              onClick={() => setActiveTab("clusters")}
              className={`pb-3 border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                activeTab === "clusters" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              🕸️ QUESTION CLUSTERING MAP
            </button>
            <button
              onClick={() => setActiveTab("predictions")}
              className={`pb-3 border-b-2 font-semibold transition-all px-1 cursor-pointer ${
                activeTab === "predictions" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              🔮 PREDICTED EXAM QUESTIONS
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="exam-dashboard-grid">
                
                {/* Topic Frequency Table (Left) */}
                <div className="lg:col-span-7 bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-display font-semibold text-white">
                    <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Topic Repeat Frequency & Probability</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-cosmic-border/60 text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-cosmic-bg/25">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Syllabus Topic Area</th>
                          <th className="py-2.5 px-3 text-right">Probability Rating</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-cosmic-border/30">
                        {examIntelligence.frequencyAnalysis?.repeatedTopics?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-cosmic-bg/30 transition-all">
                            <td className="py-3 px-3 font-mono font-bold text-gray-400">#{row.rank}</td>
                            <td className="py-3 px-3 font-medium text-white">{row.topic}</td>
                            <td className="py-3 px-3 text-right font-mono">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-16 h-1 w font-bold rounded-full bg-slate-800 overflow-hidden inline-block text-left">
                                  <span 
                                    className={`h-full inline-block rounded-full ${
                                      row.percentageOccurrence >= 75 ? "bg-indigo-500" :
                                      row.percentageOccurrence >= 50 ? "bg-emerald-500" : "bg-sky-500"
                                    }`}
                                    style={{ width: `${row.percentageOccurrence}%` }}
                                  />
                                </span>
                                <span className="text-white font-bold">{row.percentageOccurrence}%</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Prioritization Panel (Right) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Priority Categorization */}
                  <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-4">
                    <div className="text-sm font-display font-semibold text-white flex items-center gap-2">
                      <Target className="w-4.5 h-4.5 text-rose-400" />
                      <span>Syllabus Prioritization Engine</span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      {/* HIGH PRIORITY */}
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 space-y-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                          🚨 HIGH PRIORITY TARGETS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {examIntelligence.studyPrioritization?.highPriority?.map((item, i) => (
                            <span key={i} className="px-2 py-0.8 bg-red-500/10 text-red-300 rounded border border-red-500/20 text-[10.5px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* MEDIUM PRIORITY */}
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                          ⚡ MEDIUM PRIORITY SEGMENTS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {examIntelligence.studyPrioritization?.mediumPriority?.map((item, i) => (
                            <span key={i} className="px-2 py-0.8 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20 text-[10.5px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* LOW PRIORITY */}
                      <div className="p-3 bg-sky-500/5 rounded-xl border border-sky-500/20 space-y-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                          🧭 REGULAR WEIGHT SYLLABUS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {examIntelligence.studyPrioritization?.lowPriority?.map((item, i) => (
                            <span key={i} className="px-2 py-0.8 bg-sky-500/10 text-sky-300 rounded border border-sky-500/20 text-[10.5px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weak Area / Gaps Detection */}
                  <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-3">
                    <div className="text-sm font-display font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                      <span>Weak Area & Coverage Gaps Only</span>
                    </div>
                    {examIntelligence.weakAreaDetection?.gaps?.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No significant curriculum coverage gaps identified in active documents.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {examIntelligence.weakAreaDetection?.gaps?.map((gap, i) => (
                          <div key={i} className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-xs space-y-1">
                            <h4 className="font-semibold text-white">{gap.topic}</h4>
                            <p className="text-gray-400 leading-relaxed text-[11px]">{gap.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Examiner Style Distribution (Bottom-Wide) */}
                <div className="col-span-1 lg:col-span-12 bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-display font-semibold text-white">
                    <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Examiner Structuring Style distribution</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {examIntelligence.questionStyleAnalysis?.styles?.map((style, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-800/80 bg-cosmic-bg/40 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-xs">{style.styleName}</span>
                            <span className="font-mono text-xs font-bold text-indigo-400">{style.percentage}%</span>
                          </div>
                          <p className="text-gray-400 text-[11px] leading-relaxed">{style.description}</p>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${style.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Examiner phrasing patterns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs leading-relaxed">
                    <div className="p-4 rounded-xl border border-slate-800 bg-indigo-500/5 space-y-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 block">
                        🔑 RECURRING EXAM PHRASING
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {examIntelligence.examinerPattern?.recurringPhrases?.map((phrase, idx) => (
                          <li key={idx} className="truncate"><code className="bg-slate-900 border border-slate-800 px-1 rounded inline">{phrase}</code></li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800 bg-indigo-500/5 space-y-2">
                      <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 block">
                        ⚙️ REPEATED QUESTION STRUCTURES
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        {examIntelligence.examinerPattern?.repeatedStructures?.map((str, idx) => (
                          <li key={idx} className="truncate">{str}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed italic block pt-1 select-text">
                    <span className="font-semibold text-white">Variation analysis:</span> {examIntelligence.examinerPattern?.variationDescription}
                  </p>
                </div>

              </div>
            )}

            {activeTab === "clusters" && (
              <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-5" id="similarity-clustering">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Comparative Clustering Map</span>
                    </h3>
                    <p className="text-gray-400 text-xs">Examine similar exam target structures and conceptual overlaps parsed from different years.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500 uppercase flex items-center gap-1"><ListFilter className="w-3.5 h-3.5" /> Group Filter:</span>
                    <select
                      value={activeClusterGroup || ""}
                      onChange={(e) => setSelectedGroup(e.target.value || null)}
                      className="bg-cosmic-bg text-white border border-slate-800 p-1.5 text-xs rounded-lg outline-none font-medium cursor-pointer"
                    >
                      <option value="">Show All Overlaps</option>
                      {groupsList.map((g, i) => (
                        <option key={i} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Clusters List */}
                  <div className="md:col-span-1 space-y-2">
                    <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Interactive Cluster Nodes</span>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedGroup(null)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all leading-tight cursor-pointer ${
                          !selectedGroup ? "border-indigo-500 bg-indigo-500/10 text-white font-semibold" : "border-slate-850 hover:bg-slate-900/40 text-gray-400"
                        }`}
                      >
                        🏷️ All Clusters ({questionsList.length})
                      </button>
                      {groupsList.map((g, idx) => {
                        const count = questionsList.filter(q => q.group === g).length;
                        const isSel = selectedGroup === g;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedGroup(g)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between leading-tight cursor-pointer ${
                              isSel ? "border-indigo-500 bg-indigo-500/10 text-white font-semibold" : "border-slate-850 hover:bg-slate-900/40 text-gray-400"
                            }`}
                          >
                            <span className="truncate pr-1">🕸️ {g}</span>
                            <span className="text-[9px] font-mono bg-slate-800 text-gray-400 px-1 py-0.5 rounded shrink-0">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mined questions from papers matched */}
                  <div className="md:col-span-3 bg-cosmic-bg/40 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase block">Cluster Context Nodes Mined</span>
                    
                    {filteredQuestions.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-6 text-center">No questions in selection. Upload more exams to populate.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {filteredQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-slate-850 bg-cosmic-card/65 flex flex-col space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono leading-none">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{q.normalizedFormat}</span>
                              <span className="text-gray-500">Source: <span className="text-white font-semibold">{q.sourcePaper}</span></span>
                              {q.year && <span className="text-gray-500">({q.year})</span>}
                            </div>
                            <p className="text-xs hover:text-white text-gray-300 font-medium select-text">{q.question}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {activeTab === "predictions" && (
              <div className="space-y-5" id="deep-prediction">
                
                <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-4.5 text-xs flex gap-3 leading-relaxed border-l-4 border-l-indigo-500 select-text">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-gray-300 space-y-1">
                    <span className="font-semibold text-white">Prediction Confidence Index: High probability</span>
                    <p className="text-[11.5px]">
                      The engine synthesized the questions below by predicting structural changes from previous examiners, matching curriculum guidelines, and tracking implicit variables. Review both the core prompts and the model solutions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left list of predicted questions */}
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">Predicted Core Exams Target</span>
                    <div className="space-y-2">
                      {examIntelligence.examPrediction?.predictedQuestions?.map((pred, idx) => {
                        const isExpanded = expandedPredictedIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setExpandedPredictedIdx(idx)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                              isExpanded ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-slate-850 hover:bg-slate-900/30 text-gray-400"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="space-y-1 overflow-hidden">
                              <p className="text-xs font-semibold leading-tight truncate-3-lines">{pred.question}</p>
                              <div className="flex items-center gap-1.5 text-[9px] font-mono mt-2 leading-none uppercase">
                                <span className="text-indigo-400 font-bold border border-indigo-500/15 px-1 py-0.5 rounded">CONfIDENCE: {pred.predictionConfidence}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right expanded active item worked solutions & variations */}
                  <div className="lg:col-span-7 bg-cosmic-card border border-cosmic-border rounded-2xl p-5.5 space-y-5 shadow-xl">
                    {expandedPredictedIdx !== null && examIntelligence.examPrediction?.predictedQuestions?.[expandedPredictedIdx] ? (
                      (() => {
                        const activePrediction = examIntelligence.examPrediction.predictedQuestions[expandedPredictedIdx];
                        return (
                          <div className="space-y-4 select-text">
                            <div className="flex items-center justify-between border-b border-cosmic-border/50 pb-3">
                              <span className="text-[10px] font-mono border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded capitalize">
                                Predicted Target #{expandedPredictedIdx + 1}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono">Confidence: <span className="text-emerald-400 font-bold">{activePrediction.predictionConfidence}</span></span>
                            </div>

                            {/* Question prompt */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-gray-500 block uppercase">predicted question Prompt</span>
                              <p className="text-xs font-display font-semibold text-white leading-relaxed">
                                {activePrediction.question}
                              </p>
                            </div>

                            {/* Variations check */}
                            {activePrediction.variations?.length > 0 && (
                              <div className="p-3 bg-slate-900/35 rounded-xl border border-slate-850 space-y-2">
                                <span className="text-[10px] font-mono text-indigo-400 font-semibold block uppercase">📋 Alternate Examiners Variations</span>
                                <ul className="text-[11px] text-gray-300 list-disc list-inside space-y-1 pl-1">
                                  {activePrediction.variations.map((v, i) => (
                                    <li key={i}>{v}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Worked solutions scroll-pane */}
                            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                              <span className="font-mono text-[10.5px] font-bold text-emerald-400 flex items-center gap-1.5">
                                🏆 WORKED SOLUTION & MASTER MODEL ANSWER
                              </span>
                              <p className="text-gray-200 text-[11.5px] leading-relaxed whitespace-pre-line leading-relaxed italic pr-1">
                                {activePrediction.fullModelAnswer}
                              </p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-20 text-center text-gray-500 text-xs italic">Select a predicted target on the left to review worked solutions.</div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
