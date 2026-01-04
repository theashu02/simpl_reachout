export type ProxyProvider = "brightdata" | "smartproxy" | "oxylabs" | "iproyal" | "custom";

export interface SingleProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

export interface RotationProxyConfig {
  provider: ProxyProvider;
  credentials: {
    username: string;
    password: string;
  };
  session?: string;
  country?: string;
}

export interface ProxyConfig {
  single: SingleProxyConfig | null;
  rotation: RotationProxyConfig | null;
}

export const PROXY_CONFIG: ProxyConfig = {
  single: null,
  rotation: null,
};
