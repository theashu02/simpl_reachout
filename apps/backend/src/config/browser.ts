import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { proxyManager } from "../utils/proxyManager";

puppeteer.use(StealthPlugin());

// 50+ REALISTIC User Agents (Chrome 120+, Firefox, Safari)
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  // Add 45+ more realistic UAs...
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:121.0) Gecko/20100101 Firefox/121.0",
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
];

const LANGUAGES = ["en-US,en;q=0.9", "en-GB,en;q=0.8", "fr-FR,fr;q=0.9,en;q=0.8"];

interface ProxyConfig {
  server?: string;
  username?: string;
  password?: string;
}

export interface ScrapeOptions {
  proxy?: ProxyConfig;
  timeout?: number;
  fullPage?: boolean;
}

class BrowserService {
  private browser: Browser | null = null;
  private sessionId = 0;
  private currentProxy: string | null = null;
  private readonly baseLaunchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=TranslateUI",
    "--disable-ipc-flooding-protection",
    "--disable-extensions",
    "--disable-plugins-discovery",
    "--disable-web-security",
  ];

  private async getBrowser(proxyUrl: string | null): Promise<Browser> {
    const needsNewBrowser = !this.browser || !this.browser.isConnected() || this.currentProxy !== proxyUrl;

    if (needsNewBrowser) {
      if (this.browser && this.browser.isConnected()) {
        await this.browser.close();
      }

      const launchArgs = [...this.baseLaunchArgs];
      if (proxyUrl) {
        launchArgs.push(`--proxy-server=${proxyUrl}`);
      }

      console.log("--- current proxy url for perfrm scraping ---",proxyUrl)

      console.log(`🚀 Launching stealth browser${proxyUrl ? ` with proxy ${proxyUrl}` : ""}...`);
      this.browser = await puppeteer.launch({
        headless: true, // Better stealth than 'true'  ---> "new"
        args: launchArgs,
      });
      this.currentProxy = proxyUrl;
    }
    if (!this.browser) {
      throw new Error("Failed to initialize browser");
    }
    return this.browser;
  }

  async getPage(options: ScrapeOptions = {}): Promise<Page> {
    const { proxyUrl, credentials } = await this.resolveProxy(options);
    const browser = await this.getBrowser(proxyUrl);
    const page = await browser.newPage();

    if (credentials) {
      await page.authenticate(credentials);
    }

    await this.applyStealth(page, options, proxyUrl);
    await this.humanizeBehavior(page);

    return page;
  }

  private async resolveProxy(options: ScrapeOptions): Promise<{ proxyUrl: string | null; credentials?: { username: string; password: string } }> {
    if (options.proxy?.server) {
      const proxyUrl = this.sanitizeProxyUrl(options.proxy.server);
      const hasAuth = options.proxy.username || options.proxy.password;

      return {
        proxyUrl,
        credentials: hasAuth ? { username: options.proxy.username || "", password: options.proxy.password || "" } : undefined,
      };
    }

    await proxyManager.init();
    const rotatingProxy = proxyManager.getNextProxy();

    return {
      proxyUrl: rotatingProxy ? this.sanitizeProxyUrl(rotatingProxy) : null,
    };
  }

  private sanitizeProxyUrl(proxyUrl: string): string {
    try {
      const parsed = new URL(proxyUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return proxyUrl;
    }
  }

  private async applyStealth(page: Page, options: ScrapeOptions, proxyUrl: string | null) {
    // 1. RANDOM USER AGENT
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    await page.setUserAgent(userAgent);

    // 2. RANDOM VIEWPORT
    const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
    await page.setViewport(viewport);

    // 3. REALISTIC HEADERS
    const headers: Record<string, string> = {
      "Accept-Language": LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
    };

    // 4. PROXY SUPPORT
    if (proxyUrl) {
      headers["Proxy-Connection"] = "keep-alive";
      console.log(`Using proxy: ${proxyUrl}`);
    }

    await page.setExtraHTTPHeaders(headers);

    // 5. ADVANCED RESOURCE BLOCKING
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      const url = req.url();

      // Block tracking pixels, ads, heavy resources
      if (["image", "font", "media", "stylesheet"].includes(type) || url.includes("doubleclick") || url.includes("google-analytics") || url.includes("facebook.com/tr") || url.includes("doubleclick.net")) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 6. CANVAS FINGERPRINT EVASION
    await page.evaluateOnNewDocument(() => {
      // Mock WebGL
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter: any) {
        if (parameter === 37445) return "Intel Inc.";
        if (parameter === 37446) return "Intel Iris OpenGL Engine";
        return getParameter.apply(this, [parameter]);
      };

      // Canvas fingerprint noise
      const ctxProto = HTMLCanvasElement.prototype.getContext;
      // @ts-ignore
      HTMLCanvasElement.prototype.getContext = function (type: string, ...args: any[]) {
        const ctx = ctxProto.apply(this, [type, ...args] as any);
        if (type === "2d" && ctx instanceof CanvasRenderingContext2D) {
          const origFillText = ctx.fillText;
          ctx.fillText = function (text: string, x: number, y: number, maxWidth?: number) {
            ctx.globalCompositeOperation = "source-over";
            origFillText.apply(this, [text, x, y, maxWidth].filter((a) => a !== undefined) as [string, number, number, number?]);
          };
        }
        return ctx;
      };
    });

    // 7. EVADE AUTOMATION DETECTION
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });

      // @ts-ignore
      window.chrome = {
        runtime: {},
      };

      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Mock battery API
      if ("getBattery" in navigator) {
        const origGetBattery = navigator.getBattery;
        navigator.getBattery = () =>
          Promise.resolve({
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 0.85,
            addEventListener: () => {},
          });
      }
    });
  }

  private async humanizeBehavior(page: Page) {
    // HUMAN MOUSE MOVEMENTS
    await page.mouse.move(Math.random() * 800 + 100, Math.random() * 600 + 100, { steps: 10 });

    // RANDOM SCROLL
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let scrollTop = 0;
        const scrollStep = () => {
          scrollTop += Math.random() * 100 + 50;
          window.scrollTo(0, scrollTop);
          if (scrollTop < document.body.scrollHeight) {
            setTimeout(scrollStep, Math.random() * 200 + 100);
          } else {
            resolve(null);
          }
        };
        scrollStep();
      });
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.currentProxy = null;
    }
    await proxyManager.cleanup();
  }
}

export const browserService = new BrowserService();
