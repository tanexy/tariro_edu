/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Layers,
  Plus,
  BrainCircuit,
  BookOpen,
  Sparkles,
  Activity,
  CreditCard,
  ChevronRight,
  HardDrive,
  Award,
  Settings,
  ChevronDown,
  Search,
  PlusCircle,
  LayoutDashboard
} from "lucide-react";
import { Workspace, LearningSpace, UserProfile, UserTier } from "../../types/index";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";

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

  const storagePercentage = (user.storageUsed / user.storageLimit) * 100;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border h-screen shrink-0 group transition-all duration-300">
      {/* Brand & Workspace Selector */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Tariro</span>
          <Badge variant="outline" className="ml-auto font-mono text-[10px] py-0 px-1.5 opacity-50">{user.tier}</Badge>
        </div>

        <div className="relative">
          <select
            value={activeWorkspaceId}
            onChange={(e) => {
              setActiveWorkspaceId(e.target.value);
              setActiveSpaceId("");
              setActiveView("dashboard");
            }}
            className="w-full appearance-none bg-secondary/50 hover:bg-secondary/80 border border-border text-sm font-medium rounded-lg px-3 py-2 pr-8 outline-none focus:ring-1 focus:ring-ring transition-colors cursor-pointer"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-background">
                {ws.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <ChevronDown className="h-4 w-4" />
          </div>
          <button
            onClick={() => setShowWorkspaceModal(true)}
            className="absolute -right-1 -top-1 p-0.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-110 transition-transform cursor-pointer"
            title="Create Workspace"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <div className="px-3 mb-2">
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Platform</p>
          </div>
          <div className="space-y-1">
            <NavItem
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              isActive={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
            />
            <NavItem
              icon={<Activity className="h-4 w-4" />}
              label="Analytics"
              isActive={activeView === "analytics"}
              onClick={() => setActiveView("analytics")}
            />
            <NavItem
              icon={<CreditCard className="h-4 w-4" />}
              label="Subscription"
              isActive={activeView === "billing"}
              onClick={() => setActiveView("billing")}
            />
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Learning Spaces</p>
            <button
              onClick={onOpenUpload}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Add New Space"
            >
              <PlusCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {learningSpaces.length === 0 ? (
              <div className="px-3 py-4 text-center rounded-lg border border-dashed border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground">No spaces yet</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-[10px]" onClick={onOpenUpload}>
                  Upload Content
                </Button>
              </div>
            ) : (
              learningSpaces.map((space) => (
                <NavItem
                  key={space.id}
                  icon={<BookOpen className="h-4 w-4" />}
                  label={space.name}
                  isActive={activeSpaceId === space.id}
                  onClick={() => {
                    setActiveSpaceId(space.id);
                    if (!["overview", "tutor", "flashcards", "quizzes", "mindmap", "exam-intel"].includes(activeView)) {
                      setActiveView("overview");
                    }
                  }}
                  badge={space.documentCount.toString()}
                />
              ))
            )}
          </div>
        </div>

        {activeSpaceId && (
          <div>
            <div className="px-3 mb-2">
              <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Active Space</p>
            </div>
            <div className="space-y-1">
              <NavItem
                icon={<Layers className="h-4 w-4" />}
                label="Overview"
                isActive={activeView === "overview"}
                onClick={() => setActiveView("overview")}
              />
              <NavItem
                icon={<Sparkles className="h-4 w-4 text-tariro-indigo" />}
                label="AI Tutor"
                isActive={activeView === "tutor"}
                onClick={() => setActiveView("tutor")}
              />
              <NavItem
                icon={<BrainCircuit className="h-4 w-4 text-emerald-500" />}
                label="Flashcards"
                isActive={activeView === "flashcards"}
                onClick={() => setActiveView("flashcards")}
              />
              <NavItem
                icon={<BookOpen className="h-4 w-4 text-sky-500" />}
                label="Assessments"
                isActive={activeView === "quizzes"}
                onClick={() => setActiveView("quizzes")}
              />
              <NavItem
                icon={<Award className="h-4 w-4 text-amber-500" />}
                label="Exam Intel"
                isActive={activeView === "exam-intel"}
                onClick={() => setActiveView("exam-intel")}
              />
            </div>
          </div>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> Storage</span>
            <span>{storagePercentage.toFixed(0)}%</span>
          </div>
          <Progress value={storagePercentage} className="h-1" />
          <p className="text-[9px] font-mono text-muted-foreground text-right italic">
            {formatBytes(user.storageUsed)} of {formatBytes(user.storageLimit)}
          </p>
        </div>

        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-tariro-indigo flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-background ring-offset-1 group-hover:ring-offset-2 transition-all">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-none mb-1">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate leading-none uppercase tracking-tighter">{user.tier} Plan</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
        </div>
      </div>

      <Dialog
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        title="Create New Workspace"
        description="Organize your learning materials into high-level contexts."
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace Name</label>
            <Input
              required
              placeholder="e.g. Legal Research, Semester 2"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowWorkspaceModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Workspace
            </Button>
          </div>
        </form>
      </Dialog>
    </aside>
  );
}

interface NavItemProps {
  key?: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  badge?: string;
}

function NavItem({ icon, label, isActive, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
        isActive
          ? "bg-secondary text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
      }`}
    >
      <span className={`${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} transition-colors shrink-0`}>
        {icon}
      </span>
      <span className="truncate flex-1 text-left">{label}</span>
      {badge && (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
          isActive ? "bg-background text-foreground" : "bg-secondary text-muted-foreground"
        }`}>
          {badge}
        </span>
      )}
      {isActive && (
        <div className="h-1 w-1 rounded-full bg-primary" />
      )}
    </button>
  );
}
