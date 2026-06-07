/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Network, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  Maximize2, 
  Info,
  Layers,
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { MindMapData, MindMapNode } from "../types";

interface VisualMapViewProps {
  spaceName: string;
  mindMap: MindMapData;
  onAskTutorText: (topicText: string) => void;
}

export default function VisualMapView({ spaceName, mindMap, onAskTutorText }: VisualMapViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Fallback map checks
  const nodes = mindMap?.nodes || [];

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes.find(n => n.type === "root") || null;
  }, [nodes, selectedNodeId]);

  // Group nodes by parentId
  const hierarchicalNodes = useMemo(() => {
    const root = nodes.find(n => n.type === "root");
    const topics = nodes.filter(n => n.type === "topic" && (n.parentId === root?.id || !n.parentId));
    
    return {
      root,
      topics: topics.map(t => {
        const concepts = nodes.filter(n => n.type === "concept" && n.parentId === t.id);
        return {
          ...t,
          concepts
        };
      })
    };
  }, [nodes]);

  const handleAskTutor = (label: string) => {
    onAskTutorText(`Can you explain the concept of "${label}" inside our research documents in complete detail?`);
  };

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-6 flex flex-col font-sans" id="visual-map-arena">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Network className="w-5.3 h-5.3" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Cognitive Concept Mind Map</h2>
            <p className="text-xs text-gray-400 mt-0.5">Interactive mind maps plot relational logic connections visually.</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-[10.5px] font-mono rounded-lg flex items-center gap-1.5 uppercase font-bold">
           interactive canvas
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="border border-dashed border-cosmic-border rounded-2xl bg-cosmic-card/20 py-20 text-center flex flex-col items-center justify-center p-6 flex-1Select-none">
          <Layers className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="font-display font-medium text-white text-sm">Mind Map Not Synthesized</h3>
          <p className="text-gray-500 text-xs mt-1.5 max-w-xs mx-auto">Upload folders containing explicit references to draft visual diagrams.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mind Map Interactive Graph visualizer */}
          <div className="lg:col-span-2 bg-cosmic-card border border-cosmic-border rounded-2xl p-5 shadow-xl min-h-110 flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4">
              Visual Learning Tree: {spaceName}
            </div>

            {/* Structured diagram setup layout */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-10 my-auto py-4 relative">
              
              {/* Hierarchical Tree Render */}
              <div className="flex flex-col items-center space-y-7 relative w-full">
                
                {/* 1. Root center node */}
                {hierarchicalNodes.root && (
                  <button
                    onClick={() => setSelectedNodeId(hierarchicalNodes.root!.id)}
                    className={`p-3.5 px-6 rounded-2xl border-2 cursor-pointer font-display font-bold text-xs shadow-xl transition-all relative z-10 ${
                      selectedNode?.id === hierarchicalNodes.root.id
                        ? "border-cosmic-accent bg-gradient-to-br from-indigo-500/20 to-cosmic-accent/20 text-white scale-105 shadow-cosmic-accent-glow"
                        : "border-cosmic-accent/50 bg-slate-900 text-gray-200 hover:border-cosmic-accent"
                    }`}
                  >
                    👑 {hierarchicalNodes.root.label}
                  </button>
                )}

                {/* Vertical path placeholder */}
                <div className="w-0.5 h-6 bg-slate-800" />

                {/* 2. Topics row */}
                <div className="flex flex-wrap justify-center gap-6 w-full relative">
                  {hierarchicalNodes.topics.map((topic) => {
                    const isTopicSelected = selectedNode?.id === topic.id;
                    return (
                      <div key={topic.id} className="flex flex-col items-center space-y-4">
                        
                        {/* Topic bubble */}
                        <button
                          onClick={() => setSelectedNodeId(topic.id)}
                          className={`p-2.5 px-4 rounded-xl border cursor-pointer text-xs font-semibold shadow-md transition-all relative z-10 ${
                            isTopicSelected
                              ? "border-cosmic-accent bg-indigo-500/20 text-white scale-103 shadow-cosmic-accent/20"
                              : "border-cosmic-border bg-cosmic-bg text-gray-300 hover:border-slate-700"
                          }`}
                        >
                          🏷️ {topic.label}
                        </button>

                        {/* Concept nodes list radiating beneath */}
                        {topic.concepts.length > 0 && (
                          <div className="flex flex-col items-center space-y-2 relative pt-2">
                            <div className="w-0.5 h-3 bg-slate-800" />
                            <div className="flex flex-col gap-1.5">
                              {topic.concepts.map((concept) => {
                                const isConceptSelected = selectedNode?.id === concept.id;
                                return (
                                  <button
                                    key={concept.id}
                                    onClick={() => setSelectedNodeId(concept.id)}
                                    className={`p-2 px-3 rounded-lg border text-[11px] cursor-pointer font-medium transition-all ${
                                      isConceptSelected
                                        ? "border-indigo-400 bg-indigo-400/10 text-white font-semibold"
                                        : "border-cosmic-border bg-cosmic-bg/60 text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    ⚙️ {concept.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* Instruction tooltip */}
            <div className="text-[10px] font-mono text-gray-500 text-center mt-3">
              💡 Select any node bubble to inspect details, and formulate direct questions.
            </div>
          </div>

          {/* Node Inspector Side Panel */}
          <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 shadow-2xl flex flex-col justify-between min-h-110">
            <div className="space-y-4.5">
              <div className="flex items-center gap-2 border-b border-cosmic-border/50 pb-3">
                <Info className="w-4 h-4 text-cosmic-accent" />
                <h3 className="font-display font-bold text-white text-sm">Visual Concept Inspector</h3>
              </div>

              {selectedNode ? (
                <div className="space-y-4 select-text">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-cosmic-accent uppercase tracking-widest block font-bold">Node Label</span>
                    <h4 className="text-white font-display font-extrabold text-base leading-tight">
                      {selectedNode.label}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-[10.5px] font-mono text-gray-500 border-y border-cosmic-border/40 py-2">
                    <span className="capitalize">Tier: <span className="text-indigo-400 font-bold">{selectedNode.type}</span></span>
                    <span>•</span>
                    <span>ID: <span className="text-gray-300">{selectedNode.id}</span></span>
                  </div>

                  {selectedNode.description ? (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Inspected explanation</span>
                      <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                        {selectedNode.description}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-cosmic-bg/40 border border-cosmic-border rounded-xl text-[11px] text-gray-500 italic">
                      No static description parsed. Let Tariro generate a complete explanation by asking the AI Tutor.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-10 text-center italic text-gray-500 text-xs">
                  Tap any node to view concepts definition.
                </div>
              )}
            </div>

            {selectedNode && (
              <div className="pt-4 border-t border-cosmic-border/50">
                <button
                  type="button"
                  onClick={() => handleAskTutor(selectedNode.label)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cosmic-accent hover:opacity-95 text-xs text-white font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cosmic-accent/25"
                >
                  <Sparkles className="w-4 h-4" /> Ask Tutor About This
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
