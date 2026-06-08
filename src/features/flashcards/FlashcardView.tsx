/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Filter,
  Search,
  BookOpen,
  Keyboard,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Flashcard } from "../../types/index";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Progress } from "../../components/ui/Progress";

interface FlashcardViewProps {
  spaceName: string;
  flashcards: Flashcard[];
}

export default function FlashcardView({
  spaceName,
  flashcards
}: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const filteredCards = flashcards.filter(c =>
    c.question.toLowerCase().includes(filter.toLowerCase()) ||
    c.category.toLowerCase().includes(filter.toLowerCase())
  );

  const activeCard = filteredCards[currentIndex];

  useEffect(() => {
    if (activeCard && !viewedIds.has(activeCard.id)) {
      const newSet = new Set(viewedIds);
      newSet.add(activeCard.id);
      setViewedIds(newSet);
    }
  }, [currentIndex, activeCard]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredCards.length]);

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCount(0);
    setViewedIds(new Set());
  };

  if (filteredCards.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-semibold mb-2">No flashcards found</h3>
        <p className="text-muted-foreground mb-8 max-w-sm">
          We couldn't find any flashcards matching your current filter. Try a different search term.
        </p>
        <Button onClick={() => setFilter("")}>Clear Filter</Button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / filteredCards.length) * 100;

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="h-5 w-5 text-emerald-500" />
            <h2 className="text-h2">Spaced Repetition</h2>
          </div>
          <p className="text-caption">Master <span className="font-medium text-foreground">{spaceName}</span> through active recall.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search concepts..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="pl-9 bg-secondary/50 border-transparent focus:bg-secondary focus:border-border"
            />
          </div>
          <Button variant="outline" size="icon" onClick={resetSession} title="Reset Session">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
            <span className="text-foreground">{currentIndex + 1} <span className="text-muted-foreground">/ {filteredCards.length}</span></span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex items-center justify-end gap-3">
          <Badge variant="outline" className="font-mono text-[10px] py-1 px-3 bg-secondary/30">
            {viewedIds.size} Viewed
          </Badge>
          <Badge variant="success" className="font-mono text-[10px] py-1 px-3">
             {knownCount} Mastered
          </Badge>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="relative w-full max-w-2xl aspect-[16/10] perspective-1000 cursor-pointer group"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (isFlipped ? "-back" : "-front")}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Card className={`w-full h-full flex flex-col p-8 md:p-12 shadow-2xl border-2 transition-colors ${
                isFlipped ? "bg-secondary/40 border-primary/20" : "bg-card border-border hover:border-primary/30"
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <Badge variant="outline" className="uppercase font-mono text-[10px] tracking-widest opacity-70">
                    {activeCard.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`uppercase font-mono text-[9px] ${
                      activeCard.difficulty === 'hard' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      activeCard.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {activeCard.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <h3 className={`font-display leading-relaxed ${
                    isFlipped ? "text-lg md:text-xl font-medium text-foreground/90" : "text-2xl md:text-3xl font-bold text-foreground"
                  }`}>
                    {isFlipped ? activeCard.answer : activeCard.question}
                  </h3>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px]">SPACE</kbd>
                    TO FLIP
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mastered/Next Controls */}
        <div className="mt-12 flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={currentIndex === 0}
            className="h-12 w-12 rounded-full border border-border"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 gap-2 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground transition-all h-12"
            onClick={(e) => {
              e.stopPropagation();
              setKnownCount(prev => prev + 1);
              handleNext();
            }}
          >
            <CheckCircle2 className="h-5 w-5" />
            I know this
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            disabled={currentIndex === filteredCards.length - 1}
            className="h-12 w-12 rounded-full border border-border"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-8 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <Keyboard className="h-3.5 w-3.5" />
          <span>USE KEYBOARD ARROWS TO NAVIGATE</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          <span>{filteredCards.length - (currentIndex + 1)} CARDS REMAINING</span>
        </div>
      </div>
    </div>
  );
}
