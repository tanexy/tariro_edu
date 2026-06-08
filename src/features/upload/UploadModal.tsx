/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Upload,
  FolderIcon,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (spaceId: string) => void;
  workspaceId: string;
}

export default function UploadModal({
  onClose,
  onUploadSuccess,
  workspaceId
}: UploadModalProps) {
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Detect folder name from the first file's webkitRelativePath if available
    let detectedFolder = "";
    const processedFiles = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!detectedFolder && (f as any).webkitRelativePath) {
        detectedFolder = (f as any).webkitRelativePath.split("/")[0];
      }

      const base64 = await toBase64(f);
      processedFiles.push({
        name: f.name,
        size: f.size,
        type: f.type,
        path: (f as any).webkitRelativePath || f.name,
        base64: base64.split(",")[1] // extract raw base64
      });
    }

    if (detectedFolder) setFolderName(detectedFolder);
    setFiles(processedFiles);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async () => {
    if (!folderName || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      const response = await fetch("/api/learning-spaces/upload-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          folderName,
          files
        })
      });

      setUploadProgress(70);
      const data = await response.json();

      if (response.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          onUploadSuccess(data.learningSpaceId);
        }, 500);
      } else {
        setError(data.error || "Upload failed");
        setIsUploading(false);
      }
    } catch (err) {
      setError("Network error. Could not connect to Tariro server.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={!isUploading ? onClose : undefined}
      />

      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Upload className="h-4 w-4" />
            </div>
            <h2 className="font-display font-bold">Initialize Knowledge Core</h2>
          </div>
          {!isUploading && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {!isUploading ? (
            <>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                    files.length > 0 ? "bg-secondary/30 border-primary/50" : "bg-muted/10 border-border hover:bg-muted/20 hover:border-muted-foreground/30"
                  }`}
                >
                  {files.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                        <FolderOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{folderName}</p>
                        <p className="text-xs text-muted-foreground">{files.length} documents identified</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => { setFiles([]); setFolderName(""); }}>
                        Change Folder
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                        <FolderIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-bold mb-1">Select Knowledge Directory</h3>
                      <p className="text-xs text-muted-foreground mb-6 max-w-[240px]">
                        Upload a folder containing PDFs, Word docs, or notes to begin transformation.
                      </p>
                      <label className="relative">
                        <Button className="pointer-events-none">Choose Folder</Button>
                        <input
                          type="file"
                          // @ts-ignore
                          webkitdirectory=""
                          directory=""
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Space Name</label>
                    <input
                      type="text"
                      placeholder="Give this space a name..."
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-primary/30 outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] text-destructive leading-tight">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/20"
                  disabled={files.length === 0 || !folderName}
                  onClick={handleUpload}
                >
                  Transform into Learning Space
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-3 uppercase tracking-tighter">
                  Knowledge extraction and study generation may take 10-20 seconds
                </p>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <Loader2 className="h-8 w-8 text-primary absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-display font-bold">Synthesizing Knowledge Core</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Gemini is parsing your documents and generating interactive study materials.
                </p>
              </div>
              <div className="w-full max-w-[280px] space-y-2">
                <Progress value={uploadProgress} className="h-1.5" />
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase">
                  <span>Extracting Text</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
