import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page, executablePath } from "puppeteer";

let proxyManager: any;
try {
  proxyManager = require("./utils/proxyManager").proxyManager;
} catch (e) {
  console.warn("ProxyManager not found - using direct TOR");
  proxyManager = { getNextProxy: () => "socks5://127.0.0.1:9050", init: async () => {} };
}

puppeteer.use(StealthPlugin());

type FingerprintProfile = {
  name: string;
  userAgent: string;
  viewport: { width: number; height: number };
  timezone: string;
  language: string;
  cores: number;
  plugins: number;
};

const FINGERPRINT_PROFILES: FingerprintProfile[] = [
  {
    name: "Win10 Chrome 120",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    timezone: "America/New_York",
    language: "en-US,en;q=0.9",
    cores: 8,
    plugins: 5,
  },
  {
    name: "MacOS Chrome 119",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    timezone: "Europe/London",
    language: "en-GB,en;q=0.8",
    cores: 4,
    plugins: 4,
  },
  {
    name: "Linux Firefox 121",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    viewport: { width: 1366, height: 768 },
    timezone: "Asia/Tokyo",
    language: "en-US,en;q=0.9,ja;q=0.8",
    cores: 4,
    plugins: 3,
  },
  {
    name: "iPhone Safari 17",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    viewport: { width: 375, height: 812 },
    timezone: "America/Los_Angeles",
    language: "en-US,en;q=0.9",
    cores: 6,
    plugins: 0,
  },
];

let profileIndex = 0;

export interface ScrapeOptions {
  proxy?: { server?: string; username?: string; password?: string };
  timeout?: number;
  fullPage?: boolean;
  useTor?: boolean;
}

class BrowserService {
  private browser: Browser | null = null;
  private currentProxy: string | null = null;

  private readonly baseLaunchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-web-security",
    "--disable-features=VizDisplayCompositor",
    "--no-first-run",
    "--disable-extensions",
  ];

  async getPage(options: ScrapeOptions = {}): Promise<Page> {
    // FORCE TOR BY DEFAULT
    const forceTor = options.useTor !== false;
    await proxyManager.init();

    const proxyUrl = proxyManager.getNextProxy(forceTor);
    console.log(`🟢 TOR Proxy: ${proxyUrl} (force: ${forceTor})`);

    const browser = await this.getBrowser(proxyUrl);
    const page = await browser.newPage();

    // 4x FINGERPRINT ROTATION
    await this.applyAdvancedFingerprint(page);

    // HUMAN BEHAVIOR
    await this.humanizeBehavior(page);

    return page;
  }

  private async getBrowser(proxyUrl: string): Promise<Browser> {
    const needsNewBrowser = !this.browser?.isConnected() || this.currentProxy !== proxyUrl;

    if (needsNewBrowser) {
      console.log(`🚀 New browser via TOR: ${proxyUrl}`);

      if (this.browser?.isConnected()) {
        await this.browser.close();
      }

      const launchArgs = [...this.baseLaunchArgs, `--proxy-server=${proxyUrl}`, "--proxy-bypass-list=<-loopback>", "--host-resolver-rules=MAP * 0.0.0.0 0.0.0.0,EXCLUDE 127.0.0.1"];

      this.browser = await puppeteer.launch({
        headless: "new",
        args: launchArgs,
        defaultViewport: null,
        executablePath: executablePath(),
      });

      this.currentProxy = proxyUrl;
    }

    return this.browser!;
  }

  private async applyAdvancedFingerprint(page: Page) {
    const profile = FINGERPRINT_PROFILES[profileIndex % FINGERPRINT_PROFILES.length];
    profileIndex++;

    console.log(`👤 Fingerprint: ${profile.name}`);

    // UA + Viewport + Timezone
    await page.setUserAgent(profile.userAgent);
    await page.setViewport(profile.viewport);
    await page.emulateTimezone(profile.timezone);

    // HEADERS
    await page.setExtraHTTPHeaders({
      "Accept-Language": profile.language,
      "Accept-Encoding": "gzip, deflate, br",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0",
    });

    // REQUEST INTERCEPTION (BLOCK TRACKERS)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      const url = req.url();

      if (["image", "font", "media"].includes(type) || url.includes("google-analytics") || url.includes("facebook.com/tr")) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // STEALTH SCRIPTS
    await page.evaluateOnNewDocument((fp: FingerprintProfile) => {
      // Hardware
      Object.defineProperty(navigator, "hardwareConcurrency", {
        get: () => fp.cores,
      });

      // Webdriver
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });

      // Chrome object
      (window as any).chrome = { runtime: {} };

      // Permissions
      // const originalQuery = window.navigator.permissions.query;
      // window.navigator.permissions.query = (parameters: any) => (parameters.name === "notifications" ? Promise.resolve({ state: Notification.permission }) : originalQuery(parameters));
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (parameters.name === "notifications" ? Promise.resolve({ state: Notification.permission } as any) : originalQuery(parameters));
    }, profile);
  }

  private async humanizeBehavior(page: Page) {
    // MOUSE MOVEMENT
    await page.mouse.move(400 + Math.random() * 800, 200 + Math.random() * 400, { steps: 20 });

    // SCROLL
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        window.scrollBy(0, 300 + Math.random() * 200);
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
      }
    });

    // RANDOM DELAY
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
  }

  async close() {
    if (this.browser?.connected) {
      await this.browser.close();
    }
    this.browser = null;
    this.currentProxy = null;
  }
}

export const browserService = new BrowserService();
