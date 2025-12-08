"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Radio, Sparkles, Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FlowState = "idle" | "checking" | "waiting" | "ready" | "error";

interface RoomStatusResponse {
  status: string;
  message?: string;
  roomId: string;
  peersCount?: number;
  senderPresent?: boolean;
}

const statusEndpoint = (roomId: string) => `/api/file-transfer/rooms/${encodeURIComponent(roomId)}/status`;

export default function JoinRoomEntryPage() {
  const router = useRouter();
  const [roomInput, setRoomInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [statusMessage, setStatusMessage] = useState("Preparing verification...");
  const [lastCheckedRoom, setLastCheckedRoom] = useState("");
  const lastCheckedRoomDisplay = lastCheckedRoom ? lastCheckedRoom.toUpperCase() : "";
  const [peersCount, setPeersCount] = useState(0);
  const [senderPresent, setSenderPresent] = useState(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const clearRedirect = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPoll();
      clearRedirect();
    };
  }, [clearPoll, clearRedirect]);

  const fetchRoomStatus = useCallback(async (roomId: string): Promise<RoomStatusResponse> => {
    const canonicalId = roomId.trim().toLowerCase();
    const response = await fetch(statusEndpoint(canonicalId), { method: "GET", cache: "no-store" });
    const payload = await response.json().catch(() => ({
      status: "error",
      message: "Unexpected response from signaling service",
      roomId: canonicalId,
    }));

    if (!response.ok) {
      const reason = payload?.message ?? "Unable to verify this room. Please try again.";
      throw new Error(reason);
    }

    return payload;
  }, []);

  const checkRoomStatus = useCallback(
    async (targetRoomId: string, isRetry = false) => {
      setFlowState(isRetry ? "waiting" : "checking");
      setStatusMessage(isRetry ? "Re-checking room status..." : "Validating room ID...");
      setLastCheckedRoom(targetRoomId);

      try {
        const payload = await fetchRoomStatus(targetRoomId);
        setPeersCount(payload.peersCount ?? 0);
        setSenderPresent(Boolean(payload.senderPresent));
        const senderOnline = Boolean(payload.senderPresent);
        const nextMessage = senderOnline
          ? payload.message ?? "Sender is online. Connecting you now..."
          : "Room verified. We’ll wait inside for the sender.";
        const nextState: FlowState = senderOnline ? "ready" : "waiting";

        setStatusMessage(nextMessage);
        setFlowState(nextState);
        clearPoll();
        clearRedirect();
        redirectTimeoutRef.current = setTimeout(() => {
          router.push(`/products/EncryptFileShare/join/${targetRoomId}`);
        }, senderOnline ? 900 : 1300);
      } catch (error) {
        clearPoll();
        clearRedirect();
        setFlowState("error");
        const reason = error instanceof Error ? error.message : "Unable to contact the signaling service.";
        setStatusMessage(reason);
      }
    },
    [clearPoll, clearRedirect, fetchRoomStatus, router]
  );

  const handleJoin = async () => {
    const normalized = roomInput.trim().toUpperCase();
    const canonical = normalized.toLowerCase();

    if (!normalized) {
      setFormError("Room ID is required");
      return;
    }

    setFormError(null);
    setOverlayOpen(true);
    setFlowState("checking");
    setStatusMessage("Validating room ID...");
    setLastCheckedRoom(canonical);
    clearPoll();
    void checkRoomStatus(canonical);
  };

  const closeOverlay = () => {
    clearPoll();
    clearRedirect();
    setOverlayOpen(false);
    setFlowState("idle");
    setStatusMessage("Preparing verification...");
    setSenderPresent(false);
    setPeersCount(0);
  };

  const retryNow = () => {
    if (!lastCheckedRoom) return;
    clearPoll();
    clearRedirect();
    void checkRoomStatus(lastCheckedRoom);
  };

  const statusChecklist = [
    {
      key: "validation",
      label: "Room validation",
      description: lastCheckedRoom ? `Confirming room ${lastCheckedRoomDisplay || lastCheckedRoom}` : "Waiting for a room ID",
      active: flowState === "checking",
      complete: flowState !== "idle" && flowState !== "checking" && flowState !== "error",
      Icon: ShieldCheck,
    },
    {
      key: "sender",
      label: "Sender presence",
      description: senderPresent ? "Sender is online" : "Looking for the sender...",
      active: flowState === "waiting" || flowState === "ready",
      complete: senderPresent,
      Icon: Radio,
    },
    {
      key: "redirect",
      label: "Secure session",
      description: flowState === "ready" ? "Opening secure workspace" : "Launching once everyone is ready",
      active: flowState === "ready",
      complete: flowState === "ready",
      Icon: Sparkles,
    },
  ];

  const disabled = flowState === "checking" || flowState === "waiting" || flowState === "ready";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
      {/* <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2">
          <Link href="/products/EncryptFileShare">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Step 2</p>
          <h1 className="text-2xl font-semibold text-foreground">Join a secure transfer room</h1>
        </div>
      </div> */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/80 bg-linear-to-br from-background to-background/60">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Enter the room ID</CardTitle>
            <CardDescription>Paste or type the 8-character code shared by the sender. We’ll verify the room and confirm the sender is online before connecting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="room-id-field" className="text-sm font-medium text-foreground">
                Room ID
              </label>
              <Input
                id="room-id-field"
                value={roomInput}
                autoComplete="off"
                onChange={(event) => setRoomInput(event.target.value.toUpperCase())}
                placeholder="E.g. 9F27AD5C"
                className="h-12 rounded-xl border-border/70 bg-background/80 text-lg tracking-[0.4em]"
              />
              <p className="text-xs text-muted-foreground">Room IDs are short-lived and expire as soon as either participant disconnects.</p>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 flex-1 rounded-xl text-base font-semibold" onClick={handleJoin} disabled={disabled}>
                {disabled ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Checking room...
                  </>
                ) : (
                  "Start verification"
                )}
              </Button>
              <Button variant="outline" className="h-12 flex-1 rounded-xl border-dashed" onClick={() => setRoomInput("")} disabled={disabled}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/10">
          <CardHeader>
            <CardTitle>Realtime safety check</CardTitle>
            <CardDescription>We validate the room, confirm encrypted signaling is active, and make sure the sender is still connected before we move you into the session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-muted-foreground">What to expect</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Instant validation with the Bun signaling service</li>
                <li>• Automatic detection if the sender disconnects</li>
                <li>• Smooth redirect into the live room once ready</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
              Need help? Ask the sender to copy the ID from their “Share file” screen.
            </div>
          </CardContent>
        </Card>
      </div>

      {overlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition">
          <div className="w-full max-w-lg scale-100 rounded-3xl border border-border/60 bg-linear-to-b from-background to-background/90 p-6 shadow-2xl transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Verification</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  Checking room {lastCheckedRoomDisplay || lastCheckedRoom || "—"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{statusMessage}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full border border-border/70" onClick={closeOverlay}>
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {statusChecklist.map(({ key, label, description, active, complete, Icon }) => (
                <div
                  key={key}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                    complete ? "border-emerald-400/60 bg-emerald-400/5" : active ? "border-primary/60 bg-primary/5" : "border-border/70 bg-background/70"
                  }`}
                >
                  <div
                    className={`mt-1 flex size-11 items-center justify-center rounded-full border ${
                      complete
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {complete ? <CheckCircle2 className="size-5" /> : active ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                <p className="text-xs uppercase tracking-[0.3em]">Participants</p>
                <p className="text-lg font-semibold text-foreground">
                  {Math.max(peersCount, senderPresent ? 1 : 0)}
                  <span className="text-sm text-muted-foreground"> connected</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" className="rounded-full border border-border/60 px-4" onClick={closeOverlay} disabled={flowState === "ready"}>
                  Cancel
                </Button>
                <Button className="rounded-full px-4" variant="outline" onClick={retryNow} disabled={flowState === "ready" || flowState === "waiting" || !lastCheckedRoom}>
                  {flowState === "waiting" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Checking again
                    </>
                  ) : (
                    "Check again"
                  )}
                </Button>
              </div>
            </div>

            {flowState === "error" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-5" />
                <div>
                  <p className="font-semibold">Unable to verify this room</p>
                  <p>Double-check the code with the sender and try again.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
