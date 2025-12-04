"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
const CHUNK_SIZE = 64 * 1024; // 64 KB chunks keep memory in check
const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? "ws://localhost:5000/ws";

type TransferRole = "sender" | "receiver";
type SignalType = "join" | "peer-joined" | "offer" | "answer" | "candidate";

interface SignalPayload<T = unknown> {
  type: SignalType;
  payload?: {
    clientId?: string;
    data?: T;
    role?: TransferRole;
  };
}

interface FileMeta {
  name: string;
  size: number;
  mimeType: string;
}

interface ReceivedFile extends FileMeta {
  downloadUrl: string;
}

interface UseFileTransferSessionOptions {
  role: TransferRole;
}

interface UseFileTransferSessionResult {
  role: TransferRole;
  roomId: string;
  status: string;
  connectionState: RTCPeerConnectionState | "idle";
  progress: number;
  error: string | null;
  receivedFile: ReceivedFile | null;
  generateRoomId: () => string;
  connectToRoom: (roomId?: string) => Promise<void>;
  disconnect: () => void;
  sendFile: (file: File, meta?: { fileType?: string }) => Promise<void>;
  resetReceivedFile: () => void;
}

const waitForBufferDrain = (channel: RTCDataChannel) =>
  new Promise<void>((resolve) => {
    const poll = () => {
      if (channel.bufferedAmount < CHUNK_SIZE * 16 || channel.readyState !== "open") {
        resolve();
        return;
      }
      setTimeout(poll, 25);
    };
    poll();
  });

