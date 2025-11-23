"use server";

import { authOptions } from "@/lib/auth/options";
import { BACKEND_BASE_URL } from "@/lib/constants";
import axios from "axios";
import { getServerSession } from "next-auth";

export type BackendUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
};

export type BackendResponse = {
  status: "ok" | string;
  message: string;
  user?: BackendUser;
};

export async function GetUserData() {
  const session = await getServerSession(authOptions);

  if (!session?.rawJwt) {
    const errorResp: BackendResponse = {
      status: "error",
      message: "User not authenticated",
      user: undefined,
    };

    return { status: 401, data: errorResp };
  }

  try {
    const api = axios.create({
      baseURL: BACKEND_BASE_URL,
      headers: {
        Authorization: `Bearer ${session.rawJwt}`,
        "Content-Type": "application/json",
      },
    });

    const res = await api.get<BackendResponse>("/api/protected/profile");

    return {
      status: res.status,
      data: res.data,
    };
  }

  catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const fallback: BackendResponse = {
        status: "error",
        message: err.response.data?.message ?? "Error",
        user: undefined,
      };
      return {
        status: err.response.status,
        data: fallback,
      };
    }

    const fallback: BackendResponse = {
      status: "error",
      message: "Backend microservice unavailable",
      user: undefined,
    };

    return { status: 500, data: fallback };
  }
}
