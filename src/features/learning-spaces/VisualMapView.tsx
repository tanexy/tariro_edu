/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MessageCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { MindMapData } from "../../types/index";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface VisualMapViewProps {
  spaceName: string;
  mindMap: MindMapData;
  onAskTutorText: (text: string) => void;
}

export default function VisualMapView({
  spaceName,
  mindMap,
  onAskTutorText
}: VisualMapViewProps) {

  // A simplified visualization of nodes as a hierarchical list or interactive grid
  // Since we don't have a full force-directed graph library installed yet,
  // we'll create a premium-feeling hierarchical card-based visualization.

  const rootNode = mindMap.nodes.find(n => n.type === 'root');
  const topics = mindMap.nodes.filter(n => n.type === 'topic');

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto h-full flex flex-col pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-tariro-indigo" />
            <h1 className="text-h1">Cognitive Mind Map</h1>
          </div>
          <p className="text-caption text-lg">Visualizing the knowledge hierarchy of <span className="font-semibold text-foreground">{spaceName}</span>.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-background p-1 gap-1">
             <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomIn className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomOut className="h-4 w-4" /></Button>
             <div className="w-[1px] h-4 bg-border mx-1" />
             <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="gap-2">
             <Search className="h-4 w-4" /> Locate Concept
          </Button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="flex-1 min-h-[500px] rounded-2xl border border-border bg-secondary/10 relative overflow-hidden flex flex-col p-8 md:p-12 items-center justify-start bg-[radial-gradient(circle_at_center,var(--color-secondary)_0%,transparent_70%)]">

        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Root Node */}
        {rootNode && (
          <div className="relative z-10 flex flex-col items-center mb-20 animate-in fade-in zoom-in duration-700">
            <div className="h-24 w-24 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/20 border-4 border-background rotate-12 hover:rotate-0 transition-all duration-500 cursor-default">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-display font-black mt-6 tracking-tight text-center">{rootNode.label}</h2>
            <Badge variant="outline" className="mt-2 font-mono text-[9px] tracking-widest bg-background">CENTRAL HUB</Badge>

            {/* Connection Lines from root */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-primary to-transparent opacity-20" />
          </div>
        )}

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
          {topics.map((topic, i) => {
            const children = mindMap.nodes.filter(n => n.parentId === topic.id);

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/20 transition-all group overflow-hidden">
                  <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-tariro-indigo" />
                       {topic.label}
                    </h3>
                    <Badge variant="outline" className="text-[9px] font-mono opacity-50">{children.length} NODES</Badge>
                  </div>
                  <CardContent className="p-5 space-y-4">
                     <div className="space-y-2">
                       {children.map(child => (
                         <div key={child.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group/node cursor-pointer">
                           <div className="h-1.5 w-1.5 rounded-full bg-border group-hover/node:bg-tariro-indigo transition-colors" />
                           <span className="text-xs text-muted-foreground group-hover/node:text-foreground transition-colors truncate flex-1">{child.label}</span>
                           <ChevronRight className="h-3 w-3 opacity-0 group-hover/node:opacity-100 transition-all" />
                         </div>
                       ))}
                     </div>

                     <div className="pt-4 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-[10px] gap-2 font-bold uppercase tracking-widest text-muted-foreground hover:text-tariro-indigo transition-colors"
                          onClick={() => onAskTutorText(`Explain the relationship between ${rootNode?.label} and ${topic.label} in depth.`)}
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Contextual Analysis
                        </Button>
                     </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State / Legend */}
        {topics.length === 0 && (
           <div className="py-20 text-center">
             <p className="text-muted-foreground italic">Constructing visual knowledge graph...</p>
           </div>
        )}
      </div>

      {/* Floating Insight */}
      <div className="bg-background border border-border p-4 rounded-xl flex items-center gap-4 shadow-xl max-w-fit mx-auto sticky bottom-8 animate-in slide-in-from-bottom-4">
         <div className="h-8 w-8 rounded-lg bg-tariro-indigo/10 flex items-center justify-center border border-tariro-indigo/20 shrink-0">
           <Sparkles className="h-4 w-4 text-tariro-indigo" />
         </div>
         <p className="text-xs text-muted-foreground">
           <span className="font-bold text-foreground">Semantic Connection:</span> Most concepts in this space derive from <span className="font-medium text-foreground">"{topics[0]?.label || 'the central core'}"</span>.
         </p>
         <div className="w-[1px] h-4 bg-border" />
         <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold">DISMISS</Button>
      </div>
    </div>
  );
}