export const useFileTransferSession = ({ role }: UseFileTransferSessionOptions): UseFileTransferSessionResult => {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("idle");
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | "idle">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [receivedFileState, setReceivedFileState] = useState<ReceivedFile | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const fileMetaRef = useRef<FileMeta | null>(null);
  const fileChunksRef = useRef<BlobPart[]>([]);
  const receivedBytesRef = useRef(0);
  const activeRoomRef = useRef("");
  const clientIdRef = useRef<string>(typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10));

  const cleanupDataChannel = useCallback(() => {
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (err) {
        console.warn("Failed to close data channel", err);
      }
      dataChannelRef.current.onopen = null;
      dataChannelRef.current.onclose = null;
      dataChannelRef.current.onmessage = null;
      dataChannelRef.current.onerror = null;
      dataChannelRef.current = null;
    }
  }, []);

  const cleanupPeerConnection = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.ondatachannel = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    cleanupDataChannel();
  }, [cleanupDataChannel]);

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const updateReceivedFile = useCallback((next: ReceivedFile | null) => {
    setReceivedFileState((prev) => {
      if (prev?.downloadUrl && prev.downloadUrl !== next?.downloadUrl) {
        URL.revokeObjectURL(prev.downloadUrl);
      }
      return next ?? null;
    });
  }, []);

  const resetReceivedFile = useCallback(() => {
    updateReceivedFile(null);
    fileMetaRef.current = null;
    fileChunksRef.current = [];
    receivedBytesRef.current = 0;
    setProgress(0);
  }, [updateReceivedFile]);

  const disconnect = useCallback(() => {
    cleanupWebSocket();
    cleanupPeerConnection();
    setStatus("idle");
    setConnectionState("idle");
    setProgress(0);
    setError(null);
  }, [cleanupPeerConnection, cleanupWebSocket]);

  useEffect(
    () => () => {
      disconnect();
      updateReceivedFile(null);
    },
    [disconnect, updateReceivedFile]
  );

  const handleStringChannelMessage = useCallback(
    (raw: string) => {
      try {
        const payload = JSON.parse(raw);
        if (payload?.type === "file-meta") {
          fileMetaRef.current = payload.meta as FileMeta;
          receivedBytesRef.current = 0;
          fileChunksRef.current = [];
          setProgress(0);
          setStatus(`Receiving ${payload.meta?.name ?? "file"}...`);
        } else if (payload?.type === "file-complete" && fileMetaRef.current) {
          const blob = new Blob(fileChunksRef.current, { type: fileMetaRef.current.mimeType });
          const downloadUrl = URL.createObjectURL(blob);
          updateReceivedFile({
            ...fileMetaRef.current,
            downloadUrl,
          });
          setProgress(100);
          setStatus("File received. Ready to download.");
          fileChunksRef.current = [];
        }
      } catch (err) {
        console.error("Failed to parse data channel message", err);
      }
    },
    [updateReceivedFile]
  );

  const handleBinaryChannelMessage = useCallback((chunk: ArrayBuffer) => {
    if (!fileMetaRef.current) return;
    fileChunksRef.current.push(chunk);
    receivedBytesRef.current += chunk.byteLength;

    const percent = Math.min(100, (receivedBytesRef.current / fileMetaRef.current.size) * 100);
    setProgress(Number(percent.toFixed(2)));
  }, []);

  const setupDataChannel = useCallback(
    (channel: RTCDataChannel) => {
      cleanupDataChannel();
      dataChannelRef.current = channel;
      channel.binaryType = "arraybuffer";

      channel.onopen = () => {
        setStatus(role === "sender" ? "Secure channel ready. Select a file to start transfer." : "Secure channel ready. Waiting for the sender.");
      };

      channel.onclose = () => {
        setStatus("Data channel closed");
        setConnectionState("disconnected");
      };

      channel.onerror = () => {
        setError("Data channel error");
        setStatus("Data channel error");
      };

      channel.onmessage = (event) => {
        if (typeof event.data === "string") {
          handleStringChannelMessage(event.data);
          return;
        }

        if (event.data instanceof ArrayBuffer) {
          handleBinaryChannelMessage(event.data);
          return;
        }

        if (event.data instanceof Blob) {
          event.data.arrayBuffer().then(handleBinaryChannelMessage);
        }
      };
    },
    [cleanupDataChannel, handleBinaryChannelMessage, handleStringChannelMessage, role]
  );

  const sendSignal = useCallback((type: Exclude<SignalType, "join" | "peer-joined">, data: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type,
        roomId: activeRoomRef.current,
        payload: {
          clientId: clientIdRef.current,
          data,
        },
      })
    );
  }, []);

  const initPeerConnection = useCallback(() => {
    cleanupPeerConnection();
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }, { urls: "stun:stun2.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("candidate", event.candidate.toJSON());
      }
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
      if (["failed", "disconnected"].includes(peer.connectionState)) {
        setStatus("Peer connection lost");
      }
    };

    if (role === "sender") {
      const channel = peer.createDataChannel("file-transfer", { ordered: true });
      setupDataChannel(channel);
    } else {
      peer.ondatachannel = (event) => setupDataChannel(event.channel);
    }

    peerRef.current = peer;
  }, [cleanupPeerConnection, role, sendSignal, setupDataChannel]);

  const createAndSendOffer = useCallback(async () => {
    if (!peerRef.current) {
      initPeerConnection();
    }
    if (!peerRef.current) return;
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    sendSignal("offer", offer);
    setStatus("Offer sent. Waiting for answer...");
  }, [initPeerConnection, sendSignal]);

  const acceptRemoteOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (!peerRef.current) {
        initPeerConnection();
      }
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(offer);
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      sendSignal("answer", answer);
      setStatus("Answer sent. Waiting for secure channel...");
    },
    [initPeerConnection, sendSignal]
  );

  const acceptRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;
    await peerRef.current.setRemoteDescription(answer);
    setStatus("Remote answer applied. Ready to transfer.");
  }, []);

  const handleSignal = useCallback(
    async (message: SignalPayload) => {
      if (message.payload?.clientId && message.payload.clientId === clientIdRef.current) {
        return;
      }

      switch (message.type) {
        case "peer-joined":
          if (role === "sender") {
            setStatus("Recipient joined. Negotiating connection...");
            await createAndSendOffer();
          }
          break;
        case "offer":
          if (role === "receiver" && message.payload?.data) {
            await acceptRemoteOffer(message.payload.data as RTCSessionDescriptionInit);
          }
          break;
        case "answer":
          if (role === "sender" && message.payload?.data) {
            await acceptRemoteAnswer(message.payload.data as RTCSessionDescriptionInit);
          }
          break;
        case "candidate":
          if (message.payload?.data && peerRef.current) {
            try {
              await peerRef.current.addIceCandidate(message.payload.data as RTCIceCandidateInit);
            } catch (err) {
              console.error("Failed to add remote ICE candidate", err);
            }
          }
          break;
        default:
          break;
      }
    },
    [acceptRemoteAnswer, acceptRemoteOffer, createAndSendOffer, role]
  );

  const connectToRoom = useCallback(
    async (providedRoomId?: string) => {
      const targetRoomId = (providedRoomId ?? roomId).trim();
      if (!targetRoomId) {
        throw new Error("Room ID is required");
      }

      activeRoomRef.current = targetRoomId;
      setRoomId(targetRoomId);
      setProgress(0);
      setError(null);
      updateReceivedFile(null);
      fileMetaRef.current = null;
      fileChunksRef.current = [];
      receivedBytesRef.current = 0;

      cleanupWebSocket();
      initPeerConnection();

      setStatus("Connecting to signaling server...");

      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(SIGNALING_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setStatus(role === "sender" ? "Waiting for recipient to join..." : "Waiting for sender to share an offer...");
          ws.send(
            JSON.stringify({
              type: "join",
              roomId: targetRoomId,
              payload: { clientId: clientIdRef.current, role },
            })
          );
          resolve();
        };

        ws.onerror = () => {
          setError("Failed to connect to signaling server");
          setStatus("Signaling error");
          reject(new Error("Signaling connection failed"));
        };

        ws.onclose = () => {
          setStatus("Disconnected");
          setConnectionState("disconnected");
        };

        ws.onmessage = (event) => {
          if (typeof event.data !== "string") return;
          try {
            const parsed = JSON.parse(event.data);
            handleSignal(parsed);
          } catch (err) {
            console.error("Invalid signaling payload", err);
          }
        };
      });
    },
    [cleanupWebSocket, handleSignal, initPeerConnection, role, roomId, updateReceivedFile]
  );

  const generateRoomId = useCallback(() => {
    const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID().replace(/-/g, "").slice(0, 8) : Math.random().toString(36).slice(2, 10);
    setRoomId(id);
    return id;
  }, []);

  const sendFile = useCallback(
    async (file: File, meta?: { fileType?: string }) => {
      try {
        if (role !== "sender") {
          throw new Error("Only senders can push files");
        }
        if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
          throw new Error("Secure data channel is not ready yet");
        }
        if (!file) {
          throw new Error("Please select a file");
        }
        if (file.size === 0) {
          throw new Error("Cannot transfer an empty file");
        }
        if (file.size > MAX_FILE_BYTES) {
          throw new Error("File exceeds the 5 GB limit");
        }

        const mimeType = meta?.fileType || file.type || "application/octet-stream";
        setStatus(`Sending ${file.name}...`);
        setProgress(0);

        dataChannelRef.current.send(
          JSON.stringify({
            type: "file-meta",
            meta: {
              name: file.name,
              size: file.size,
              mimeType,
            },
          })
        );

        let offset = 0;
        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);
          const buffer = await chunk.arrayBuffer();
          dataChannelRef.current.send(buffer);
          offset += chunk.size;
          const percent = Math.min(100, (offset / file.size) * 100);
          setProgress(Number(percent.toFixed(2)));

          if (dataChannelRef.current.bufferedAmount > CHUNK_SIZE * 32) {
            await waitForBufferDrain(dataChannelRef.current);
          }
        }

        dataChannelRef.current.send(JSON.stringify({ type: "file-complete" }));
        setStatus("File sent successfully.");
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send file";
        setError(message);
        setStatus("Transfer failed");
        throw err;
      }
    },
    [role]
  );

  return {
    role,
    roomId,
    status,
    connectionState,
    progress,
    error,
    receivedFile: receivedFileState,
    generateRoomId,
    connectToRoom,
    disconnect,
    sendFile,
    resetReceivedFile,
  };
};
