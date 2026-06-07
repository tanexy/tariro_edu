/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  CalendarCheck2, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles, 
  HardDrive,
  Maximize2,
  X,
  FileCode2,
  Calendar,
  ChevronRight,
  Award
} from "lucide-react";
import { LearningSpace, DocumentRecord, LearningResources } from "../types";

interface SpaceOverviewProps {
  space: LearningSpace;
  documents: DocumentRecord[];
  resources: LearningResources | null;
  onNavigate: (view: string) => void;
}

export default function SpaceOverview({
  space,
  documents,
  resources,
  onNavigate
}: SpaceOverviewProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "plan" | "files">("syllabus");
  const [inspectedDoc, setInspectedDoc] = useState<DocumentRecord | null>(null);

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + ["Bytes", "KB", "MB", "GB"][i];
  };

  const overviewText = resources?.overview || 
    `Welcome to the ${space.name} Learning Space. Your documents have been uploaded and processed. Expand the details to formulate customized goals.`;

  const studyPlanMarkdown = resources?.studyPlan || 
    "No study plan developed. Scan documents fully to formulate study plans.";

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-7 flex flex-col font-sans" id="space-overview-core">
      
      {/* Title & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border relative overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="space-y-1 relative z-10 select-text">
          <span className="text-[10px] font-mono text-cosmic-accent font-bold uppercase tracking-widest block">Active learning space</span>
          <h2 className="font-display font-black text-white text-xl leading-tight truncate">
             {space.name}
          </h2>
          <p className="text-xs text-gray-400">
             Folder directory path: <span className="text-gray-200 mt-1 font-mono text-[10.5px]">/{space.folderPath}</span>
          </p>
        </div>

        {/* Start study deck quick widget */}
        <div className="flex items-center gap-1.5 p-2 bg-cosmic-bg/60 border border-cosmic-border/60 rounded-xl max-w-fit shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wide">Ready for training</span>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex items-center gap-1.5 border-b border-cosmic-border pb-px text-xs font-semibold">
        <button
          onClick={() => setActiveTab("syllabus")}
          className={`py-2 px-4 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "syllabus" ? "border-cosmic-accent text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Syllabus Summary
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`py-2 px-4 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "plan" ? "border-cosmic-accent text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" /> 5-Day Study Plan
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`py-2 px-4 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "files" ? "border-cosmic-accent text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <FileText className="w-4 h-4" /> Core Uploaded Files ({documents.length})
        </button>
      </div>

      {/* Tab Context content */}
      <div className="flex-1 min-h-80 select-text">
        {activeTab === "syllabus" && (
          <div className="bg-cosmic-card border border-cosmic-border p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-display font-extrabold text-white text-sm">Theme Synthesis</h3>
            <p className="text-gray-300 text-xs leading-relaxed max-w-3xl whitespace-pre-line select-text">
              {overviewText}
            </p>
            
            <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-xl max-w-2xl text-[11px] text-gray-400 leading-relaxed flex items-start gap-2 select-text">
               <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
               <span>
                  <strong>Tip:</strong> This Overview was dynamically generated by scanning the documents in this learning space. Ready to active-recall this knowledge? Select <strong>Spaced Flashcards</strong> or review coordinates with <strong>Cognitive Mind Map</strong> inside the tools menu.
               </span>
            </div>
          </div>
        )}

        {activeTab === "plan" && (
          <div className="bg-cosmic-card border border-cosmic-border p-5 rounded-2xl shadow-xl space-y-5">
            <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-1.5">
               <Calendar className="w-4.5 h-4.5 text-cosmic-accent" /> Custom 5-Day Study Guide
            </h3>

            {/* Render formatted plan layout */}
            <div className="prose prose-invert prose-xs max-w-none text-gray-300 text-xs leading-relaxed space-y-3 whitespace-pre-wrap select-text font-sans">
              {studyPlanMarkdown}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display font-extrabold text-white text-sm">Repository files</h3>
              <span className="text-[10px] font-mono text-gray-500 uppercase">{documents.length} item(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setInspectedDoc(doc)}
                  className="bg-cosmic-card border border-cosmic-border hover:border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded bg-cosmic-bg/80 border border-cosmic-border flex items-center justify-center text-cosmic-accent group-hover:text-white transition-colors">
                      {doc.fileType.includes("pdf") ? <FileText className="w-4.5 h-4.5 text-indigo-400" /> : <FileCode2 className="w-4.5 h-4.5 text-emerald-400" />}
                    </div>
                    <div className="overflow-hidden leading-tight">
                      <h4 className="font-display text-xs font-semibold text-white group-hover:text-indigo-400 truncate max-w-xs">{doc.title}</h4>
                      <span className="text-[9.5px] font-mono text-gray-500 mt-0.5 block truncate">📁 {doc.relativePath}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 pl-2">
                    <span className="shrink-0">{formatBytes(doc.fileSize)}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visual study modules entry keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tutor Key */}
        <div 
          onClick={() => onNavigate("tutor")}
          className="bg-cosmic-card border border-cosmic-border hover:border-indigo-500/60 p-4.5 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5 shadow-indigo-600/1"
        >
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-4.5 h-4.5" />
            <span className="font-display font-extrabold text-white text-xs">AI Tutor chat</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">Answers query coordinates quoting sources.</p>
          <div className="flex items-center justify-end text-[10.5px] font-mono font-bold text-indigo-400 mt-3.5 pt-2 border-t border-cosmic-border/50">
            Begin lessons <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* cards key */}
        <div 
          onClick={() => onNavigate("flashcards")}
          className="bg-cosmic-card border border-cosmic-border hover:border-emerald-500/60 p-4.5 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5 shadow-emerald-600/1"
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <BrainCircuit className="w-4.5 h-4.5" />
            <span className="font-display font-extrabold text-white text-xs">Recall flashcards</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">Active flashcard practice with categorized difficulty levels.</p>
          <div className="flex items-center justify-end text-[10.5px] font-mono font-bold text-emerald-400 mt-3.5 pt-2 border-t border-cosmic-border/50">
            Show cards <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* quizzes key */}
        <div 
          onClick={() => onNavigate("quizzes")}
          className="bg-cosmic-card border border-cosmic-border hover:border-sky-500/60 p-4.5 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2 text-sky-400">
            <BookOpen className="w-4.5 h-4.5" />
            <span className="font-display font-extrabold text-white text-xs font-sans">interactive quiz</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">Test comprehension with scenario & MCQs questions.</p>
          <div className="flex items-center justify-end text-[10.5px] font-mono font-bold text-sky-400 mt-3.5 pt-2 border-t border-cosmic-border/50">
             Run assessment <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Past Exam Intelligence key */}
        <div 
          onClick={() => onNavigate("exam-intel")}
          className="bg-cosmic-card border border-cosmic-border hover:border-indigo-500/60 p-4.5 rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5 shadow-indigo-600/1"
        >
          <div className="flex items-center gap-2 text-indigo-400">
            <Award className="w-4.5 h-4.5" />
            <span className="font-display font-extrabold text-white text-xs font-sans">Exam Intelligence</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">Extract examiner style guides, topic repeat rates, and worked solutions.</p>
          <div className="flex items-center justify-end text-[10.5px] font-mono font-bold text-indigo-400 mt-3.5 pt-2 border-t border-cosmic-border/50">
             Open pattern index <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Document Inspector slide-out panel when a file is clicked */}
      {inspectedDoc && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-cosmic-card border-l border-cosmic-border flex flex-col shadow-2xl animate-fade-in-right font-sans">
          
          {/* Inspector Header */}
          <div className="p-4.5 border-b border-cosmic-border flex items-center justify-between bg-cosmic-bg/40">
            <div className="flex items-center gap-2.5 truncate">
              <FileText className="w-5 h-5 text-cosmic-accent shrink-0" />
              <div className="truncate leading-tight">
                <h3 className="font-display text-xs font-bold text-white truncate max-w-xs">{inspectedDoc.title}</h3>
                <span className="text-[9.5px] font-mono text-gray-500 block truncate">Reference: {inspectedDoc.relativePath}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setInspectedDoc(null)}
              className="p-1 px-1.5 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Inspected Content Body */}
          <div className="flex-1 p-5 overflow-y-auto bg-cosmic-bg/20 space-y-4 font-sans select-text">
            <div className="flex items-center gap-4 text-[10.5px] font-mono text-gray-500 pb-2 border-b border-cosmic-border/30">
              <span>MIME-Type: <span className="text-gray-300 font-bold">{inspectedDoc.fileType}</span></span>
              <span>•</span>
              <span>Parsed Size: <span className="text-gray-300 font-bold">{formatBytes(inspectedDoc.fileSize)}</span></span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Transcribed text content</span>
              <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap select-text font-mono bg-cosmic-card/40 p-4 rounded-xl border border-cosmic-border/50 max-h-160 overflow-y-auto">
                {inspectedDoc.content}
              </p>
            </div>
          </div>

          {/* Inspector Footer */}
          <div className="p-4 border-t border-cosmic-border bg-cosmic-bg/60 flex items-center justify-end text-xs font-semibold">
            <button
              onClick={() => setInspectedDoc(null)}
              className="px-4 py-2 border border-cosmic-border text-gray-400 hover:text-white bg-slate-800/40 rounded-lg cursor-pointer"
            >
               Close Inspector
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
