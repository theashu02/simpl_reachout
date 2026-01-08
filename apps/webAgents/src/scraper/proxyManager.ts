// proxymanager.ts
import { TOR_CONFIG } from "./proxies";
import { torController } from "./tor";

export class ProxyManager {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    console.log("Initializing ProxyManager...");

    if (TOR_CONFIG.enabled) {
      torController.startHealthMonitor();

      const healthy = await torController.verifyConnectivity();
      console.log(healthy ? "TOR healthy" : "TOR initializing...");
    }

    this.initialized = true;
    console.log("ProxyManager ready");
  }

  getNextProxy(forceTor: boolean = false): string | null {
    const torEnabled = TOR_CONFIG.enabled || forceTor;

    if (torEnabled && torController.getHealthyCircuit()) {
      const activeCircuit = torController.getActiveCircuit();
      if (activeCircuit) {
        console.log(`TOR circuit active: ${activeCircuit.ip}`);
      }
      return TOR_CONFIG.proxyUrl;
    }

    console.warn("No healthy TOR circuits");
    return null;
  }

  async cleanup(): Promise<void> {
    torController.stopHealthMonitor();
    const { browserService } = await import("./browser");
    await browserService.close();
    console.log("Cleanup complete");
  }
}

export const proxyManager = new ProxyManager();
