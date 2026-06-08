/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Plus, BrainCircuit, Activity, Layers, FolderIcon, Sparkles } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import UploadModal from "./features/upload/UploadModal";
import DashboardOverview from "./features/dashboard/DashboardOverview";
import SpaceOverview from "./features/learning-spaces/SpaceOverview";
import TutorView from "./features/tutor/TutorView";
import FlashcardView from "./features/flashcards/FlashcardView";
import AssessmentView from "./features/assessments/AssessmentView";
import VisualMapView from "./features/learning-spaces/VisualMapView";
import BillingSettings from "./features/billing/BillingSettings";
import ExamIntelView from "./features/exam-intel/ExamIntelView";

import { 
  UserProfile, 
  Workspace, 
  LearningSpace, 
  DocumentRecord, 
  LearningResources, 
  TutorChat, 
  RecentActivity, 
  UserTier, 
  DashboardStats 
} from "./types/index";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [learningSpaces, setLearningSpaces] = useState<LearningSpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [activeView, setActiveView] = useState<string>("dashboard"); // dashboard, overview, tutor, flashcards, quizzes, mindmap, billing

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [resources, setResources] = useState<LearningResources | null>(null);
  const [chat, setChat] = useState<TutorChat | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  // 1. Fetch User profile & workspaces initially
  useEffect(() => {
    async function loadInitial() {
      try {
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();
        setUser(userData);

        const workRes = await fetch("/api/workspaces");
        const workData = await workRes.json();
        setWorkspaces(workData);
        if (workData.length > 0) {
          setActiveWorkspaceId(workData[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial Tariro SaaS profiles:", err);
      } finally {
        setIsPageReady(true);
      }
    }
    loadInitial();
  }, []);

  // 2. Fetch learning spaces when selected workspace scopes change
  useEffect(() => {
    if (!activeWorkspaceId) return;

    async function loadSpaces() {
      try {
        const spacesRes = await fetch(`/api/learning-spaces?workspaceId=${activeWorkspaceId}`);
        const spacesData = await spacesRes.json();
        setLearningSpaces(spacesData);
        
        // Reset subselection if space is not in the active workspace
        const stillExists = spacesData.find((s: any) => s.id === activeSpaceId);
        if (!stillExists) {
          setActiveSpaceId("");
        }

        // Fetch recent activities
        const actRes = await fetch("/api/activities");
        const actData = await actRes.json();
        setActivities(actData);
      } catch (err) {
        console.error("Failed to fetch custom workspace learning decks:", err);
      }
    }
    loadSpaces();
  }, [activeWorkspaceId, activeSpaceId, isUploadOpen, activeView]);

  // 3. Fetch granular document logs, generated guides & chats when activeSpaceId switches
  useEffect(() => {
    if (!activeSpaceId) {
      setDocuments([]);
      setResources(null);
      setChat(null);
      return;
    }

    async function loadSpaceSubordinates() {
      try {
        // Load documents list
        const docRes = await fetch(`/api/learning-spaces/${activeSpaceId}/documents`);
        const docData = await docRes.json();
        setDocuments(docData);

        // Load generated guidelines
        const resRes = await fetch(`/api/learning-spaces/${activeSpaceId}/resources`);
        if (resRes.ok) {
          const resData = await resRes.json();
          setResources(resData);
        } else {
          setResources(null);
        }

        // Load AI chat history logs
        const chatRes = await fetch(`/api/learning-spaces/${activeSpaceId}/tutor`);
        const chatData = await chatRes.json();
        setChat(chatData);
      } catch (err) {
        console.error("Failed to sync subcomponents for active Learning Space:", err);
      }
    }
    loadSpaceSubordinates();
  }, [activeSpaceId]);

  // 4. Periodically poll for learning resources if they haven't compiled yet (null)
  useEffect(() => {
    if (!activeSpaceId || resources) return;

    const interval = setInterval(async () => {
      try {
        const resRes = await fetch(`/api/learning-spaces/${activeSpaceId}/resources`);
        if (resRes.ok) {
          const resData = await resRes.json();
          setResources(resData);
        }
      } catch (err) {
        // Silent catch for background attempts
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSpaceId, resources]);

  // Handle creating a workspace
  const handleCreateWorkspace = async (name: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newWorkspace = await res.json();
        setWorkspaces(prev => [...prev, newWorkspace]);
        setActiveWorkspaceId(newWorkspace.id);
        setActiveSpaceId("");
        setActiveView("dashboard");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upgrading Tier simulation
  const handleUpgradeTier = async (tier: UserTier) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier })
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Send prompt to AI Tutor
  const handleSendTutorMessage = async (message: string) => {
    if (!activeSpaceId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/learning-spaces/${activeSpaceId}/tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const resultData = await res.json();
        setChat(resultData.chat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Tutor Chat history
  const handleClearTutorChat = async () => {
    if (!activeSpaceId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/learning-spaces/${activeSpaceId}/tutor/clear`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setChat(data.chat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Folder transformation successful hook
  const handleUploadSuccess = async (spaceId: string) => {
    try {
      // Re-fetch workspaces to detect if any workspace was dynamically created
      const workRes = await fetch("/api/workspaces");
      const workData = await workRes.json();
      setWorkspaces(workData);
      
      // Select the active workspace corresponding to this new learning space
      if (workData.length > 0) {
        const spaceRes = await fetch(`/api/learning-spaces/${spaceId}`);
        if (spaceRes.ok) {
          const spaceData = await spaceRes.json();
          if (spaceData && spaceData.workspaceId) {
            setActiveWorkspaceId(spaceData.workspaceId);
          } else {
            setActiveWorkspaceId(workData[0].id);
          }
        } else {
          setActiveWorkspaceId(workData[0].id);
        }
      }
    } catch (e) {
      console.error("Error refreshing workspaces after upload:", e);
    }
    setIsUploadOpen(false);
    setActiveSpaceId(spaceId);
    setActiveView("overview");
  };

  // Cross-module study trigger (e.g. click mind map link and question tutor)
  const handleAskTutorText = (text: string) => {
    setActiveView("tutor");
    // send immediately
    handleSendTutorMessage(text);
  };

  // Calculate cumulative stats
  const dashboardStats: DashboardStats = {
    learningSpacesCount: learningSpaces.length,
    documentsCount: learningSpaces.reduce((sum, s) => sum + s.documentCount, 0),
    quizzesTaken: activities.filter(a => a.type === "quiz").length,
    studyTimeFormatted: "1h 45m",
    tier: user?.tier || UserTier.FREE
  };

  if (!isPageReady || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-muted-foreground font-sans" id="loading-fallback">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <BrainCircuit className="w-6 h-6 text-primary absolute animate-pulse" />
        </div>
        <p className="text-[10px] font-mono tracking-[0.2em] animate-pulse uppercase">Initializing Tariro Core...</p>
      </div>
    );
  }

  // Active space object helper
  const selectedSpace = learningSpaces.find(s => s.id === activeSpaceId);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans select-none" id="tariro-app-root">
      
      {/* Sidebar Controller */}
      <Sidebar
        user={user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        learningSpaces={learningSpaces}
        activeSpaceId={activeSpaceId}
        setActiveSpaceId={setActiveSpaceId}
        activeView={activeView}
        setActiveView={setActiveView}
        onCreateWorkspace={handleCreateWorkspace}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Arena with fluid tab fades */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col h-screen relative bg-background" id="main-scroll-pane">
        <TopBar />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + "_" + activeSpaceId}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="flex-1 min-h-0"
          >
            {activeView === "dashboard" && (
              <DashboardOverview
                user={user}
                learningSpaces={learningSpaces}
                activities={activities}
                stats={dashboardStats}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSelectSpace={(spaceId) => {
                  setActiveSpaceId(spaceId);
                  setActiveView("overview");
                }}
              />
            )}

            {activeView === "billing" && (
              <BillingSettings
                user={user}
                onUpgradeTier={handleUpgradeTier}
                isLoading={isLoading}
              />
            )}

            {/* Space Specific Focused Views */}
            {activeSpaceId && selectedSpace && (
              <>
                {activeView === "overview" && (
                  <SpaceOverview
                    space={selectedSpace}
                    documents={documents}
                    resources={resources}
                    onNavigate={(v) => setActiveView(v)}
                  />
                )}

                {activeView === "tutor" && chat && (
                  <TutorView
                    spaceId={activeSpaceId}
                    spaceName={selectedSpace.name}
                    chat={chat}
                    onSendMessage={handleSendTutorMessage}
                    onClearChat={handleClearTutorChat}
                    isLoading={isLoading}
                  />
                )}

                {activeView === "tutor" && !chat && (
                  <div className="flex flex-col items-center justify-center p-8 h-full bg-cosmic-bg text-gray-400 select-none" id="tutor-loading-fallback">
                    <div className="relative flex items-center justify-center mb-5">
                      <div className="w-14 h-14 rounded-full border-4 border-slate-850 border-t-indigo-500 animate-spin" />
                      <Sparkles className="w-5 h-5 text-indigo-400 absolute animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-white text-sm">Aligning AI Tutor Core...</h3>
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider mt-2 bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 rounded-full uppercase">INITIALIZING RAG PATHS</span>
                  </div>
                )}

                {["flashcards", "quizzes", "mindmap", "exam-intel"].includes(activeView) && !resources && (
                  <div className="flex flex-col items-center justify-center p-8 h-full bg-cosmic-bg text-gray-400 select-none animate-fade-in" id="resources-generating-fallback">
                    <div className="relative flex items-center justify-center mb-5">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                      <BrainCircuit className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
                    </div>
                    <h3 className="font-display font-extrabold text-white text-sm text-center">Tariro is generating your custom learning deck...</h3>
                    <p className="text-[11px] text-gray-400 mt-2 max-w-sm text-center leading-relaxed font-sans">
                      We are currently parsing uploaded documents inside <strong>{selectedSpace.name}</strong> to synthesize active-recall flashcards, dynamic assessments, interactive cognitive mind maps, and predicted examiner patterns.
                    </p>
                    <p className="text-[10px] text-gray-500 mt-4 font-mono tracking-wide bg-slate-800/60 border border-cosmic-border/60 p-2 px-3 rounded-lg flex items-center gap-1.5 uppercase">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block" />
                      Analyzing knowledge core • 10-15 seconds
                    </p>
                  </div>
                )}

                {activeView === "flashcards" && resources && (
                  <FlashcardView
                    spaceName={selectedSpace.name}
                    flashcards={resources.flashcards}
                  />
                )}

                {activeView === "quizzes" && resources && (
                  <AssessmentView
                    spaceName={selectedSpace.name}
                    quizzes={resources.quizzes}
                  />
                )}

                {activeView === "mindmap" && resources && (
                  <VisualMapView
                    spaceName={selectedSpace.name}
                    mindMap={resources.mindMap}
                    onAskTutorText={handleAskTutorText}
                  />
                )}

                {activeView === "exam-intel" && resources && (
                  <ExamIntelView
                    spaceId={activeSpaceId}
                    spaceName={selectedSpace.name}
                    examIntelligence={resources.examIntelligence}
                    onRefreshIntel={async () => {
                      try {
                        const res = await fetch(`/api/learning-spaces/${activeSpaceId}/analyze-exams`, {
                          method: "POST"
                        });
                        if (res.ok) {
                          const result = await res.json();
                          setResources(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              examIntelligence: result.examIntelligence
                            };
                          });
                        }
                      } catch (err) {
                        console.error("Failed to rerun analysis:", err);
                      }
                    }}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Persistent Folder Upload Modal Trigger */}
      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          workspaceId={activeWorkspaceId}
        />
      )}

    </div>
  );
}
