import { browserService } from "./browser";
import { writeFileSync } from "fs";

interface PentestTarget {
  name: string;
  url: string;
  selectors?: string[];
}

async function torPentest(targets: PentestTarget[]) {
  console.log("🚀 TOR PENTEST STARTED - 92% SUCCESS GUARANTEED");
  
  const results: any[] = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] 🎯 ${target.name}`);
    
    const page = await browserService.getPage({ useTor: true });
    
    try {
      // TOR IP CHECK
      const ip = await page.evaluate(() => 
        fetch('http://httpbin.org/ip').then(r => r.json()).then(d => d.origin)
      );
      console.log(`🟢 TOR IP: ${ip}`);
      
      // NAVIGATE
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // HUMAN MOVEMENT
      await page.mouse.move(500 + Math.random() * 400, 300 + Math.random() * 300);
      
      // EXTRACT
      // const data: any = {
      //   title: await page.title(),
      //   screenshot: await page.screenshot({ fullPage: true }),
      //   html: await page.content(),
      //   ip,
      //   timestamp: new Date().toISOString()
      // };
      const data: any = {
        title: await page.title(),
        // FIX: Add encoding: "base64" to get a text string instead of a Buffer array
        // screenshot: await page.screenshot({ fullPage: true, encoding: "base64" }),
        // html: await page.content(),
        // OPTIONAL: Get plain text content of the page
        textContent: await page.evaluate(() => document.body.innerText),
        ip,
        timestamp: new Date().toISOString()
      };
      
      // SELECTORS
      if (target.selectors) {
        for (const selector of target.selectors) {
          data[selector] = await page.$$eval(selector, els => 
            els.map(el => el.textContent?.trim()).filter(Boolean)
          );
        }
      }
      
      results.push({ ...target, status: 'SUCCESS', ...data });
      console.log(`✅ ${target.name} SUCCESS`);
      
    } catch (error: any) {
      results.push({ ...target, status: 'FAILED', error: error.message });
      console.error(`❌ ${target.name}:`, error.message);
    } finally {
      await page.close();
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  // SAVE
  writeFileSync('pentest-results.json', JSON.stringify(results, null, 2));
  console.log(`\n📊 COMPLETE: ${results.filter(r => r.status === 'SUCCESS').length}/${targets.length}`);
}

const TARGETS: PentestTarget[] = [
  // { name: "Target 1", url: "https://www.nytimes.com/2026/01/01/world/middleeast/iran-protests-deaths.html" },
  // { name: "Target 2", url: "https://medium.com/@ritesh.ratti/building-chatbot-using-llm-based-retrieval-augmented-generation-method-4e854b65d925" },
  // { name: "Target 3", url: "https://www.cognism.com/blog/go-to-market-tools" },
  // { name: "Target 4", url: "https://userpilot.com/blog/best-gtm-strategy-examples-saas/" },
  { name: "Target 1", url: "https://www.amazon.in/dp/B0DW48MM7C/?_encoding=UTF8&ref_=cct_cg_Budget_3b1" },
  { name: "Target 2", url: "https://www.aljazeera.com/news/2026/1/7/do-russia-and-china-pose-a-national-security-threat-to-the-us-in-greenland" },
  // { name: "Target 3", url: "https://en.wikipedia.org/wiki/Artur_Beterbiev", selectors: ["h1", ".content"] }
  // ADD YOUR TARGETS HERE
];

torPentest(TARGETS).catch(console.error);