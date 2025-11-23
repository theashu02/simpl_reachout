'use server'

import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";

export async function getUserToken(req: NextRequest) {
  const rawToken = await getToken({ req, raw: true });

  return rawToken;
}
