import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/constants";
import { getJwtToken } from "@/lib/token";

const buildBackendUrl = (roomId: string) => `${BACKEND_BASE_URL.replace(/\/$/, "")}/file-transfer/rooms/${encodeURIComponent(roomId)}/status`;

const extractRoomId = (request: Request, params?: { roomId?: string }) => {
  if (params?.roomId) {
    return params.roomId;
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  // /api/file-transfer/rooms/[roomId]/status -> ['api','file-transfer','rooms',':id','status']
  const slugIndex = segments.findIndex((segment) => segment === "rooms");
  if (slugIndex !== -1 && segments[slugIndex + 1]) {
    return segments[slugIndex + 1];
  }

  return "";
};

export async function GET(request: Request, context: { params: { roomId?: string } }) {
  const roomIdRaw = extractRoomId(request, context?.params);
  const roomId = roomIdRaw?.trim();

  if (!roomId) {
    return NextResponse.json(
      {
        status: "invalid",
        message: "Room ID is required",
        roomId: roomIdRaw ?? null,
      },
      { status: 400 }
    );
  }

  const jwtToken = await getJwtToken();

  if (!jwtToken) {
    return NextResponse.json(
      {
        status: "unauthorized",
        message: "Please sign in to verify room status",
      },
      { status: 401 }
    );
  }

  try {
    const canonicalId = roomId.toLowerCase();
    const response = await fetch(buildBackendUrl(canonicalId), {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({
      status: "error",
      message: "Unable to parse backend response",
    }));

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("[RoomStatus] Failed to reach backend", error);
    return NextResponse.json(
      {
        status: "unavailable",
        message: "Signaling service is not reachable. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}
