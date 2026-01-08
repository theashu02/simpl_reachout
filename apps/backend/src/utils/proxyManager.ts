import { TOR_CONFIG } from "../config/proxies";
import { torController } from "./tor";

export class ProxyManager {
  private initialized = false;
  private torRequests = 0;

  async init(): Promise<void> {
    if (this.initialized) return;

    console.log("🔄 Initializing ProxyManager...");

    // Always test TOR first
    if (TOR_CONFIG.enabled) {
      const torHealthy = await torController.verifyConnectivity();
      console.log(torHealthy ? "🟢 TOR ready" : "🟡 TOR unhealthy, will retry");
    }

    this.initialized = true;
    console.log("✅ ProxyManager initialized");
  }

  getNextProxy(forceTor: boolean = false): string | null {
    // TOR ALWAYS FIRST (your requirement)
    if (TOR_CONFIG.enabled && torController.isHealthy()) {
      this.torRequests++;
      console.log(`TOR request #${this.torRequests} (force: ${forceTor})`);
      return TOR_CONFIG.proxyUrl;
    }

    console.warn("No healthy proxies available");
    return null;
  }

  async cleanup(): Promise<void> {
    torController.reset();
    console.log("🧹 ProxyManager cleaned up");
  }
}

export const proxyManager = new ProxyManager();
