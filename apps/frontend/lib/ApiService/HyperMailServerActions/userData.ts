"use server";

import { BACKEND_BASE_URL } from "@/lib/constants";
import { getJwtToken } from "@/lib/token";
import axios from "axios";

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
  const jwtToken = await getJwtToken();

  try {
    const api = axios.create({
      baseURL: BACKEND_BASE_URL,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
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
