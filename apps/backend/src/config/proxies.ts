// proxies.ts
export interface TorProxyConfig {
  enabled: boolean;
  proxyUrl: string;
  controlPort: number;
  controlPassword?: string;
  rotateInterval: number;
  primaryWeight: number;
  testUrl: string;
  maxRetries: number;
  circuitTTL: number; // minutes
}

export const TOR_CONFIG: TorProxyConfig = {
  enabled: true,
  proxyUrl: "socks5://127.0.0.1:9050",
  controlPort: 9051,
  controlPassword: process.env.TOR_CONTROL_PASSWORD || "",
  rotateInterval: 3, // Rotate every 3 requests
  primaryWeight: 1.0,
  testUrl: "http://httpbin.org/ip",
  maxRetries: 3,
  circuitTTL: 5, // 5 minutes per circuit
};