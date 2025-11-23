import { encode } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function getJwtToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.email) {
    return null;
  }

  // Create a minimal token payload
  const tokenPayload = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? undefined,
    picture: session.user.image ?? undefined,
    sub: session.user.email,
    iat: Math.floor(Date.now() / 1000),
  };

  // Encode it to JWT
  const jwt = await encode({
    token: tokenPayload,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  return jwt;
}