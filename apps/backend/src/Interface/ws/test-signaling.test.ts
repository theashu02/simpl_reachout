import { test, expect } from "bun:test";

const WS_URL = "ws://localhost:5000/ws";
const ROOM_ID = "test-room-123";

test("Signaling Server: Two clients can exchange messages", async () => {
  const clientA = new WebSocket(WS_URL);
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

  await new Promise((resolve) => setTimeout(resolve, 500));

  // 4. Setup Listener on Client B (The Receiver)
  const messageReceived = new Promise<any>((resolve) => {
    clientB.onmessage = (event) => {
      const data = JSON.parse(event.data as string);
      if (data.senderId && data.type === "offer") {
        resolve(data);
      }
    };
  });

  const offerPayload = { sdp: "dummy-sdp-data", type: "offer" };
  clientA.send(
    JSON.stringify({
      type: "offer",
      roomId: ROOM_ID,
      payload: offerPayload,
    })
  );

  console.log("📨 Client A sent offer...");

  const receivedData = await messageReceived;

  console.log("📩 Client B received:", receivedData);

  expect(receivedData.type).toBe("offer");
  expect(receivedData.payload).toEqual(offerPayload);
  expect(receivedData.senderId).toBeDefined();

  // Cleanup
  clientA.close();
  clientB.close();
});
