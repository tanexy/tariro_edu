/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserTier {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  createdAt: string;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
}

export interface Workspace {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface LearningSpace {
  id: string;
  workspaceId: string;
  name: string;
  folderPath: string; // The uploaded folder name (e.g., "Python Training")
  createdAt: string;
  documentCount: number;
}

export interface DocumentRecord {
  id: string;
  learningSpaceId: string;
  title: string;
  relativePath: string; // e.g., "Module 1/Notes.pdf"
  content: string; // Extracted text content
  fileType: string;
  fileSize: number; // in bytes
  createdAt: string;
}

export type LearningResourceType = 
  | "overview" 
  | "guide" 
  | "flashcards" 
  | "quizzes" 
  | "mindmap" 
  | "studyplan";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: "multiple-choice" | "short-answer" | "scenario";
}

export interface MindMapNode {
  id: string;
  label: string;
  type: "root" | "topic" | "concept" | "detail";
  parentId?: string;
  description?: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
}

export interface ExamQuestionIntel {
  question: string;
  sourcePaper: string;
  year?: string;
  normalizedFormat: string;
  group: string;
}

export interface ExamTopicFrequency {
  topic: string;
  percentageOccurrence: number;
  rank: number;
}

export interface ExamQuestionStyle {
  styleName: string; // e.g. Definition-based, Problem-solving, Scenario-based, Essay/discussion, Application
  description: string;
  percentage: number;
}

export interface ExamIntelReport {
  patternMining: {
    extractedQuestions: ExamQuestionIntel[];
  };
  frequencyAnalysis: {
    repeatedTopics: ExamTopicFrequency[];
  };
  questionStyleAnalysis: {
    styles: ExamQuestionStyle[];
  };
  examinerPattern: {
    recurringPhrases: string[];
    repeatedStructures: string[];
    variationDescription: string;
  };
  studyPrioritization: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
  };
  examPrediction: {
    predictedQuestions: {
      question: string;
      predictionConfidence: "High" | "Medium" | "Low";
      variations: string[];
      fullModelAnswer: string;
    }[];
  };
  weakAreaDetection: {
    gaps: {
      topic: string;
      reason: string;
    }[];
  };
}

export interface LearningResources {
  id: string;
  learningSpaceId: string;
  overview: string; // General welcome and synthesis
  studyPlan: string; // Structured visual study path
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  mindMap: MindMapData;
  examIntelligence?: ExamIntelReport;
  createdAt: string;
}

export interface TutorMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  citations?: {
    documentId: string;
    documentTitle: string;
    snippet: string;
  }[];
  timestamp: string;
}

export interface TutorChat {
  id: string;
  learningSpaceId: string;
  userId: string;
  messages: TutorMessage[];
  updatedAt: string;
}

export interface RecentActivity {
  id: string;
  userId: string;
  type: "upload" | "quiz" | "chat" | "workspace";
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  learningSpacesCount: number;
  documentsCount: number;
  quizzesTaken: number;
  studyTimeFormatted: string;
  tier: UserTier;
}
