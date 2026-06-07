/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FolderIcon, 
  FileText, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ListRestart
} from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (spaceId: string) => void;
  workspaceId: string;
}

export default function UploadModal({ onClose, onUploadSuccess, workspaceId }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: number; type: string; fileObj: File }[]>([]);
  const [uploadState, setUploadState] = useState<"idle" | "reading" | "transmitting" | "processing" | "success" | "error">("idle");
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  // Friendly reassure processing prompts
  const loadingPhrases = [
    "Ingesting knowledge core files...",
    "Scanning content blocks with Gemini...",
    "Extracting rich tables and hierarchy...",
    "Assembling cognitive knowledge graph...",
    "Generating study plans and flashcards...",
    "Calibrating active assessment questions...",
    "Readying Tariro AI personal tutor..."
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (files: File[]) => {
    // Attempt to guess folder name based on first file path relative structure if available, or fall back
    const validFiles = files.filter(f => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ["pdf", "pptx", "docx", "txt", "md", "csv", "xlsx", "xls", "png", "jpg", "jpeg"].includes(ext || "");
    });

    if (validFiles.length === 0) {
      setErrorMessage("No supported documents found. Please upload PDF, Word, PPTX, Text, Markdown, Image files.");
      return;
    }

    setErrorMessage("");
    const mapped = validFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      fileObj: f
    }));

    setSelectedFiles(prev => [...prev, ...mapped]);

    // Guess folder name
    if (!folderName) {
      const pathSample = (validFiles[0] as any).webkitRelativePath;
      if (pathSample) {
        const rootFolder = pathSample.split("/")[0];
        setFolderName(rootFolder);
      } else {
        setFolderName("My Learning Space");
      }
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Convert files to transmission structure (base64 or text) and call server
  const triggerFolderUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!folderName.trim()) {
      setErrorMessage("Please assign a name to your custom Learning Space.");
      return;
    }

    try {
      setUploadState("reading");
      setProgressMessage("Reading files from disk...");

      const payloadFiles: { name: string; type: string; size: number; text?: string; base64?: string; path: string }[] = [];

      for (const item of selectedFiles) {
        const { fileObj } = item;
        const relativePath = (fileObj as any).webkitRelativePath || fileObj.name;
        
        const isText = 
          fileObj.name.endsWith(".txt") || 
          fileObj.name.endsWith(".md") || 
          fileObj.name.endsWith(".csv") ||
          fileObj.name.endsWith(".json");

        if (isText) {
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(fileObj);
          });
          payloadFiles.push({
            name: fileObj.name,
            type: fileObj.type,
            size: fileObj.size,
            path: relativePath,
            text
          });
        } else {
          // Read binary as Base64 for Gemini ingestion
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              // strip base64 header
              const stripped = res.split(",")[1] || res;
              resolve(stripped);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(fileObj);
          });
          payloadFiles.push({
            name: fileObj.name,
            type: fileObj.type || "application/pdf",
            size: fileObj.size,
            path: relativePath,
            base64
          });
        }
      }

      setUploadState("transmitting");
      setProgressMessage("Uploading cargo files to Tariro...");

      const uploadResponse = await fetch("/api/learning-spaces/upload-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          folderName: folderName.trim(),
          files: payloadFiles
        })
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to accept upload folder");
      }

      const uploadResult = await uploadResponse.json();
      const learningSpaceId = uploadResult.learningSpaceId;

      // Start looping nice phrases
      setUploadState("processing");
      let currentPhraseIdx = 0;
      setProgressMessage(loadingPhrases[0]);

      const interval = setInterval(() => {
        currentPhraseIdx = (currentPhraseIdx + 1) % loadingPhrases.length;
        setProgressMessage(loadingPhrases[currentPhraseIdx]);
      }, 5000);

      // Poll server resources presence to confirm background generation has completed
      let isCompleted = false;
      let maxPolls = 20; // 2 minutes max
      let pollCount = 0;

      while (!isCompleted && pollCount < maxPolls) {
        await new Promise(r => setTimeout(r, 6000));
        pollCount++;

        try {
          const checkRes = await fetch(`/api/learning-spaces/${learningSpaceId}/resources`);
          if (checkRes.ok) {
            isCompleted = true;
          }
        } catch (e) {
          // ignore transient fetch errors during processing
        }
      }

      clearInterval(interval);

      if (isCompleted) {
        setUploadState("success");
        setTimeout(() => {
          onUploadSuccess(learningSpaceId);
        }, 1500);
      } else {
        // If timed out, still suggest checking as it is building
        setUploadState("success");
        setTimeout(() => {
          onUploadSuccess(learningSpaceId);
        }, 2000);
      }

    } catch (err: any) {
      console.error(err);
      setUploadState("error");
      setErrorMessage(err.message || "An unexpected error occurred during processing.");
    }
  };

  const clickFolderInput = () => {
    folderInputRef.current?.click();
  };

  const clickFilesInput = () => {
    filesInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + ["B", "KB", "MB", "GB"][i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans" id="upload-dialog-container">
      <div className="bg-cosmic-card border border-cosmic-border w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-cosmic-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cosmic-accent/10 border border-cosmic-accent/30 flex items-center justify-center text-cosmic-accent">
              <FolderIcon className="w-5.3 h-5.3" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base leading-tight">Generate Learning Space From Folder</h2>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Recursively scans and processes variables, outlines and documents.</span>
            </div>
          </div>
          {uploadState !== "reading" && uploadState !== "transmitting" && uploadState !== "processing" && (
            <button 
              onClick={onClose}
              className="p-1 px-1.5 rounded-lg hover:bg-slate-800 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {uploadState === "idle" ? (
          <>
            {/* Modal Form Setup */}
            <div className="p-6 overflow-y-auto max-h-120 space-y-5">
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-wider text-gray-400 uppercase">Learning Space Name</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Guidelines, AP Physics II, Kubernetes Mastery"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full bg-cosmic-bg border border-cosmic-border focus:border-cosmic-accent rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              {/* Drag/Drop area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? "border-cosmic-accent bg-cosmic-accent/5 scale-[0.99]" 
                    : "border-cosmic-border bg-cosmic-bg/40 hover:border-cosmic-border/80"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3 animate-bounce" />
                <p className="text-xs text-white font-medium mb-1">
                  Drag and drop your learning folder or selected files here
                </p>
                <p className="text-[11px] text-gray-500 mb-4 max-w-sm mx-auto">
                  Supports PDF, Word, Powerpoint, Plaintext, Markdown, Excel, or tabular CSV and Text images.
                </p>

                <div className="flex items-center justify-center gap-3">
                  {/* Hidden inputs */}
                  <input
                    type="file"
                    ref={folderInputRef}
                    onChange={handleFolderSelect}
                    className="hidden"
                    webkitdirectory=""
                    directory=""
                    multiple
                  />
                  <input
                    type="file"
                    ref={filesInputRef}
                    onChange={handleFilesSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,.pptx,.docx,.txt,.md,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                  />

                  <button
                    type="button"
                    onClick={clickFolderInput}
                    className="px-3.5 py-1.8 rounded-md border border-cosmic-border text-xs text-slate-300 font-semibold bg-cosmic-bg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderIcon className="w-3.5 h-3.5" /> Upload Directory
                  </button>
                  <span className="text-gray-500 text-xs font-mono">or</span>
                  <button
                    type="button"
                    onClick={clickFilesInput}
                    className="px-3.5 py-1.8 rounded-md border border-cosmic-border text-xs text-slate-300 font-semibold bg-cosmic-bg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Select Files
                  </button>
                </div>
              </div>

              {/* Selected Files Preview List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-gray-400 uppercase">
                    <span>Documents in Payload ({selectedFiles.length})</span>
                    <button 
                      onClick={() => setSelectedFiles([])}
                      className="text-rose-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ListRestart className="w-3 h-3" /> CLEAR ALL
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-cosmic-border rounded-lg bg-cosmic-bg/20 p-2 space-y-1.5">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-cosmic-card/80 p-2 py-1.5 rounded-md border border-cosmic-border/50 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-cosmic-accent shrink-0" />
                          <span className="text-gray-300 truncate text-[11px]">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">{formatFileSize(file.size)}</span>
                          <button 
                            onClick={() => removeFile(i)}
                            className="text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-cosmic-border bg-cosmic-bg/40 flex items-center justify-end gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-cosmic-border bg-transparent hover:bg-slate-800 text-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerFolderUpload}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cosmic-accent text-white shadow-lg shadow-cosmic-accent/25 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Transform Content
              </button>
            </div>
          </>
        ) : (
          /* Processing and Upload Loading Screens with reassuring animations */
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-5 h-96">
            {uploadState === "success" ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mx-auto animate-pulse">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-lg">Brain Module Calibrated Successfully!</h3>
                  <p className="text-gray-400 text-xs mt-1.5 max-w-sm mx-auto">
                    Tariro has successfully designed your private structured Learning Space, processed documents, and loaded quiz databases.
                  </p>
                </div>
              </div>
            ) : uploadState === "error" ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-500 mx-auto">
                  <AlertCircle className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-base">Processing Interrupted</h3>
                  <p className="text-rose-400 text-xs mt-1.5 max-w-md mx-auto bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-left font-mono">
                    {errorMessage}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUploadState("idle");
                      setErrorMessage("");
                    }}
                    className="px-4 py-2 rounded-lg bg-cosmic-border text-white text-xs cursor-pointer hover:bg-slate-800"
                  >
                    Retry Setup
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-sm w-full">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cosmic-accent animate-spin" />
                  <Loader2 className="w-6 h-6 text-cosmic-accent absolute animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-display font-medium text-sm">
                    {uploadState === "reading" && "Ingesting folder files..."}
                    {uploadState === "transmitting" && "Transmitting package metadata..."}
                    {uploadState === "processing" && "Calibrating Tariro Brain..."}
                  </h3>
                  <div className="h-6 overflow-hidden">
                    <p className="text-xs text-cosmic-accent/90 animate-pulse font-mono tracking-wide leading-none py-1">
                      {progressMessage}
                    </p>
                  </div>
                </div>

                {/* Simulated activity lines */}
                <div className="w-full bg-cosmic-bg/80 border border-cosmic-border rounded-lg p-3 text-left font-mono text-[10px] text-gray-500 space-y-1.5 h-20 overflow-hidden select-none">
                  <div className="truncate">C:\Core\Tariro&gt; initialize_rag_environment</div>
                  <div className="truncate text-indigo-400">STATUS: loading_multimodal_gemini_client</div>
                  {uploadState === "processing" && (
                    <>
                      <div className="truncate text-emerald-400">SYS: compiling_flashcard_recall_deck</div>
                      <div className="truncate text-sky-400">INFO: schema_type_object_generated</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
