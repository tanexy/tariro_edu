/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Bookmark
} from "lucide-react";
import { TutorChat, TutorMessage } from "../../types/index";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";

interface TutorViewProps {
  spaceId: string;
  spaceName: string;
  chat: TutorChat;
  onSendMessage: (msg: string) => void;
  onClearChat: () => void;
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
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* View Header */}
      <div className="px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-tariro-indigo/10 flex items-center justify-center border border-tariro-indigo/20">
            <Bot className="h-6 w-6 text-tariro-indigo" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Tariro AI Tutor</h2>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              Active in <span className="font-medium text-foreground">{spaceName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClearChat} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Clear History
          </Button>
        </div>
      </div>

      {/* Chat History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {chat.messages.length <= 1 && (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-sm border border-border">
              <Sparkles className="h-8 w-8 text-tariro-indigo" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">Knowledge-Grounded Learning</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Ask questions about your uploaded documents. Tariro will provide precise answers with source citations.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {[
                "What are the key concepts here?",
                "Can you summarize the main findings?",
                "Explain the relationship between topics."
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-left hover:bg-secondary hover:border-primary/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  {suggestion}
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.messages.filter(m => m.role !== "system").map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "model" && (
              <div className="h-8 w-8 rounded-lg bg-tariro-indigo flex items-center justify-center shrink-0 border border-tariro-indigo/20 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}

            <div className={`flex flex-col space-y-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/80 border border-border"
              }`}>
                {msg.content}
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.citations.map((cit, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] font-mono gap-1 hover:bg-secondary cursor-default py-0 px-2 h-5">
                      <Bookmark className="h-2.5 w-2.5 text-tariro-indigo" />
                      {cit.documentTitle}
                    </Badge>
                  ))}
                </div>
              )}

              <span className="text-[9px] font-mono text-muted-foreground/60">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border shadow-sm">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-lg bg-tariro-indigo flex items-center justify-center shrink-0 border border-tariro-indigo/20 shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-secondary/80 border border-border p-4 rounded-2xl flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-tariro-indigo/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-tariro-indigo/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-tariro-indigo/80 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-border bg-background/80 backdrop-blur-md">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto"
        >
          <Input
            placeholder="Ask Tariro about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="pr-12 h-12 bg-secondary/50 border-transparent focus:bg-secondary focus:border-primary/30 transition-all rounded-xl text-base"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Powered by <span className="font-semibold text-tariro-indigo">Gemini 1.5 Flash</span> • Tariro Knowledge Graph
            </p>
            <div className="flex items-center gap-3">
               <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                 <MessageSquare className="h-3 w-3" /> Prompt Guide
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
