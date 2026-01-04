import ProxyChain from "proxy-chain";
import { PROXY_CONFIG, RotationProxyConfig, SingleProxyConfig } from "../config/proxies";

export class ProxyManager {
  private proxyUrls: string[] = [];
  private currentIndex = 0;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (PROXY_CONFIG.rotation) {
        await this.setupRotatingProxies(PROXY_CONFIG.rotation);
      } else if (PROXY_CONFIG.single) {
        const anonymized = await ProxyChain.anonymizeProxy(this.buildProxyUrl(PROXY_CONFIG.single));
        this.proxyUrls = [anonymized];
      }
    } catch (error) {
      console.warn("ProxyManager initialization failed. Continuing without proxy.", error);
      this.proxyUrls = [];
    }
  }

  private buildProxyUrl(config: SingleProxyConfig): string {
    if (config.username && config.password) {
      const url = new URL(config.server);
      return `${url.protocol}//${config.username}:${config.password}@${url.host}`;
    }
    return config.server;
  }

  private async setupRotatingProxies(rotation: RotationProxyConfig): Promise<void> {
    const { provider, credentials, session, country } = rotation;
    const sessionId = session || `session-${Date.now()}`;
    const countryToken = country ? `-country-${country.toLowerCase()}` : "";

    let proxyUrl = "";

    switch (provider) {
      case "custom":
        proxyUrl = ``;
        break;
      default:
        proxyUrl = "";
    }

    if (proxyUrl) {
      const anonymized = await ProxyChain.anonymizeProxy(proxyUrl);
      this.proxyUrls = [anonymized];
    }
  }

  getNextProxy(): string | null {
    if (this.proxyUrls.length === 0) return null;
    const proxy = this.proxyUrls[this.currentIndex % this.proxyUrls.length];
    this.currentIndex += 1;
    return proxy;
  }

  async cleanup(): Promise<void> {
    const proxies = [...this.proxyUrls];
    this.proxyUrls = [];
    this.currentIndex = 0;

    await Promise.allSettled(proxies.map((proxy) => ProxyChain.closeAnonymizedProxy(proxy, true)));
  }
}

export const proxyManager = new ProxyManager();
