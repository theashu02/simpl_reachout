// scraper.ts
import { browserService } from "../TorProxyScraper/browser";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface PentestTarget {
  name: string;
  url: string;
  selectors?: string[];
}

async function torPentest(targets: PentestTarget[]) {
  console.log("🚀 PRODUCTION TOR PENTEST - HEADFUL PLAYWRIGHT");
  
  mkdirSync("results", { recursive: true });
  const results: any[] = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] 🎯 ${target.name}`);
    
    let page: any;
    try {
      page = await browserService.getPage({ useTor: true });
      
      // Verify TOR IP
      const torIP = await page.evaluate(() => 
        fetch('http://httpbin.org/ip', { 
          method: 'GET',
          cache: 'no-store'
        }).then(r => r.json()).then(d => d.origin)
      );
      console.log(`🟢 TOR IP CONFIRMED: ${torIP}`);
      
      // Navigate with human delays
      await page.goto(target.url, { 
        waitUntil: 'networkidle', 
        timeout: 45000 
      });
      
      // Human interaction
      await page.mouse.move(600 + Math.random() * 500, 400 + Math.random() * 300);
      await page.waitForTimeout(2000 + Math.random() * 3000);
      
      // Production-grade extraction
      const data: any = {
        title: await page.title(),
        url: page.url(),
        textContent: await page.textContent("body") || "",
        torIP,
        timestamp: new Date().toISOString(),
        viewport: page.viewportSize(),
      };
      
      // Custom selectors
      if (target.selectors) {
        for (const selector of target.selectors) {
          const elements = await page.$$eval(selector, els => 
            els.map((el: Element) => ({
              text: (el as HTMLElement).textContent?.trim(),
              html: (el as HTMLElement).innerHTML.slice(0, 500),
            })).filter(Boolean)
          );
          data[selector] = elements;
        }
      }
      
      // Screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      data.screenshotPath = `results/${target.name.replace(/[^a-z0-9]/gi, '_')}.png`;
      writeFileSync(join("results", data.screenshotPath!), screenshot);
      
      results.push({ ...target, status: 'SUCCESS', data });
      console.log(`✅ ${target.name} - ${data.textContent.slice(0, 100)}...`);
      
    } catch (error: any) {
      console.error(`❌ ${target.name}:`, error.message);
      results.push({ 
        ...target, 
        status: 'FAILED', 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      if (page) {
        await page.context().close();
        await page.context().browser()?.close();
      }
      await new Promise(r => setTimeout(r, 5000)); // Circuit settle time
    }
  }
  
  // Save comprehensive results
  writeFileSync('results/pentest-results.json', JSON.stringify(results, null, 2));
  console.log(`\n📊 SUMMARY: ${results.filter(r => r.status === 'SUCCESS').length}/${targets.length} SUCCESS`);
}

const TARGETS: PentestTarget[] = [
  { name: "Amazon Product", url: "https://medium.com/@joerosborne/intro-to-web-scraping-build-your-first-scraper-in-5-minutes-1c36b5c4b110" },
  { name: "Al Jazeera News", url: "https://www.aljazeera.com/news/2026/1/8/saudi-led-coalition-says-stcs-al-zubaidi-fled-to-uae-via-somaliland" },
];

torPentest(TARGETS).catch(console.error);