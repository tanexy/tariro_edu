/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  ExternalLink,
  Bot,
  User,
  Quote,
  Loader2,
  CalendarCheck2,
  ListCollapse,
  RefreshCw
} from "lucide-react";
import { TutorChat, TutorMessage } from "../types";

interface TutorViewProps {
  spaceId: string;
  spaceName: string;
  chat: TutorChat;
  onSendMessage: (msg: string) => Promise<void>;
  onClearChat: () => Promise<void>;
  isLoading: boolean;
}

export default function TutorView({
  spaceId,
  spaceName,
  chat,
  onSendMessage,
  onClearChat,
  isLoading
}: TutorViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts
  const suggestions = [
    { label: "Create a study plan", prompt: "Create a detailed study plan for me based on the uploaded content." },
    { label: "Explain key concepts", prompt: "What are the most complex concepts inside these resources, and can you explain them simply?" },
    { label: "Identify knowledge gaps", prompt: "Identify potential core knowledge gaps or tricky areas in these documents and suggest checks." },
    { label: "Generate study summaries", prompt: "Provide a quick, scannable bullet-point summary of the core topics of this Learning Space." }
  ];

  // Scroll to bottom on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    if (!isLoading) {
      onSendMessage(promptText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cosmic-bg font-sans" id="ai-tutor-container">
      {/* View Header */}
      <div className="p-4.5 border-b border-cosmic-border bg-cosmic-card/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cosmic-accent shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-white text-base">Tariro AI Core Tutor</h2>
              <span className="text-[9px] font-mono border border-indigo-500/40 bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">SECURE RAG</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Answers only from matching documents in <span className="text-white font-medium">{spaceName}</span></p>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="text-xs text-gray-500 hover:text-rose-400 transition-colors p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 font-medium border border-cosmic-border/60"
          title="Reset Conversational Model"
        >
          <Trash2 className="w-4 h-4" /> Reset Conversation
        </button>
      </div>

      {/* Message scroll log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chat.messages.filter(m => m.role !== "system").map((msg, index) => {
          const isModel = msg.role === "model";
          return (
            <div 
              key={msg.id || index}
              className={`flex gap-4 max-w-3xl ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                isModel 
                  ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400" 
                  : "bg-slate-800 border border-cosmic-border text-slate-300"
              }`}>
                {isModel ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message body */}
              <div className="space-y-2 max-w-full">
                <div className={`rounded-2xl p-4.5 ${
                  isModel 
                    ? "bg-cosmic-card border border-cosmic-border text-gray-100 rounded-tl-xs shadow-md" 
                    : "bg-indigo-600 text-white rounded-tr-xs shadow-md"
                }`}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap select-text">{msg.content}</p>
                </div>

                {/* Citations block for RAG accuracy verification */}
                {isModel && msg.citations && msg.citations.length > 0 && (
                  <div className="bg-cosmic-bg border border-cosmic-border/60 rounded-xl p-3 space-y-2 mt-1.5 max-w-md">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                      <Quote className="w-3 h-3" /> Root grounded sources ({msg.citations.length})
                    </div>
                    <div className="space-y-1.5">
                      {msg.citations.map((cit, cIdx) => (
                        <div 
                          key={cIdx}
                          className="bg-cosmic-card border border-cosmic-border p-2 rounded-lg text-[11px] group transition-all hover:border-cosmic-border/90"
                        >
                          <div className="flex items-center justify-between font-semibold text-gray-300 text-[10.5px]">
                            <span className="flex items-center gap-1 truncate text-gray-300">
                              <BookOpen className="w-3.5 h-3.5 text-cosmic-accent shrink-0" />
                              <span className="truncate">{cit.documentTitle}</span>
                            </span>
                            <span className="text-[8.5px] font-mono text-gray-500 shrink-0 uppercase">SEC {cIdx+1}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 italic mt-1 leading-snug line-clamp-2">
                             "{cit.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-4 max-w-xl mr-auto">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-cosmic-card border border-cosmic-border text-gray-400 text-xs rounded-2xl rounded-tl-xs p-4 shadow-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cosmic-accent" />
              <span>Tariro is researching grounding nodes...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Suggestion pills */}
      {chat.messages.filter(m => m.role !== "system").length <= 2 && !isLoading && (
        <div className="px-6 py-2 border-t border-cosmic-border/40 bg-cosmic-bg/20">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Suggested studies</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s.prompt)}
                className="px-3 py-1.5 rounded-lg border border-cosmic-border/80 bg-cosmic-card text-[11px] text-gray-400 hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer shadow-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Input Footer */}
      <div className="p-4 border-t border-cosmic-border bg-cosmic-card/85 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            required
            disabled={isLoading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask anything about ${spaceName}...`}
            className="w-full bg-cosmic-bg border border-cosmic-border focus:border-cosmic-accent disabled:opacity-40 rounded-xl pl-4 pr-14 py-3.5 text-xs text-white placeholder-gray-500 outline-none transition-colors shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-3 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shadow-indigo-600/25"
          >
            <Send className="w-4.2 h-4.2" />
          </button>
        </form>
        <span className="text-[10px] text-center block text-gray-500 mt-2 font-mono">
          🔍 Guarded Mode Active: Answers strictly derive from the actual documents.
        </span>
      </div>
    </div>
  );
}
