/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Search, 
  CheckCircle,
  HelpCircle,
  FolderOpen,
  Sparkles,
  BookMarked
} from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardViewProps {
  spaceName: string;
  flashcards: Flashcard[];
}

export default function FlashcardView({ spaceName, flashcards }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  
  // Track mastery status locally (know vs study-more)
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  // Derived unique categories
  const categories = useMemo(() => {
    const list = new Set(flashcards.map(c => c.category));
    return ["all", ...Array.from(list)];
  }, [flashcards]);

  // Filters card list
  const filteredCards = useMemo(() => {
    return flashcards.filter(c => {
      const matchesSearch = 
        c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || c.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [flashcards, searchQuery, selectedCategory, selectedDifficulty]);

  // Adjust card pointer on filter changes
  const activeCard = filteredCards[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(v => v + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(v => v - 1);
      }, 150);
    }
  };

  const markAsMastered = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds(prev => {
      if (prev.includes(cardId)) return prev;
      return [...prev, cardId];
    });
    setReviewIds(prev => prev.filter(id => id !== cardId));
    handleNext();
  };

  const markForReview = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewIds(prev => {
      if (prev.includes(cardId)) return prev;
      return [...prev, cardId];
    });
    setMasteredIds(prev => prev.filter(id => id !== cardId));
    handleNext();
  };

  const masteryPercentage = flashcards.length > 0 
    ? Math.round((masteredIds.length / flashcards.length) * 100) 
    : 0;

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-6 flex flex-col font-sans" id="flashcard-view-container">
      
      {/* Search & Statistics Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BrainCircuit className="w-5.3 h-5.3" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Active-Recall Micro Deck</h2>
            <p className="text-xs text-gray-400 mt-0.5">Spaced repetition triggers faster cognitive memorization.</p>
          </div>
        </div>

        {/* Master counter */}
        <div className="flex items-center gap-4 shrink-0 bg-cosmic-bg/40 p-3 rounded-xl border border-cosmic-border/50">
          <div className="text-left">
            <span className="text-[10px] font-mono text-gray-500 block uppercase">Progress</span>
            <span className="text-sm font-bold text-white leading-tight">{masteredIds.length} / {flashcards.length} Mastered</span>
          </div>
          
          <div className="relative w-10 h-10 flex items-center justify-center font-mono">
            <svg className="absolute w-10 h-10 transform -rotate-90">
              <circle cx="20" cy="20" r="16" stroke="#1e293b" strokeWidth="3" fill="transparent" />
              <circle cx="20" cy="20" r="16" stroke="#10b981" strokeWidth="3" fill="transparent"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - masteryPercentage / 100)}`}
              />
            </svg>
            <span className="text-[9px] text-emerald-400 font-bold">{masteryPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Grid Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full bg-cosmic-card border border-cosmic-border focus:border-cosmic-accent p-2.5 pl-9 text-xs rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
        </div>

        {/* Category Pick */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentIndex(0);
          }}
          className="bg-cosmic-card border border-cosmic-border text-xs rounded-lg p-2.5 outline-none focus:border-cosmic-accent text-gray-300 font-medium cursor-pointer"
        >
          <option value="all">📁 All Categories ({categories.length - 1})</option>
          {categories.slice(1).map((cat, idx) => (
            <option key={idx} value={cat}>🏷️ {cat}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => {
            setSelectedDifficulty(e.target.value);
            setCurrentIndex(0);
          }}
          className="bg-cosmic-card border border-cosmic-border text-xs rounded-lg p-2.5 outline-none focus:border-cosmic-accent text-gray-300 font-medium cursor-pointer"
        >
          <option value="all">⚡ All Difficulties</option>
          <option value="easy">🟩 Easy Level</option>
          <option value="medium">🟨 Medium Level</option>
          <option value="hard">🟥 Hard Level</option>
        </select>
      </div>

      {/* Primary Flip Arena */}
      {filteredCards.length === 0 ? (
        <div className="border border-dashed border-cosmic-border rounded-2xl bg-cosmic-card/20 py-20 text-center flex flex-col items-center justify-center p-6 flex-1">
          <BookMarked className="w-12 h-12 text-gray-600 mb-3" />
          <h3 className="font-display font-medium text-white text-sm">No Flashcards Match Filters</h3>
          <p className="text-gray-500 text-xs mt-1.5 max-w-xs mx-auto">Adjust search keywords of your filters to continue training.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-2">
          {/* Deck indices info */}
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">
             Card INDEX {currentIndex + 1} of {filteredCards.length}
          </div>

          {/* Interactive Core Flip Box */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 perspective-1000 cursor-pointer select-none"
          >
            <div className={`w-full h-full relative transition-transform duration-500 transform-transform ${
              isFlipped ? "rotate-y-180" : ""
            }`}>
              
              {/* FACE FRONT: QUESTION */}
              <div className="absolute inset-0 bg-cosmic-card border-2 border-cosmic-border hover:border-cosmic-accent rounded-2xl p-6 flex flex-col justify-between backface-hidden shadow-xl transition-all">
                {/* Category & difficulty indicators */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.8 border border-indigo-500/15 rounded">
                    {activeCard.category}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded capitalize ${
                    activeCard.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" :
                    activeCard.difficulty === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                  }`}>
                    {activeCard.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <div className="my-auto text-center space-y-4">
                  <span className="text-[11px] font-mono text-cosmic-accent uppercase tracking-widest flex items-center justify-center gap-1.5"><HelpCircle className="w-4 h-4 text-cosmic-accent" /> Active Question</span>
                  <p className="text-gray-100 font-display font-medium text-base leading-snug px-3">
                    {activeCard.question}
                  </p>
                </div>

                {/* Action Reveal Hint */}
                <div className="text-center text-[10px] font-mono text-indigo-400/80 animate-pulse flex items-center justify-center gap-1">
                   Click card to reveal answer
                </div>

              </div>

              {/* FACE BACK: ANSWER */}
              <div className="absolute inset-0 bg-cosmic-card border-2 border-cosmic-accent/40 rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl transition-all">
                
                {/* Indicators */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.8 border border-emerald-500/15 rounded">
                     VERIFIED EXPLANATION
                  </span>
                  
                  {masteredIds.includes(activeCard.id) && (
                    <span className="text-[9px] font-mono bg-emerald-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Mastered
                    </span>
                  )}
                  {reviewIds.includes(activeCard.id) && (
                    <span className="text-[9px] font-mono bg-amber-500 text-black px-2 py-0.5 rounded flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Marked Review
                    </span>
                  )}
                </div>

                {/* Answer Text */}
                <div className="my-auto text-center space-y-3 px-2 overflow-y-auto max-h-40">
                  <p className="text-emerald-400 font-display font-semibold text-xs uppercase tracking-wider">Concept Key</p>
                  <p className="text-gray-200 text-[12.5px] leading-relaxed select-text">
                    {activeCard.answer}
                  </p>
                </div>

                {/* Space Repetition Assessment Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                  <button
                    type="button"
                    onClick={(e) => markForReview(activeCard.id, e)}
                    className="py-2.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 cursor-pointer text-center text-[10.5px] transition-colors bg-cosmic-bg/60 font-mono"
                  >
                     🔄 PRACTICE MORE
                  </button>
                  <button
                    type="button"
                    onClick={(e) => markAsMastered(activeCard.id, e)}
                    className="py-2.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 cursor-pointer text-center text-[10.5px] transition-colors bg-cosmic-bg/60 font-mono"
                  >
                     ✅ I KNOW THIS
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Stepper Navigation Keys */}
          <div className="flex items-center justify-between w-full mt-6 px-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 py-1.8 rounded-lg border border-cosmic-border bg-cosmic-card text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-mono"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Card
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredCards.length - 1}
              className="p-2 py-1.8 rounded-lg border border-cosmic-border bg-cosmic-card text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-mono"
            >
              Next Card <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
