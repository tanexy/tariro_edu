/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  FolderIcon,
  FileText,
  Activity,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Clock,
  Layout
} from "lucide-react";
import { LearningSpace, RecentActivity, DashboardStats, UserProfile } from "../../types/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

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

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-caption">Here's what's happening in your knowledge core today.</p>
        </div>
        <Button onClick={onOpenUpload} className="gap-2">
          <Plus className="h-4 w-4" /> Create Learning Space
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Learning Spaces"
          value={stats.learningSpacesCount.toString()}
          icon={<FolderIcon className="h-4 w-4 text-tariro-blue" />}
          trend="Active"
        />
        <StatCard
          label="Knowledge Assets"
          value={stats.documentsCount.toString()}
          icon={<FileText className="h-4 w-4 text-emerald-500" />}
          trend="Processed"
        />
        <StatCard
          label="Assessments"
          value={stats.quizzesTaken.toString()}
          icon={<Target className="h-4 w-4 text-amber-500" />}
          trend="Completed"
        />
        <StatCard
          label="Study Time"
          value={stats.studyTimeFormatted}
          icon={<Clock className="h-4 w-4 text-tariro-purple" />}
          trend="This week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Learning Spaces */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-h3">Learning Spaces</h3>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </div>

          {learningSpaces.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Layout className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No learning spaces yet</CardTitle>
              <CardDescription className="max-w-[250px] mb-6">
                Upload your first folder of documents to generate an AI-powered learning environment.
              </CardDescription>
              <Button onClick={onOpenUpload} variant="outline">
                Get Started
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningSpaces.map((space) => (
                <Card
                  key={space.id}
                  className="hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectSpace(space.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {space.documentCount} Assets
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(space.createdAt)}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{space.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-tariro-indigo" />
                        AI Ready
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Content: AI Insights & Activity */}
        <div className="space-y-8">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-label text-primary-foreground/80">AI Recommended</span>
              </div>
              <CardTitle className="text-lg">Ready to study?</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                {learningSpaces.length > 0
                  ? `Focus on "${learningSpaces[0].name}" for 15 minutes to stay on track.`
                  : "Upload documents to get personalized study recommendations."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" size="sm" className="w-full" disabled={learningSpaces.length === 0}>
                Start Session
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-h3 text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-caption italic">No recent activity.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="flex gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                      <ActivityIcon type={act.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-none mb-1">{act.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate leading-none mb-1">{act.description}</p>
                      <span className="text-[9px] font-mono text-muted-foreground/60">{formatDate(act.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-label text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <Badge variant="outline" className="px-1 py-0 h-4 text-[9px] font-mono">{trend}</Badge>
        </p>
      </div>
    </Card>
  );
}

function ActivityIcon({ type }: { type: RecentActivity["type"] }) {
  switch (type) {
    case "upload": return <FileText className="h-4 w-4" />;
    case "quiz": return <Target className="h-4 w-4" />;
    case "chat": return <Sparkles className="h-4 w-4" />;
    case "workspace": return <Layout className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
}
