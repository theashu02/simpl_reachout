import { Elysia, t } from "elysia";

export const fileTransferWs = new Elysia({ name: "file-transfer-ws" }).ws("/ws", {
  body: t.Object({
    type: t.String(),
    roomId: t.String(),
    payload: t.Any(),
  }),
  open(ws) {
    console.log(`[WS] Client connected: ${ws.id}`);
  },
  message(ws, message) {
    const { type, roomId, payload } = message;

    if (type === "join") {
      ws.subscribe(roomId);
      // Notify others in the room that a peer joined (triggers Sender to start offer)
      ws.publish(roomId, { type: "peer-joined", senderId: ws.id, payload: {} });
      console.log(`[WS] ${ws.id} joined ${roomId}`);
      return;
    }

    // Relay signal (Offer/Answer/Candidate) to others in the room
    ws.publish(roomId, {
      type,
      payload,
      senderId: ws.id,
    });
  },
  close(ws) {
    console.log(`[WS] Client disconnected: ${ws.id}`);
  },
});
