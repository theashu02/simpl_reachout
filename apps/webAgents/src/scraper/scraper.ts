import { browserService } from "./browser";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface PentestTarget {
  name: string;
  url: string;
  selectors?: string[];
}

async function torPentest(targets: PentestTarget[]) {
  console.log("PRODUCTION TOR PENTEST - HEADFUL PLAYWRIGHT");

  mkdirSync("results", { recursive: true });
  const results: any[] = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] Target: ${target.name}`);

    let page: any;
    try {
      page = await browserService.getPage({ useTor: true });

      // Verify TOR IP with timeout
      const torIP = await page.evaluate(() =>
        fetch("http://httpbin.org/ip", {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        })
          .then((r) => r.json())
          .then((d) => d.origin)
      );
      console.log(`TOR IP CONFIRMED: ${torIP}`);

      // Navigate with retry and longer timeout to handle slow TOR pages
      const navTimeout = 60000;
      let navError: any = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await page.goto(target.url, {
            waitUntil: "domcontentloaded",
            timeout: navTimeout,
          });
          navError = null;
          break;
        } catch (err) {
          navError = err;
          console.warn(`Navigation attempt ${attempt} failed: ${err instanceof Error ? err.message : err}`);
          await page.waitForTimeout(3000);
        }
      }
      if (navError) throw navError;

      // Human interaction
      await page.mouse.move(600 + Math.random() * 500, 400 + Math.random() * 300);
      await page.waitForTimeout(2000 + Math.random() * 3000);

      // Production-grade extraction
      const data: any = {
        title: await page.title(),
        url: page.url(),
        textContent: (await page.textContent("body")) || "",
        torIP,
        timestamp: new Date().toISOString(),
        viewport: page.viewportSize(),
      };

      // Custom selectors
      if (target.selectors) {
        for (const selector of target.selectors) {
            interface ElementData {
            text?: string;
            html: string;
            }
            
            const elements: ElementData[] = await page.$$eval(selector, (els) =>
            els
              .map((el: Element) => ({
              text: (el as HTMLElement).textContent?.trim(),
              html: (el as HTMLElement).innerHTML.slice(0, 500),
              }))
              .filter(Boolean)
            );
          data[selector] = elements;
        }
      }

      // Screenshot with correct path
      const resultsDir = "results";
      const fileName = `${target.name.replace(/[^a-z0-9]/gi, "_")}.png`;
      const screenshot = await page.screenshot({ fullPage: true });
      const screenshotPath = join(resultsDir, fileName);
      writeFileSync(screenshotPath, screenshot);
      data.screenshotPath = screenshotPath;

      results.push({ ...target, status: "SUCCESS", data });
      console.log(`${target.name} captured - ${data.textContent.slice(0, 100)}...`);
    } catch (error: any) {
      console.error(`${target.name} failed:`, error?.message ?? error);
      results.push({
        ...target,
        status: "FAILED",
        error: error?.message ?? String(error),
        timestamp: new Date().toISOString(),
      });
    } finally {
      if (page) {
        await page.context().close();
        await page.context().browser()?.close();
      }
      await new Promise((r) => setTimeout(r, 5000)); // Circuit settle time
    }
  }

  // Save comprehensive results
  writeFileSync("results/pentest-results.json", JSON.stringify(results, null, 2));
  console.log(`\nSUMMARY: ${results.filter((r) => r.status === "SUCCESS").length}/${targets.length} SUCCESS`);
}

const TARGETS: PentestTarget[] = [
  {
    name: "Amazon Product",
    url: "https://www.linkedin.com/company/segwise-ai",
  },
  { name: "Al Jazeera News", url: "https://ui.shadcn.com/docs/components/badge" },
];

torPentest(TARGETS).catch(console.error);
