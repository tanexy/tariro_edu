/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { 
  UserProfile, 
  Workspace, 
  LearningSpace, 
  DocumentRecord, 
  LearningResources, 
  TutorChat, 
  RecentActivity,
  UserTier,
  Flashcard,
  QuizQuestion,
  MindMapData,
  TutorMessage
} from "./types";

interface DbSchema {
  users: UserProfile[];
  workspaces: Workspace[];
  learningSpaces: LearningSpace[];
  documents: DocumentRecord[];
  learningResources: LearningResources[];
  tutorChats: TutorChat[];
  recentActivities: RecentActivity[];
}

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Default seeded data for immediate testing
const getInitialData = (): DbSchema => {
  const defaultUserId = "user-clive-tariro";

  return {
    users: [
      {
        id: defaultUserId,
        email: "tanakaclive29@gmail.com",
        name: "Clive Tanaka",
        tier: UserTier.FREE,
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024, // 100MB
        createdAt: new Date().toISOString()
      }
    ],
    workspaces: [],
    learningSpaces: [],
    documents: [],
    learningResources: [],
    tutorChats: [],
    recentActivities: []
  };
};

export class DbManager {
  private data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf8");
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Failed to load local DB, fallback to seed:", e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DbSchema): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to save database file:", e);
    }
  }

  // Flush in-memory state to disk
  private flush(): void {
    this.saveData(this.data);
  }

  // --- Users API ---
  getUser(userId: string = "user-clive-tariro"): UserProfile {
    let user = this.data.users.find(u => u.id === userId);
    if (!user) {
      // Create user if not existing
      user = {
        id: userId,
        email: "tanakaclive29@gmail.com",
        name: "Clive Tanaka",
        tier: UserTier.FREE,
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024,
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
      this.flush();
    }
    return user;
  }

  updateUserTier(userId: string, tier: UserTier): UserProfile {
    const user = this.getUser(userId);
    user.tier = tier;
    if (tier === UserTier.FREE) {
      user.storageLimit = 100 * 1024 * 1024; // 100MB
    } else if (tier === UserTier.PRO) {
      user.storageLimit = 2 * 1024 * 1024 * 1024; // 2GB
    } else {
      user.storageLimit = 100 * 1024 * 1024 * 1024; // 100GB
    }
    this.flush();
    return user;
  }

  updateUserStorage(userId: string, addedBytes: number): UserProfile {
    const user = this.getUser(userId);
    user.storageUsed = Math.max(0, user.storageUsed + addedBytes);
    this.flush();
    return user;
  }

  // --- Workspaces API ---
  getWorkspaces(userId: string = "user-clive-tariro"): Workspace[] {
    return this.data.workspaces.filter(w => w.userId === userId);
  }

  createWorkspace(name: string, userId: string = "user-clive-tariro"): Workspace {
    const id = "workspace-" + Math.random().toString(36).substring(2, 9);
    const workspace: Workspace = {
      id,
      name,
      userId,
      createdAt: new Date().toISOString()
    };
    this.data.workspaces.push(workspace);
    
    // Log activity
    this.addActivity(userId, "workspace", "Workspace Created", `Added '${name}' workspace`);
    this.flush();
    return workspace;
  }

  // --- Learning Spaces API ---
  getLearningSpaces(workspaceId: string): LearningSpace[] {
    return this.data.learningSpaces.filter(ls => ls.workspaceId === workspaceId);
  }

  getLearningSpace(spaceId: string): LearningSpace | undefined {
    return this.data.learningSpaces.find(ls => ls.id === spaceId);
  }

  createLearningSpace(workspaceId: string, name: string, folderPath: string): LearningSpace {
    const id = "space-" + Math.random().toString(36).substring(2, 9);
    const space: LearningSpace = {
      id,
      workspaceId,
      name,
      folderPath,
      createdAt: new Date().toISOString(),
      documentCount: 0
    };
    this.data.learningSpaces.push(space);
    this.flush();
    return space;
  }

  updateLearningSpaceDocCount(spaceId: string, count: number): void {
    const space = this.getLearningSpace(spaceId);
    if (space) {
      space.documentCount = count;
      this.flush();
    }
  }

  // --- Documents API ---
  getDocuments(spaceId: string): DocumentRecord[] {
    return this.data.documents.filter(d => d.learningSpaceId === spaceId);
  }

  createDocument(spaceId: string, title: string, relativePath: string, content: string, fileType: string, fileSize: number): DocumentRecord {
    const id = "doc-" + Math.random().toString(36).substring(2, 9);
    const doc: DocumentRecord = {
      id,
      learningSpaceId: spaceId,
      title,
      relativePath,
      content,
      fileType,
      fileSize,
      createdAt: new Date().toISOString()
    };
    this.data.documents.push(doc);
    
    // Increment count on parent space
    const space = this.getLearningSpace(spaceId);
    if (space) {
      space.documentCount += 1;
    }

    // Accumulate user storage
    const userWorkspace = this.data.workspaces.find(w => w.id === space?.workspaceId);
    if (userWorkspace) {
      this.updateUserStorage(userWorkspace.userId, fileSize);
    }

    this.flush();
    return doc;
  }

  // --- Learning Resources API ---
  getLearningResources(spaceId: string): LearningResources | undefined {
    return this.data.learningResources.find(lr => lr.learningSpaceId === spaceId);
  }

  saveLearningResources(resources: LearningResources): void {
    const index = this.data.learningResources.findIndex(lr => lr.learningSpaceId === resources.learningSpaceId);
    if (index >= 0) {
      this.data.learningResources[index] = resources;
    } else {
      this.data.learningResources.push(resources);
    }
    this.flush();
  }

  // --- AI Tutor Chats API ---
  getTutorChat(spaceId: string, userId: string = "user-clive-tariro"): TutorChat {
    let chat = this.data.tutorChats.find(c => c.learningSpaceId === spaceId && c.userId === userId);
    if (!chat) {
      chat = {
        id: "chat-" + Math.random().toString(36).substring(2, 9),
        learningSpaceId: spaceId,
        userId,
        messages: [
          {
            id: "msg-welcome",
            role: "system",
            content: "You are Tariro, the elite AI Learning Tutor. Ask me anything about the uploaded documents in this space, and I will cite precise details.",
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      this.data.tutorChats.push(chat);
      this.flush();
    }
    return chat;
  }

  addChatMessage(spaceId: string, userId: string, message: TutorMessage): TutorChat {
    const chat = this.getTutorChat(spaceId, userId);
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    this.flush();
    return chat;
  }

  clearChat(spaceId: string, userId: string): TutorChat {
    const chat = this.getTutorChat(spaceId, userId);
    chat.messages = [
      {
        id: "msg-welcome",
        role: "system",
        content: "You are Tariro, the elite AI Learning Tutor. Ask me anything about the uploaded documents in this space, and I will cite precise details.",
        timestamp: new Date().toISOString()
      }
    ];
    chat.updatedAt = new Date().toISOString();
    this.flush();
    return chat;
  }

  // --- Activities API ---
  getActivities(userId: string = "user-clive-tariro"): RecentActivity[] {
    return this.data.recentActivities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addActivity(userId: string, type: RecentActivity["type"], title: string, description: string): void {
    const activity: RecentActivity = {
      id: "act-" + Math.random().toString(36).substring(2, 9),
      userId,
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    };
    this.data.recentActivities.push(activity);
    
    // Truncate activities beyond 50
    if (this.data.recentActivities.length > 100) {
      this.data.recentActivities = this.data.recentActivities.slice(-100);
    }

    this.flush();
  }
}

export const dbManager = new DbManager();
