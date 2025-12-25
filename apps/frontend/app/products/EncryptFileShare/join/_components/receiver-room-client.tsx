"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFileTransferSession } from "../../hooks/useFileTransferSession";

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

export function ReceiverRoomClient() {
  const router = useRouter();
  const routeParams = useParams<{ roomId?: string | string[] }>();
  const rawRoomId = routeParams?.roomId ?? "";
  const resolvedRoomId = Array.isArray(rawRoomId) ? rawRoomId[0] ?? "" : rawRoomId ?? "";
  const normalizedRoomId = useMemo(() => resolvedRoomId.trim().toLowerCase(), [resolvedRoomId]);
  const displayRoomId = normalizedRoomId ? normalizedRoomId.toUpperCase() : "—";
  const { status, progress, error, receivedFile, connectToRoom, resetReceivedFile, disconnect, connectionState } = useFileTransferSession({
    role: "receiver",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWithRoom = useCallback(
    async (targetRoomId?: string) => {
      if (!targetRoomId) {
        return;
      }

      setIsConnecting(true);
      setLocalError(null);

      try {
        await connectToRoom(targetRoomId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to join the room";
        setLocalError(message);
      } finally {
        setIsConnecting(false);
      }
    },
    [connectToRoom]
  );

  useEffect(() => {
    if (!normalizedRoomId) {
      return;
    }
    void connectWithRoom(normalizedRoomId);
  }, [connectWithRoom, normalizedRoomId]);

  useEffect(
    () => () => {
      disconnect();
    },
    [disconnect]
  );

  const feedback = localError ?? error;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      {/* <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2">
          <Link href="/products/EncryptFileShare/join">
            <ArrowLeft className="size-4" />
            Change room
          </Link>
        </Button>
        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Room</p>
          <h1 className="text-2xl font-semibold text-foreground">{displayRoomId}</h1>
          <p className="text-sm text-muted-foreground">You&apos;re moments away from receiving the file.</p>
        </div>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80 bg-linear-to-br from-background to-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="size-5 text-primary" />
              Secure connection status
            </CardTitle>
            <CardDescription>We&apos;ve locked you to room {displayRoomId}. Keep this tab open until the sender finishes the transfer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Realtime status</p>
                  <p className="text-base font-medium text-foreground">{status}</p>
                </div>
                <div className="rounded-full border border-border/50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {connectionState || "idle"}
                </div>
              </div>
              {(progress ?? 0) > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Download progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              )}
              {feedback && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4" />
                  <div>
                    <p className="font-semibold">Connection warning</p>
                    <p>{feedback}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="flex-1 rounded-xl text-base font-semibold" onClick={() => connectWithRoom(normalizedRoomId)} disabled={isConnecting || !normalizedRoomId}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Reconnect"
                )}
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl border-dashed" onClick={() => router.push("/products/EncryptFileShare")}>
                Leave flow
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Room details</CardTitle>
              <CardDescription>Share this page only with the sender. Refreshing will keep you in the same room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em]">Room ID</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{displayRoomId}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em]">Connection state</p>
                <p className="mt-2 text-base font-medium text-foreground">{connectionState}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Transfer result</CardTitle>
              <CardDescription>Files stay in your browser. Download them locally once complete.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {receivedFile ? (
                <>
                  <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
                    <p className="text-base font-semibold text-foreground">{receivedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(receivedFile.size)} • {receivedFile.mimeType}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="gap-2 rounded-xl">
                      <a href={receivedFile.downloadUrl} download={receivedFile.name}>
                        <Download className="size-4" />
                        Download file
                      </a>
                    </Button>
                    <Button variant="ghost" className="gap-2 rounded-xl" onClick={resetReceivedFile}>
                      <RefreshCw className="size-4" />
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  Waiting for the sender to stream the file...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
