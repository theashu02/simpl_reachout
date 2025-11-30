"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileTransferSession } from "../hooks/useFileTransferSession";

const FILE_TYPES = [
  { label: "Auto detect", value: "auto" },
  { label: "Document", value: "application/pdf" },
  { label: "Image", value: "image/*" },
  { label: "Video", value: "video/*" },
  { label: "Archive", value: "application/zip" },
  { label: "Custom binary", value: "application/octet-stream" },
];

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 1 : 2)} ${units[unitIndex]}`;
};

export default function SendFilePage() {
  const { roomId, status, progress, error, generateRoomId, connectToRoom, sendFile } = useFileTransferSession({
    role: "sender",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("auto");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return "No file selected";
    return `${selectedFile.name} • ${formatBytes(selectedFile.size)}`;
  }, [selectedFile]);

  const handleRoomGeneration = async () => {
    try {
      setLocalError(null);
      setIsConnecting(true);
      const id = generateRoomId();
      await connectToRoom(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create room";
      setLocalError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLocalError(null);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLocalError(null);
    }
  };

  const handleSend = async () => {
    if (!selectedFile) return;
    try {
      setLocalError(null);
      setIsSending(true);
      await sendFile(selectedFile, { fileType: fileType === "auto" ? undefined : fileType });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send file";
      setLocalError(message);
    } finally {
      setIsSending(false);
    }
  };

  const copyRoomId = async () => {
    if (!roomId || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disableSend = !selectedFile || !roomId || isSending;
  const feedback = localError ?? error;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/products/EncryptFileShare">
            <ArrowLeft className="size-4" />
            Back to actions
          </Link>
        </Button>
        <div className="text-right">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Step 1</p>
          <h1 className="text-2xl font-semibold">Create a room & send a file</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>File to transfer</CardTitle>
            <CardDescription>Drag and drop any file up to 5 GB or use the picker below. Transfers happen peer-to-peer over an encrypted WebRTC data channel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center transition hover:border-primary">
              <UploadCloud className="mb-4 size-10 text-primary" />
              <p className="text-lg font-medium text-foreground">Click to browse or drop file here</p>
              <p className="text-sm text-muted-foreground">{selectedFile ? fileSummary : "Any type is supported. Maximum size 5 GB."}</p>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">File type hint</span>
                <select value={fileType} onChange={(event) => setFileType(event.target.value)} className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {FILE_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Optional hint for the recipient&apos;s download dialog.</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Room connection</span>
                <div className="flex items-center gap-3">
                  <Button className="flex-1" onClick={handleRoomGeneration} disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Preparing room...
                      </>
                    ) : (
                      "Generate room ID"
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="icon" disabled={!roomId} onClick={copyRoomId} aria-label="Copy room ID">
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share the generated ID securely with your recipient.</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={handleSend} disabled={disableSend} className="h-12 w-full text-base font-semibold">
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Sending file...
                  </>
                ) : (
                  "Start transfer"
                )}
              </Button>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">Status</p>
                <p className="text-sm text-muted-foreground">{status}</p>
                {(progress ?? 0) > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                )}
                {feedback && <p className="mt-3 text-sm text-destructive">{feedback}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Room details</CardTitle>
            <CardDescription>Share this short room ID with the recipient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Room ID</span>
              <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-lg font-semibold tracking-[0.2em]">{roomId || "--------"}</div>
            </div>
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How it works</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Generate a room ID and share it privately.</li>
                <li>Wait for the recipient to join the room.</li>
                <li>Start the transfer once the secure channel is ready.</li>
              </ul>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-sm text-secondary-foreground">
              <p className="font-semibold text-foreground">Transfer limit</p>
              <p>Files up to 5 GB are supported. Larger files require chunking outside the browser.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
