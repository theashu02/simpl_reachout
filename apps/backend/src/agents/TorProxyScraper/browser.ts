import { chromium, Browser, Page } from "playwright";
import { proxyManager } from "../../utils/proxyManager";
import { torController } from "../../utils/tor";

interface FingerprintProfile {
  name: string;
  userAgent: string;
  viewport: { width: number; height: number };
  timezone: string;
  locale: string;
  cores: number;
  ram: string;
  platform: string;
}

const FINGERPRINT_PROFILES: FingerprintProfile[] = [
  {
    name: "Win11 Chrome 121",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    timezone: "America/New_York",
    locale: "en-US",
    cores: 12,
    ram: "16GB",
    platform: "Win32",
  },
  {
    name: "MacOS Chrome 121 M1",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    timezone: "Europe/London",
    locale: "en-GB",
    cores: 8,
    ram: "16GB",
    platform: "MacIntel",
  },
  {
    name: "Linux Chrome 121",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    timezone: "Asia/Tokyo",
    locale: "en-US",
    cores: 4,
    ram: "8GB",
    platform: "Linux x86_64",
  },
  {
    name: "Win10 Edge 121",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
    viewport: { width: 1536, height: 864 },
    timezone: "America/Chicago",
    locale: "en-US",
    cores: 8,
    ram: "16GB",
    platform: "Win32",
  },
];

let profileIndex = 0;
let browser: Browser | null = null;

export interface ScrapeOptions {
  timeout?: number;
  fullPage?: boolean;
  useTor?: boolean;
}

class BrowserService {
  private pickProfile(): FingerprintProfile {
    const profile =
      FINGERPRINT_PROFILES[profileIndex % FINGERPRINT_PROFILES.length];
    profileIndex = (profileIndex + 1) % FINGERPRINT_PROFILES.length;
    return profile;
  }

  async getPage(options: ScrapeOptions = {}): Promise<Page> {
    const forceTor = options.useTor !== false;
    await proxyManager.init();

    const proxyUrl = proxyManager.getNextProxy(forceTor);
    if (!proxyUrl) {
      throw new Error("No proxy available from ProxyManager");
    }

    torController.markRequest();
    console.log(`Using proxy: ${proxyUrl}`);

    const browserInstance = await this.getBrowser(proxyUrl);
    const profile = this.pickProfile();
    const ctx = await browserInstance.newContext(
      await this.getContextOptions(proxyUrl, profile)
    );
    const page = await ctx.newPage();

    await this.applyAdvancedFingerprint(page, profile);
    await this.humanizeBehavior(page);

    return page;
  }

  private async getBrowser(proxyUrl: string): Promise<Browser> {
    if (browser?.isConnected()) {
      await browser.close();
    }

    const launchOptions = {
      headless: false, // Headful for production robustness
      args: [
        `--proxy-server=${proxyUrl}`,
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--no-first-run",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--start-maximized",
      ],
    };

    browser = await chromium.launch(launchOptions);
    return browser;
  }

  private async getContextOptions(
    proxyUrl: string,
    profile: FingerprintProfile
  ) {
    console.log(`Applying fingerprint: ${profile.name}`);

    return {
      proxy: { server: proxyUrl },
      viewport: profile.viewport,
      userAgent: profile.userAgent,
      locale: profile.locale,
      timezoneId: profile.timezone,
      permissions: [],
      extraHTTPHeaders: {
        "Accept-Language": profile.locale,
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      ignoreHTTPSErrors: true,
      bypassCSP: true,
    };
  }

  private async applyAdvancedFingerprint(
    page: Page,
    profile: FingerprintProfile
  ) {
    // Block tracking resources to reduce noise
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (
        /google-analytics|facebook\.com\/tr|doubleclick|adservice|twitter\.com/i.test(
          url
        ) ||
        ["image", "font", "media", "stylesheet"].includes(
          route.request().resourceType()
        )
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Apply stealthy fingerprint overrides
    await page.addInitScript((fp: FingerprintProfile) => {
      Object.defineProperties(navigator, {
        webdriver: { get: () => undefined },
        languages: { get: () => [fp.locale.split("-")[0]] },
        plugins: { get: () => [1, 2, 3, 4, 5] },
        hardwareConcurrency: { get: () => fp.cores },
        deviceMemory: { get: () => 8 },
        platform: { get: () => fp.platform },
        maxTouchPoints: { get: () => 0 },
      });

      (window as any).chrome = {
        runtime: {},
        loadTimes: () => ({}),
        app: { isInstalled: false },
      };

      const originalQuery = navigator.permissions.query;
      (navigator as any).permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);

      Object.defineProperty(screen, "availWidth", { get: () => 1920 });
      Object.defineProperty(screen, "availHeight", { get: () => 1080 });
    }, profile);
  }

  private async humanizeBehavior(page: Page) {
    await page.mouse.move(
      400 + Math.random() * 800,
      200 + Math.random() * 400,
      { steps: 15 }
    );

    await page.evaluate(async () => {
      for (let i = 0; i < 4; i++) {
        window.scrollBy(0, 200 + Math.random() * 300);
        await new Promise((r) =>
          setTimeout(r, 400 + Math.random() * 800)
        );
      }
    });

    await page.keyboard.press("Space");
    await page.waitForTimeout(800 + Math.random() * 1200);
  }

  async close() {
    await browser?.close();
    browser = null;
  }
}

export const browserService = new BrowserService();
