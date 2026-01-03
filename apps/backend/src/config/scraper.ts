// src/services/scraper.ts
import { browserService } from "./browser";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { BROWSER_TIMEOUT } from "../utils/config";

const turndown = new TurndownService();

export const scrapeUrl = async (url: string) => {
  let page = null;
  try {
    page = await browserService.getPage();

    // Timeout is crucial for production so one bad site doesn't hang the thread
    const timeout = Number(BROWSER_TIMEOUT) || 30000;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

    const html = await page.content();
    const dom = new JSDOM(html, { url });

    // Parse the article content
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) return null;

    // Convert to Markdown
    const markdown = turndown.turndown(article.content || "");

    return {
      url,
      title: article.title,
      content: markdown.substring(0, 8000), // Limit token usage
    };
  } catch (error) {
    console.warn(`Failed to scrape ${url}:`, error);
    return null;
  } finally {
    if (page) await page.close();
  }
};
