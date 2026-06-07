/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Layers, 
  FolderPlus, 
  Plus, 
  BrainCircuit, 
  BookOpen, 
  Sparkles, 
  Activity, 
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  HardDrive,
  Award
} from "lucide-react";
import { Workspace, LearningSpace, UserProfile, UserTier } from "../types";

interface SidebarProps {
  user: UserProfile;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  learningSpaces: LearningSpace[];
  activeSpaceId: string;
  setActiveSpaceId: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onCreateWorkspace: (name: string) => void;
  onOpenUpload: () => void;
}

export default function Sidebar({
  user,
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  learningSpaces,
  activeSpaceId,
  setActiveSpaceId,
  activeView,
  setActiveView,
  onCreateWorkspace,
  onOpenUpload
}: SidebarProps) {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setShowWorkspaceModal(false);
    }
  };

  const selectedWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Format storage size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const storagePercentage = Math.min(100, (user.storageUsed / user.storageLimit) * 100);

  return (
    <aside className="w-68 bg-[#0D0D0E] border-r border-cosmic-border flex flex-col h-screen shrink-0 text-gray-300 font-sans" id="sidebar-main">
      {/* Brand Header */}
      <div className="p-5 border-b border-cosmic-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 underline decoration-2 shrink-0">
            <BrainCircuit className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white leading-tight">Tariro</span>
            <span className="text-[10px] block font-mono text-cosmic-accent leading-none">KNOWLEDGE CORE</span>
          </div>
        </div>
        <div className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
          v1.0
        </div>
      </div>

      {/* User Context */}
      <div className="p-4 border-b border-cosmic-border/60 bg-cosmic-bg/40 flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-cosmic-border flex items-center justify-center text-white text-xs font-semibold">
            CT
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-cosmic-card" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-semibold text-white truncate">{user.name}</div>
          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${
              user.tier === UserTier.ENTERPRISE ? "bg-amber-500" :
              user.tier === UserTier.PRO ? "bg-indigo-400" : "bg-slate-400"
            }`} />
            {user.tier} TIER
          </span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-4 border-b border-cosmic-border/50">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-gray-500 mb-2 uppercase">
          <span>Active Workspace</span>
          <button 
            onClick={() => setShowWorkspaceModal(true)}
            className="hover:text-white transition-colors cursor-pointer"
            title="Create Workspace"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <select
          value={activeWorkspaceId}
          onChange={(e) => {
            setActiveWorkspaceId(e.target.value);
            // reset space selection when changing workspaces
            setActiveSpaceId("");
            setActiveView("dashboard");
          }}
          className="w-full bg-cosmic-bg/80 border border-cosmic-border text-white text-xs rounded-md p-2.5 outline-none focus:border-cosmic-accent transition-all cursor-pointer font-medium"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              💼 {ws.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Navigation Core */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all font-medium hover:bg-cosmic-bg/60 cursor-pointer ${
              activeView === "dashboard" ? "bg-cosmic-bg border-l-2 border-cosmic-accent text-white" : "text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-gray-400" />
              <span>SaaS Dashboard</span>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>
          
          <button
            onClick={() => setActiveView("billing")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all font-medium hover:bg-cosmic-bg/60 cursor-pointer ${
              activeView === "billing" ? "bg-cosmic-bg border-l-2 border-cosmic-accent text-white" : "text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>Limits & Subscriptions</span>
            </div>
            <span className="text-[9px] font-mono bg-cosmic-accent/20 text-cosmic-accent px-1.5 py-0.5 rounded">UPGRADE</span>
          </button>
        </div>

        {/* Dynamic Learning Spaces list */}
        <div>
          <div className="flex items-center justify-between px-3 text-[11px] font-mono tracking-wider text-gray-500 mb-2 uppercase">
            <span>Learning Spaces</span>
            <button 
              onClick={onOpenUpload}
              className="text-cosmic-accent hover:text-white transition-colors flex items-center gap-0.5 text-[10px] font-mono cursor-pointer"
            >
              <Plus className="w-3 h-3" /> UPLOAD
            </button>
          </div>

          {learningSpaces.length === 0 ? (
            <div className="px-3 py-6 rounded-lg border border-dashed border-cosmic-border bg-cosmic-bg/20 text-center text-[11px] text-gray-500">
              No spaces generated yet. Upload a folder container to begin.
            </div>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {learningSpaces.map((space) => {
                const isActive = activeSpaceId === space.id;
                return (
                  <button
                    key={space.id}
                    onClick={() => {
                      setActiveSpaceId(space.id);
                      if (activeView === "dashboard" || activeView === "billing") {
                        setActiveView("overview"); // focus active space
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all text-left cursor-pointer ${
                      isActive 
                        ? "bg-cosmic-accent/15 border-l-2 border-cosmic-accent text-white font-semibold" 
                        : "text-gray-400 hover:bg-cosmic-bg/40 leading-tight"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cosmic-accent" : "text-gray-500"}`} />
                      <span className="truncate">{space.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 shrink-0 bg-cosmic-bg px-1 rounded-sm">
                      {space.documentCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Space Learning Tools Menu */}
        {activeSpaceId && (
          <div className="pt-2 border-t border-cosmic-border/30">
            <div className="px-3 text-[10px] font-mono tracking-wider text-cosmic-accent/80 mb-2.5 uppercase">
              Active Space Tools
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("overview")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  activeView === "overview" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>Space Overview</span>
              </button>

              <button
                onClick={() => setActiveView("tutor")}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  activeView === "tutor" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Learning Tutor</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              </button>

              <button
                onClick={() => setActiveView("flashcards")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  activeView === "flashcards" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spaced Flashcards</span>
              </button>

              <button
                onClick={() => setActiveView("quizzes")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  activeView === "quizzes" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Assessments</span>
              </button>

              <button
                onClick={() => setActiveView("mindmap")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                   activeView === "mindmap" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Cognitive Mind Map</span>
              </button>

              <button
                onClick={() => setActiveView("exam-intel")}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                  activeView === "exam-intel" ? "bg-cosmic-accent/10 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Exam Intelligence</span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-500/15 text-indigo-400 px-1 hover:text-white rounded">AUTO</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System Limits Meter */}
      <div className="p-4 border-t border-cosmic-border bg-cosmic-bg/60">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5">
          <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-cosmic-accent" /> SaaS Storage</span>
          <span>{storagePercentage.toFixed(0)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-cosmic-accent transition-all duration-300"
            style={{ width: `${storagePercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>{formatBytes(user.storageUsed)} used</span>
          <span>{formatBytes(user.storageLimit)} limit</span>
        </div>
      </div>

      {/* Workspace Creation Modal Dialog */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-cosmic-card border border-cosmic-border w-full max-w-sm rounded-xl p-5 shadow-2xl">
            <h3 className="font-display font-semibold text-white text-base mb-3 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-cosmic-accent" /> Create New Workspace
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Workspaces isolate folders, learning graphs, quiz databases, and AI tutor models under specific contexts.
            </p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono tracking-wider text-gray-400 uppercase mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Research, Semester 2"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-cosmic-bg border border-cosmic-border focus:border-cosmic-accent outline-none rounded-md px-3 py-2 text-xs text-white"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 text-xs font-medium pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-3.5 py-1.5 rounded bg-transparent border border-cosmic-border hover:bg-slate-800 text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-cosmic-accent hover:opacity-95 text-white cursor-pointer shadow-lg shadow-cosmic-accent/20"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
