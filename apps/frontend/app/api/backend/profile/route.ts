import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:5000";

const protectedPath = "/api/protected/profile";

export async function GET(req: NextRequest) {
  const rawToken = await getToken({ req, raw: true });

  if (!rawToken) {
    return NextResponse.json({ message: "You must be signed in to call the backend microservice." }, { status: 401 });
  }

  const targetUrl = `${backendBaseUrl}${protectedPath}`;

  try {
    const backendResponse = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${rawToken}`,
      },
      cache: "no-store",
    });

    const responseBody = await backendResponse.json().catch(() => ({ message: "Backend returned a non-JSON payload." }));

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("[frontend] Unable to reach backend microservice:", error);
    return NextResponse.json(
      {
        message: "Backend microservice is unavailable. Ensure it is running on port 5000.",
      },
      { status: 502 }
    );
  }
}
