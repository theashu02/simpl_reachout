import { test, expect } from "bun:test";

const WS_URL = "ws://localhost:5000/ws";
const ROOM_ID = "test-room-123";

test("Signaling Server: Two clients can exchange messages", async () => {
  // 1. Connect User A
  const clientA = new WebSocket(WS_URL);
  // 2. Connect User B
  const clientB = new WebSocket(WS_URL);

  // Wait for both to open
  await new Promise<void>((resolve) => {
    let connected = 0;
    const check = () => {
      if (++connected === 2) resolve();
    };
    clientA.onopen = check;
    clientB.onopen = check;
  });

  console.log("✅ Both clients connected");

  // 3. Both join the room
  const joinMsg = JSON.stringify({ type: "join", roomId: ROOM_ID, payload: {} });
  clientA.send(joinMsg);
  clientB.send(joinMsg);

  // --- FIX: Race Condition ---
  // Wait for the server to process the subscriptions (Join) before sending messages.
  // Without this, Client A might send the offer before Client B is fully subscribed.
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 4. Setup Listener on Client B (The Receiver)
  const messageReceived = new Promise<any>((resolve) => {
    clientB.onmessage = (event) => {
      const data = JSON.parse(event.data as string);
      // Ignore the "join" reflection if your server sends it back,
      // we care about the message from Client A
      if (data.senderId && data.type === "offer") {
        resolve(data);
      }
    };
  });

  // 5. Client A sends an "Offer" (simulating P2P handshake)
  const offerPayload = { sdp: "dummy-sdp-data", type: "offer" };
  clientA.send(
    JSON.stringify({
      type: "offer",
      roomId: ROOM_ID,
      payload: offerPayload,
    })
  );

  console.log("📨 Client A sent offer...");

  // 6. Verify Client B received it
  const receivedData = await messageReceived;

  console.log("📩 Client B received:", receivedData);

  expect(receivedData.type).toBe("offer");
  expect(receivedData.payload).toEqual(offerPayload);
  expect(receivedData.senderId).toBeDefined();

  // Cleanup
  clientA.close();
  clientB.close();
});
