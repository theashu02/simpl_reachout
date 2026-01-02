import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";

puppeteer.use(StealthPlugin());

class BrowserService {
  private browser: Browser | null = null;

  // Initialize or return existing browser
  async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      console.log("🚀 Launching new browser instance...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
      });
    }
    return this.browser;
  }

  // Optimized page creation with resource blocking
  async getPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    // Block heavy resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media", "script"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

export const browserService = new BrowserService();
