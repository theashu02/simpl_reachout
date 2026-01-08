import net from "net";
import { fetch } from "undici";
import { SocksProxyAgent } from "socks-proxy-agent";
import { TOR_CONFIG } from "../config/proxies";

class TorController {
  private requestCount = 0;
  private healthy = false;

  markRequest(): void {
    if (!TOR_CONFIG.enabled) return;
    this.requestCount += 1;

    if (TOR_CONFIG.rotateInterval > 0 && this.requestCount % TOR_CONFIG.rotateInterval === 0) {
      console.log(`TOR: Rotating after ${this.requestCount} requests`);
      void this.forceRotate();
    }
  }

  reset(): void {
    this.requestCount = 0;
    this.healthy = false;
  }

  async forceRotate(): Promise<void> {
    if (!TOR_CONFIG.enabled) return;
    try {
      await this.sendTorCommand("SIGNAL NEWNYM");
      console.log("🟢 TOR: New circuit activated");
      await new Promise((r) => setTimeout(r, 2000)); // Wait for circuit
    } catch (error) {
      console.warn("🟡 TOR: Rotation failed, continuing...", error);
    }
  }

  async verifyConnectivity(): Promise<boolean> {
    if (!TOR_CONFIG.enabled) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(TOR_CONFIG.testUrl, {
        dispatcher: new SocksProxyAgent(TOR_CONFIG.proxyUrl) as any,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as { origin: string };
        console.log(`🟢 TOR verified: ${data.origin}`);
        this.healthy = true;
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn("🔴 TOR connectivity failed:", error);
      this.healthy = false;
      return false;
    }
  }

  isHealthy(): boolean {
    return this.healthy;
  }

  private async sendTorCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let finished = false;
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        if (finished) return;
        finished = true;
        socket.destroy();
        reject(new Error("Tor control timeout"));
      }, 8000);

      socket.on("error", (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        reject(err);
      });

      socket.on("data", (chunk) => {
        const response = chunk.toString();
        console.log("TOR control:", response.trim());

        if (response.includes("250 OK") || response.includes("250")) {
          if (!finished) {
            finished = true;
            clearTimeout(timeout);
            socket.end();
            resolve();
          }
        } else if (response.includes("513") || response.includes("AUTH")) {
          reject(new Error("Tor control authentication failed"));
        }
      });

      socket.connect(TOR_CONFIG.controlPort, "127.0.0.1", () => {
        const authCommand = TOR_CONFIG.controlPassword ? `AUTHENTICATE "${TOR_CONFIG.controlPassword}"\r\n` : "AUTHENTICATE\r\n";
        socket.write(authCommand);
      });
    });
  }
}

export const torController = new TorController();
