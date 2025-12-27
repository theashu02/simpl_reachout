"use server";

import axios from "axios";
import { BACKEND_BASE_URL } from "@/lib/constants";
import { getJwtToken } from "@/lib/token";

export type VerifyMailPayload = {
  email: string;
  password: string;
  host: string;
  port: number;
};

export type VerifyMailResponse = {
  success: boolean;
  message: string;
};

export async function verifyMailCredentials(payload: VerifyMailPayload): Promise<VerifyMailResponse> {
  const token = await getJwtToken();

  if (!token) {
    throw new Error("Authentication required. Please sign in again.");
  }

  try {
    const api = axios.create({
      baseURL: BACKEND_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const response = await api.post<VerifyMailResponse>("/api/protected/verify-mail", {
      email: payload.email,
      appPassword: payload.password, // backend accepts either
      host: payload.host,
      port: payload.port,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message ?? "Verification failed");
    }

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const message = err.response.data?.message ?? "Unable to verify credentials";
      throw new Error(message);
    }

    throw new Error("Backend microservice unavailable");
  }
}
