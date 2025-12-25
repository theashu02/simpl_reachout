import { Elysia, t } from "elysia";
import { authenticateRequest } from "../../middleware/VerifyUser";

type TransferRole = "sender" | "receiver";

const isTransferRole = (value: unknown): value is TransferRole => value === "sender" || value === "receiver";

const normalizeRoomId = (roomId: string) => roomId.trim().toLowerCase();

// Track active connections per room and rooms/roles per socket for cleanup
const activeRooms = new Map<string, Set<string>>();
const socketRooms = new Map<string, Set<string>>();
const socketRoles = new Map<string, TransferRole>();

export const getRoomSnapshot = (roomId: string) => {
  const normalized = normalizeRoomId(roomId);
  const members = activeRooms.get(normalized) ?? new Set<string>();
  const peers = Array.from(members);
  const senderPresent = peers.some((peerId) => socketRoles.get(peerId) === "sender");

  return {
    roomId: normalized,
    peersCount: peers.length,
    senderPresent,
    peers,
  };
};

export const fileTransferWs = new Elysia({ name: "file-transfer-ws" })
  .derive(async ({ request, set }) => {
    try {
      const user = await authenticateRequest(request);
      return { user };
    } catch (error) {
      set.status = 401;
      throw error instanceof Error ? error : new Error("Unauthorized");
    }
  })
  .ws("/ws", {
    body: t.Object({
      type: t.String(),
      roomId: t.String(),
      payload: t.Any(),
    }),

    open(ws) {
      socketRooms.set(ws.id, new Set());
      console.log(`[WS] Connected: ${ws.id}`);
    },

    message(ws, message) {
      try {
        const { type, roomId, payload } = message;
        const normalizedRoomId = typeof roomId === "string" ? normalizeRoomId(roomId) : "";

        if (!normalizedRoomId) {
          ws.send({ type: "error", payload: "Invalid room ID" });
          return;
        }

        if (type === "join") {
          ws.subscribe(normalizedRoomId);

          const rooms = socketRooms.get(ws.id) ?? new Set<string>();
          rooms.add(normalizedRoomId);
          socketRooms.set(ws.id, rooms);

          const role: TransferRole = isTransferRole(payload?.role) ? payload.role : "receiver";
          socketRoles.set(ws.id, role);

          if (!activeRooms.has(normalizedRoomId)) {
            activeRooms.set(normalizedRoomId, new Set());
          }
          const roomPeers = activeRooms.get(normalizedRoomId)!;
          roomPeers.add(ws.id);

          ws.publish(normalizedRoomId, {
            type: "peer-joined",
            senderId: ws.id,
            payload: {
              peersCount: roomPeers.size,
            },
          });

          console.log(`[Room] ${ws.id} joined ${normalizedRoomId} (${roomPeers.size} peers, role: ${role})`);
          return;
        }

        ws.publish(normalizedRoomId, {
          type,
          payload,
          senderId: ws.id,
        });
      } catch (error) {
        console.error(`[WS] Error:`, error);
        ws.send({ type: "error", payload: "Processing failed" });
      }
    },

    close(ws) {
      const rooms = socketRooms.get(ws.id);
      if (rooms) {
        rooms.forEach((roomId) => {
          const room = activeRooms.get(roomId);
          if (!room) return;

          room.delete(ws.id);

          ws.publish(roomId, {
            type: "peer-left",
            senderId: ws.id,
            payload: { peersCount: room.size },
          });

          if (room.size === 0) {
            activeRooms.delete(roomId);
          }
        });

        socketRooms.delete(ws.id);
      }

      socketRoles.delete(ws.id);

      console.log(`[WS] Disconnected: ${ws.id}`);
    },
  });
