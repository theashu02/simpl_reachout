"use client";

import { ChangeEvent, DragEvent, useMemo, useState, useEffect } from "react";
import { Check, ChevronsUpDown, Copy, Loader2, UploadCloud, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFileTransferSession } from "../hooks/useFileTransferSession";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useDispatch } from "react-redux";
import { setRoomId, setRoomStatus, RoomStatus } from "@/lib/store/slices/roomSlice";
import Status from "./status";

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
  // 3. Initialize Dispatch
  const dispatch = useDispatch();

  const { roomId, status, progress, error, generateRoomId, connectToRoom, sendFile } = useFileTransferSession({
    role: "sender",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("auto");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // 4. Sync Room ID to Redux Store
  useEffect(() => {
    dispatch(setRoomId(roomId));
  }, [roomId, dispatch]);

  // 5. Sync Status to Redux Store
  useEffect(() => {
    // We cast status to RoomStatus to ensure it matches the slice type
    dispatch(setRoomStatus(status as RoomStatus));
  }, [status, dispatch]);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return "No file selected";
    return `${selectedFile.name} • ${formatBytes(selectedFile.size)}`;
  }, [selectedFile]);
  const selectedFileTypeLabel = useMemo(() => FILE_TYPES.find((type) => type.value === fileType)?.label ?? "Auto detect", [fileType]);

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
    <div className="mx-auto flex w-full max-w-full flex-col gap-5 px-4 py-2">
      <Status />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-transparent bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Prepare the file</CardTitle>
            <CardDescription>Select your file, create a room ID, and wait for your recipient to hop in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center transition hover:border-primary"
            >
              <UploadCloud className="mb-4 size-12 text-primary" />
              <p className="text-lg font-semibold text-foreground">{selectedFile ? "File loaded" : "Drop a file or browse"}</p>
              <p className="text-sm text-muted-foreground">{selectedFile ? fileSummary : "Up to 5 GB Stays in your browser."}</p>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">File type hint</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-12 w-full items-center justify-between rounded-2xl border border-border/70 bg-background px-4 text-sm font-medium text-foreground transition focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      aria-label="Select file type hint"
                    >
                      <span>{selectedFileTypeLabel}</span>
                      <ChevronsUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-2xl p-1" style={{ width: "var(--radix-dropdown-menu-trigger-width, 15rem)" }}>
                    <DropdownMenuRadioGroup value={fileType} onValueChange={setFileType}>
                      {FILE_TYPES.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Room connection</p>
                <div className="flex items-center gap-3">
                  <Button className="flex-1 rounded-2xl" onClick={handleRoomGeneration} disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Generate ID"
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="rounded-2xl" disabled={!roomId} onClick={copyRoomId} aria-label="Copy room ID">
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share the code only with your recipient.</p>
              </div>
            </div>

            {(progress ?? 0) > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Transfer progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
              </div>
            )}
            {feedback && <p className="mt-3 text-sm text-destructive">{feedback}</p>}

            <Button onClick={handleSend} disabled={disableSend} className="h-12 w-full rounded-2xl text-base font-semibold">
              {isSending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Start transfer"
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-transparent bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Room details</CardTitle>
              <CardDescription>Share this short ID with your recipient.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room ID</p>
                <p className="mt-3 text-2xl font-semibold tracking-[0.25em] text-foreground">{roomId ? roomId.toUpperCase() : "--------"}</p>
              </div>

              <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Rooms close as soon as one participant disconnects.</span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Zap className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Need the checklist?</p>
                    <p>Generate ID → Share → Wait for receiver → Start transfer.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
