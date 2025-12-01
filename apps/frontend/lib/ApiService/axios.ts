import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getToken } from "next-auth/jwt";
import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";
import { BACKEND_BASE_URL } from "../constants";

export const createApiClient = async (req: NextApiRequest | NextRequest): Promise<AxiosInstance> => {
  const rawToken = await getToken({ req, raw: true });

  const api = axios.create({
    baseURL: BACKEND_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });

  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (rawToken) {
        config.headers.Authorization = `Bearer ${rawToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return api;
};
