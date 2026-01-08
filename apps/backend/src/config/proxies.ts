export interface TorProxyConfig {
  enabled: boolean;
  proxyUrl: string;
  controlPort: number;
  controlPassword?: string;
  rotateInterval: number;
  primaryWeight: number;
  testUrl: string;
  maxRetries: number;
}

export const TOR_CONFIG: TorProxyConfig = {
  enabled: true,
  proxyUrl: "socks5://127.0.0.1:9050",
  controlPort: 9051,
  controlPassword: "",
  rotateInterval: 5,
  primaryWeight: 1.0,
  testUrl: "http://httpbin.org/ip",
  maxRetries: 3,
};