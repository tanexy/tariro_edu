/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  FileText,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Target,
  BrainCircuit,
  Activity,
  Award,
  ChevronRight,
  Layout,
  ExternalLink,
  MessageCircle,
  FileSearch,
  Zap
} from "lucide-react";
import { LearningSpace, DocumentRecord, LearningResources } from "../../types/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

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

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto pb-20">
      {/* Space Hero Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest uppercase">Learning Space</Badge>
          <ChevronRight className="h-4 w-4" />
          <span className="text-xs font-medium">{formatDate(space.createdAt)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-display">{space.name}</h1>
            <p className="text-caption text-lg max-w-2xl">
              Knowledge base extracted from <span className="text-foreground font-semibold">{space.documentCount} documentation assets</span>.
              Generated {resources ? "complete study suite" : "initializing intelligence..."}.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button onClick={() => onNavigate("tutor")} className="gap-2 shadow-lg shadow-tariro-indigo/20">
               <MessageCircle className="h-4 w-4" /> Consult AI Tutor
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Study Overview & Resources */}
        <div className="lg:col-span-2 space-y-10">

          {/* Overview Content */}
          <section className="space-y-4">
            <h3 className="text-h3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-tariro-indigo" /> Executive Summary
            </h3>
            <Card className="bg-secondary/30 border-border/50">
              <CardContent className="pt-6">
                {resources ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-body leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {resources.overview}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Quick Actions Grid */}
          <section className="space-y-4">
            <h3 className="text-h3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Learning Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ToolCard
                icon={<BrainCircuit className="h-5 w-5 text-emerald-500" />}
                title="Flashcards"
                description="Active recall session with 30+ generated cards."
                onClick={() => onNavigate("flashcards")}
                badge={resources?.flashcards?.length?.toString()}
              />
              <ToolCard
                icon={<Target className="h-5 w-5 text-sky-500" />}
                title="Assessments"
                description="Test your depth with scenario-based quizzes."
                onClick={() => onNavigate("quizzes")}
                badge={resources?.quizzes?.length?.toString()}
              />
              <ToolCard
                icon={<Award className="h-5 w-5 text-tariro-purple" />}
                title="Exam Intel"
                description="Predictive patterns and examiner insights."
                onClick={() => onNavigate("exam-intel")}
              />
            </div>
          </section>

          {/* Assets Inventory */}
          <section className="space-y-4">
            <h3 className="text-h3 flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-muted-foreground" /> Knowledge Assets
            </h3>
            <Card className="divide-y divide-border overflow-hidden">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
                        {doc.fileType.split('/')[1] || 'DOC'} • {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </Card>
          </section>
        </div>

        {/* Right: Study Plan & Meta */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-h3 text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-mono">
              <Activity className="h-4 w-4" /> 5-Day Study Plan
            </h3>
            <Card className="bg-gradient-to-br from-card to-secondary/20">
              <CardContent className="pt-6">
                {resources ? (
                   <div className="space-y-6">
                     <div className="prose prose-xs prose-invert max-w-none text-[13px] leading-relaxed text-muted-foreground">
                        {resources.studyPlan.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">{line.replace(/^#+\s/, '')}</p>
                        ))}
                     </div>
                     <Button className="w-full gap-2" variant="outline" size="sm">
                       <Clock className="h-3.5 w-3.5" /> Set Reminders
                     </Button>
                   </div>
                ) : (
                  <div className="space-y-4 py-8 flex flex-col items-center justify-center text-center">
                    <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-xs text-muted-foreground">Synthesizing curriculum...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-h3 text-sm flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-mono">
              <Layout className="h-4 w-4" /> Visual Map
            </h3>
            <Card
              className="aspect-square bg-secondary/20 border-dashed flex flex-col items-center justify-center text-center p-6 hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => onNavigate("mindmap")}
            >
              <div className="h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-6 w-6 text-tariro-indigo" />
              </div>
              <p className="text-xs font-semibold mb-1">Interactive Knowledge Graph</p>
              <p className="text-[10px] text-muted-foreground">Visualize connections between concepts</p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ icon, title, description, onClick, badge }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  onClick: () => void,
  badge?: string
}) {
  return (
    <Card
      className="p-4 hover:border-primary/30 transition-all cursor-pointer group hover:bg-secondary/20 h-full flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
          {icon}
        </div>
        {badge && (
          <Badge variant="secondary" className="font-mono text-[10px]">{badge}</Badge>
        )}
      </div>
      <h4 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">{description}</p>
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
        LAUNCH TOOL
        <ArrowRight className="h-3 w-3" />
      </div>
    </Card>
  );
}
