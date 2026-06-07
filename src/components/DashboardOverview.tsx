/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  FolderIcon, 
  FileText, 
  Users, 
  Hourglass, 
  Sparkles, 
  Activity, 
  BookOpen, 
  Plus,
  Compass,
  ArrowRight,
  HardDrive
} from "lucide-react";
import { LearningSpace, RecentActivity, DashboardStats, UserProfile } from "../types";

interface DashboardOverviewProps {
  user: UserProfile;
  learningSpaces: LearningSpace[];
  activities: RecentActivity[];
  stats: DashboardStats;
  onOpenUpload: () => void;
  onSelectSpace: (spaceId: string) => void;
}

export default function DashboardOverview({
  user,
  learningSpaces,
  activities,
  stats,
  onOpenUpload,
  onSelectSpace
}: DashboardOverviewProps) {
  
  // Format dates
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-7 flex flex-col font-sans" id="dashboard-landing-hub">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-cosmic-card to-cosmic-bg border border-cosmic-border rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 relative z-10 select-text">
          <span className="text-[10px] font-mono text-cosmic-accent font-bold uppercase tracking-widest block">AI Workspace Hub</span>
          <h1 className="font-display font-black text-white text-xl md:text-2xl leading-tight">
             Transform Folders Into Structured Knowledge
          </h1>
          <p className="text-xs text-gray-400 max-w-xl">
            Tariro recursively scans complex structures, extracting formatted text with Gemini AI to auto-generate customized study plans, mind maps, quizzes, and a dedicated personal RAG tutor.
          </p>
        </div>
        
        <button
          onClick={onOpenUpload}
          className="shrink-0 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cosmic-accent text-xs text-white font-bold tracking-wide shadow-lg shadow-cosmic-accent/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" /> Create Learning Space
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric: Learning Spaces */}
        <div className="bg-cosmic-card border border-cosmic-border p-4.5 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-mono text-[10px] tracking-wider uppercase">Learning Spaces</span>
            <FolderIcon className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display leading-none">{stats.learningSpacesCount}</div>
            <span className="text-[10px] font-mono text-gray-500 mt-1 block">ACTIVE IN WORKSPACE</span>
          </div>
        </div>

        {/* Metric: Documents */}
        <div className="bg-cosmic-card border border-cosmic-border p-4.5 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-mono text-[10px] tracking-wider uppercase">Analyzed Files</span>
            <FileText className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display leading-none">{stats.documentsCount}</div>
            <span className="text-[10px] font-mono text-gray-500 mt-1 block">PROCESSED BY GEMINI</span>
          </div>
        </div>

        {/* Metric: Quizzes Taken */}
        <div className="bg-cosmic-card border border-cosmic-border p-4.5 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-mono text-[10px] tracking-wider uppercase">Assessments run</span>
            <BookOpen className="w-4.5 h-4.5 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-display leading-none">{stats.quizzesTaken}</div>
            <span className="text-[10px] font-mono text-gray-500 mt-1 block">CONCLUDED CHECKS</span>
          </div>
        </div>

        {/* Metric: Storage Used */}
        <div className="bg-cosmic-card border border-cosmic-border p-4.5 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-mono text-[10px] tracking-wider uppercase">Active user level</span>
            <HardDrive className="w-4.5 h-4.5 text-rose-400" />
          </div>
          <div>
            <div className="text-lg font-black text-white font-display leading-none">{stats.tier} SaaS</div>
            <span className="text-[10px] font-mono text-gray-500 mt-1 block truncate">
              {Math.round((user.storageUsed / user.storageLimit) * 100)}% QUOTA CONSUME
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Spaces List on left, activities & recommendations on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Learning Spaces Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-display font-extrabold text-white text-sm">Your Active Learning Spaces</h3>
            <span className="text-[10px] font-mono text-gray-500 uppercase">{learningSpaces.length} Space(s)</span>
          </div>

          {learningSpaces.length === 0 ? (
            <div className="border border-dashed border-cosmic-border rounded-xl bg-cosmic-card/25 py-14 text-center p-6 flex flex-col items-center justify-center">
              <FolderIcon className="w-11 h-11 text-gray-600 mb-2.5 animate-pulse" />
              <h4 className="font-display font-semibold text-white text-xs">Your workspace is vacant</h4>
              <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                Click "Create Learning Space" above to upload a directory folder of notes, documentation, courses or reference PDFs to start.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningSpaces.map((space) => (
                <div 
                  key={space.id}
                  onClick={() => onSelectSpace(space.id)}
                  className="bg-cosmic-card border border-cosmic-border hover:border-cosmic-accent/70 rounded-xl p-4.5 flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-cosmic-accent/5 group transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="text-[10px] font-mono text-cosmic-accent font-semibold flex items-center gap-1">
                        <FolderIcon className="w-3.5 h-3.5" /> Learning Space
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{formatDate(space.createdAt)}</span>
                    </div>

                    <h4 className="font-display font-bold text-white text-sm group-hover:text-indigo-400 leading-snug truncate">
                      {space.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-4.5 border-t border-cosmic-border/50 mt-4 text-[11px] font-mono text-gray-400">
                    <span>Parsed: <span className="text-white font-bold">{space.documentCount} document(s)</span></span>
                    <span className="text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-bold">
                      Open Space <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recommendations & Activities Stream */}
        <div className="space-y-6">
          
          {/* AI Advisor Card */}
          <div className="bg-cosmic-card border border-cosmic-border rounded-xl p-4.5 space-y-3 shadow-md relative overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Tariro AI Advisor
            </div>
            
            {learningSpaces.length > 0 ? (
              <div className="space-y-2 text-xs">
                <p className="text-gray-200 font-display font-semibold select-text">
                  Focus on {learningSpaces[0].name}
                </p>
                <p className="text-gray-400 leading-relaxed text-[11px] select-text">
                   Your learning space has {learningSpaces[0].documentCount} processed document(s). Open the **AI Tutor** and prompt, <span className="text-indigo-400 italic font-mono bg-cosmic-bg/40 px-1 py-0.5 rounded border border-cosmic-border/40">"Summarize the main concepts"</span> for an instant review.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-[11px] italic leading-relaxed">
                 Waiting for you to generate a learning space to formulate micro-study guidelines.
              </p>
            )}
          </div>

          {/* Activities log */}
          <div className="space-y-3">
            <h3 className="font-display font-extrabold text-white text-xs px-1 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-gray-500" /> Recent Activities
            </h3>

            {activities.length === 0 ? (
              <p className="text-gray-500 text-[11px] italic px-1">No actions logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="bg-cosmic-card/50 border border-cosmic-border/60 p-3 rounded-lg flex items-start gap-2 text-xs">
                    <div className="w-7 h-7 rounded bg-cosmic-bg/80 border border-cosmic-border flex items-center justify-center text-gray-500 mt-0.5 max-w-fit shrink-0 font-mono text-[10px]">
                      {act.type === "upload" && "📦"}
                      {act.type === "quiz" && "📝"}
                      {act.type === "chat" && "💬"}
                      {act.type === "workspace" && "💼"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-200 text-[11.5px] leading-tight">{act.title}</div>
                      <p className="text-[10.5px] text-gray-400 mt-0.5 leading-tight select-text">{act.description}</p>
                      <span className="text-[9px] font-mono text-gray-500 mt-1 block">
                        {new Date(act.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
