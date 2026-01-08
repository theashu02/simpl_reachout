// tor.ts
import net from "net";
import { fetch } from "undici";
import { SocksProxyAgent } from "socks-proxy-agent";
import { TOR_CONFIG } from "../config/proxies";

interface CircuitHealth {
  ip: string;
  timestamp: number;
  successfulRequests: number;
}

class TorController {
  private requestCount = 0;
  private circuits: CircuitHealth[] = [];
  private healthCheckInterval?: NodeJS.Timeout;

  markRequest(): void {
    if (!TOR_CONFIG.enabled) return;
    this.requestCount += 1;

    if (
      TOR_CONFIG.rotateInterval > 0 &&
      this.requestCount % TOR_CONFIG.rotateInterval === 0
    ) {
      console.log(`TOR: Rotating after ${this.requestCount} requests`);
      void this.forceRotate();
    }
  }

  async forceRotate(): Promise<void> {
    if (!TOR_CONFIG.enabled) return;

    try {
      await this.sendTorCommand("SIGNAL NEWNYM");
      console.log("TOR: New circuit activated");

      await new Promise((r) => setTimeout(r, 3000));
      const newIP = await this.getCurrentIP();
      this.circuits.unshift({
        ip: newIP,
        timestamp: Date.now(),
        successfulRequests: 0,
      });

      if (this.circuits.length > 5) {
        this.circuits = this.circuits.slice(0, 5);
      }
    } catch (error) {
      console.warn("TOR: Rotation failed, continuing...", error);
    }
  }

  private async getCurrentIP(): Promise<string> {
    const response = await fetch(TOR_CONFIG.testUrl, {
      dispatcher: new SocksProxyAgent(TOR_CONFIG.proxyUrl) as any,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await response.json()) as { origin: string };
    return data.origin;
  }

  async verifyConnectivity(): Promise<boolean> {
    if (!TOR_CONFIG.enabled) return false;

    try {
      const ip = await this.getCurrentIP();
      console.log(`TOR verified: ${ip}`);

      this.circuits.unshift({
        ip,
        timestamp: Date.now(),
        successfulRequests: 0,
      });
      if (this.circuits.length > 5) this.circuits = this.circuits.slice(0, 5);

      return true;
    } catch (error) {
      console.warn("TOR connectivity failed:", error);
      return false;
    }
  }

  getActiveCircuit(): CircuitHealth | null {
    return this.circuits[0] ?? null;
  }

  getHealthyCircuit(): boolean {
    const circuit = this.getActiveCircuit();
    if (!circuit) return false;

    const circuitTTL = TOR_CONFIG.circuitTTL * 60 * 1000;
    return Date.now() - circuit.timestamp < circuitTTL;
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
      }, 10000);

      const cleanup = (err?: unknown) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        socket.end();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      socket.on("error", (err) => {
        cleanup(err);
      });

      socket.on("data", (chunk) => {
        const response = chunk.toString();
        console.log("TOR control:", response.trim());

        if (response.includes("250 OK") || response.includes("250")) {
          cleanup();
        } else if (response.includes("513") || response.includes("AUTH")) {
          cleanup(new Error("Tor control authentication failed"));
        } else {
          cleanup(new Error(`Tor command failed: ${response}`));
        }
      });

      socket.connect(TOR_CONFIG.controlPort, "127.0.0.1", () => {
        const authCommand = TOR_CONFIG.controlPassword
          ? `AUTHENTICATE "${TOR_CONFIG.controlPassword}"\r\n`
          : "AUTHENTICATE\r\n";
        socket.write(authCommand + `${command}\r\n`);
      });
    });
  }

  startHealthMonitor() {
    if (this.healthCheckInterval || !TOR_CONFIG.enabled) return;

    this.healthCheckInterval = setInterval(async () => {
      if (!TOR_CONFIG.enabled) return;

      const healthy = await this.verifyConnectivity();
      if (!healthy && this.circuits.length > 0) {
        this.circuits.shift();
        void this.forceRotate();
      }
    }, 60000); // Every minute
  }

  stopHealthMonitor() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }
}

export const torController = new TorController();
