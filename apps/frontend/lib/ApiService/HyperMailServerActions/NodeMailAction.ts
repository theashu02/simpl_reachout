"use server";

import axios from "axios";
import { BACKEND_BASE_URL } from "@/lib/constants";
import { getJwtToken } from "@/lib/token";

interface SuggestionPayload {
  email?: string | null;
  toolName: string;
  useCase: string;
}

export type BackendResponse = {
  success: boolean;
  message: string;
  id?: string;
};

export async function submitToolSuggestion(payload: SuggestionPayload) {
  const token = await getJwtToken();

  try {
    const api = axios.create({
      baseURL: BACKEND_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const response = await api.post("/api/protected/send-info", payload);

    return { success: true, data: response.data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const fallback: BackendResponse = {
        success: false,
        message: err.response.data?.message ?? "Error",
        id: undefined,
      };
      return {
        status: err.response.status,
        data: fallback,
      };
    }

    const fallback: BackendResponse = {
      success: false,
      message: "Backend microservice unavailable",
      id: undefined,
    };

    return { status: 500, data: fallback };
  }
}