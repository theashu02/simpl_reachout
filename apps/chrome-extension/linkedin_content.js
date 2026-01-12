(function () {
  // Prevent multiple injections
  if (window.linkedInBridgeActive) {
    console.log("⚠️ LinkedIn Bridge already active");
    return;
  }
  window.linkedInBridgeActive = true;

  console.log("🎯 LinkedIn Bridge initialized (DOM Scraping Mode)");

  class LinkedInBridge {
    constructor() {
      this.csrfToken = this.getCsrfToken();
      this.init();
    }

    init() {
      console.log("🔑 CSRF Token:", this.csrfToken ? "Found" : "Not found");

      // Listen for requests from web app
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        console.log("📥 LinkedIn received:", msg.action, msg.query || "");

        if (msg.action === "get_suggestions") {
          this.handleSuggestionRequest(msg.query).then((suggestions) => {
            console.log("✅ Returning", suggestions.length, "suggestions");
            sendResponse({ success: true, data: suggestions });
            chrome.runtime.sendMessage({
              action: "linkedin_suggestions",
              data: suggestions,
              query: msg.query,
              timestamp: Date.now(),
            });
          });
          return true;
        }

        if (msg.action === "search_companies") {
          this.handleSearchRequest(msg.query).then((results) => {
            console.log("✅ Returning", results.length, "results");
            sendResponse({ success: true, data: results });
            chrome.runtime.sendMessage({
              action: "linkedin_search_results",
              data: results,
              query: msg.query,
              timestamp: Date.now(),
            });
          });
          return true;
        }

        return true;
      });

      // Notify that bridge is ready
      chrome.runtime.sendMessage({ action: "linkedin_bridge_ready", timestamp: Date.now() });
      console.log("✅ LinkedIn Bridge ready");

      // Auto-scrape if already on search page
      if (window.location.href.includes("/search/results/companies")) {
        setTimeout(() => this.autoScrapeCurrentPage(), 1000);
      }
    }

    getCsrfToken() {
      const cookies = document.cookie.split(";");
      const jsessionid = cookies.find((c) => c.trim().startsWith("JSESSIONID="));
      return jsessionid ? jsessionid.split("=")[1].replace(/"/g, "") : "";
    }

    // ===== HANDLE SUGGESTION REQUEST =====
    async handleSuggestionRequest(query) {
      if (!query || query.length < 2) return [];

      console.log("🔍 Getting suggestions for:", query);

      // Type in the search box and get suggestions from DOM
      const searchInput = document.querySelector('input[aria-label*="Search"], input.search-global-typeahead__input');

      if (!searchInput) {
        console.warn("⚠️ Search input not found on page");
        return [];
      }

      // Clear and type
      searchInput.focus();
      searchInput.value = "";

      // Simulate typing
      for (const char of query) {
        searchInput.value += char;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        await this.sleep(30);
      }

      // Wait for suggestions dropdown
      await this.sleep(800);

      // Scrape suggestions from dropdown
      return this.scrapeSuggestionDropdown();
    }

    scrapeSuggestionDropdown() {
      const suggestions = [];

      // Try various dropdown selectors
      const selectors = [".search-typeahead-v2__hit", ".basic-typeahead__triggered-content li", "[data-basic-typeahead-items] li", ".typeahead-results li", '[role="listbox"] [role="option"]', ".search-global-typeahead__content li"];

      for (const selector of selectors) {
        const items = document.querySelectorAll(selector);
        if (items.length > 0) {
          console.log("📋 Found", items.length, "suggestions with selector:", selector);

          items.forEach((item, i) => {
            try {
              // Get main text
              const titleEl = item.querySelector('.t-bold, .search-typeahead-v2__hit-title, .basic-typeahead__content, [data-anonymize="person-name"]');
              const subtitleEl = item.querySelector(".t-black--light, .search-typeahead-v2__hit-secondary-title");
              const imgEl = item.querySelector("img");
              const linkEl = item.querySelector("a[href]");

              const name = titleEl?.textContent?.trim() || item.textContent?.trim().split("\n")[0] || "";
              const subtitle = subtitleEl?.textContent?.trim() || "";
              const logo = imgEl?.src || "";
              const url = linkEl?.href || "";

              // Determine type
              let type = "unknown";
              if (url.includes("/company/")) type = "company";
              else if (url.includes("/in/")) type = "person";
              else if (url.includes("/school/")) type = "school";

              if (name && name.length > 0 && name.length < 100) {
                suggestions.push({
                  id: `sug_${i}`,
                  name: name,
                  text: name,
                  subtitle: subtitle,
                  logo: logo,
                  url: url,
                  type: type,
                  universalName: url.match(/\/company\/([^\/\?]+)/)?.[1] || "",
                });
              }
            } catch (e) {}
          });

          if (suggestions.length > 0) break;
        }
      }

      console.log("📋 Scraped", suggestions.length, "suggestions");
      return suggestions;
    }

    // ===== HANDLE SEARCH REQUEST =====
    async handleSearchRequest(query) {
      if (!query) return [];

      console.log("🔍 Searching companies:", query);

      // Check if we're on search results page
      const onSearchPage = window.location.href.includes("/search/results/companies");
      const urlParams = new URLSearchParams(window.location.search);
      const currentKeywords = urlParams.get("keywords") || "";

      if (onSearchPage && currentKeywords.toLowerCase() === query.toLowerCase()) {
        // Already on correct search page, scrape results
        console.log("📋 Scraping current search results...");
        await this.sleep(500);
        return this.scrapeSearchResults();
      }

      // Navigate to search page
      console.log("🔄 Navigating to search page for:", query);
      const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(query)}&origin=SWITCH_SEARCH_VERTICAL`;

      // Navigate
      window.location.href = searchUrl;

      // Return empty - results will be sent after page loads
      return [];
    }

    scrapeSearchResults() {
      const results = [];

      // Target search result cards
      const cards = document.querySelectorAll(".entity-result, .reusable-search__result-container, [data-chameleon-result-urn]");

      console.log("📋 Found", cards.length, "result cards");

      cards.forEach((card, i) => {
        try {
          // Get company name
          const nameEl = card.querySelector('.entity-result__title-text a span[aria-hidden="true"], .app-aware-link span[aria-hidden="true"]');
          const name = nameEl?.textContent?.trim();

          if (!name) return;

          // Get primary subtitle (industry · location)
          const subtitleEl = card.querySelector(".entity-result__primary-subtitle");
          const subtitle = subtitleEl?.textContent?.trim() || "";

          // Get secondary subtitle (followers)
          const secondaryEl = card.querySelector(".entity-result__secondary-subtitle");
          const secondary = secondaryEl?.textContent?.trim() || "";

          // Get summary/description
          const summaryEl = card.querySelector(".entity-result__summary");
          const summary = summaryEl?.textContent?.trim() || "";

          // Get logo
          const imgEl = card.querySelector("img.entity-result__image, img");
          const logo = imgEl?.src || "";

          // Get URL
          const linkEl = card.querySelector('a.app-aware-link, a[href*="/company/"]');
          const url = linkEl?.href || "";
          const companyId = url.match(/\/company\/([^\/\?]+)/)?.[1] || "";

          // Parse industry and location
          const parts = subtitle.split("·").map((s) => s.trim());
          const industry = parts[0] || "";
          const location = parts[1] || "";

          // Parse followers and employees
          const followersMatch = secondary.match(/([\d,\.]+[KMB]?)\s*followers/i);
          const employeesMatch = secondary.match(/([\d,\.]+[KMB]?)\s*employees/i);

          const company = {
            id: companyId || `result_${i}`,
            name: name,
            industry: industry,
            location: location,
            followers: followersMatch ? this.normalizeNumber(followersMatch[1]) : "",
            employees: employeesMatch ? this.normalizeNumber(employeesMatch[1]) : "",
            description: summary.replace(/^[·\s]+/, "").trim(),
            logo: logo,
            url: url,
            linkedinId: companyId,
            universalName: companyId,
          };

          results.push(company);
          console.log("📋 Parsed:", name, "-", industry, "-", location);
        } catch (e) {
          console.warn("Error parsing card:", e);
        }
      });

      console.log("✅ Scraped", results.length, "companies from page");
      return results;
    }

    normalizeNumber(str) {
      if (!str) return "";
      str = str.replace(/,/g, "");

      if (str.includes("K")) {
        return String(parseFloat(str) * 1000);
      } else if (str.includes("M")) {
        return String(parseFloat(str) * 1000000);
      } else if (str.includes("B")) {
        return String(parseFloat(str) * 1000000000);
      }
      return str;
    }

    autoScrapeCurrentPage() {
      console.log("🔄 Auto-scraping current search page...");
      const results = this.scrapeSearchResults();

      if (results.length > 0) {
        // Get query from URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("keywords") || "";

        chrome.runtime.sendMessage({
          action: "linkedin_search_results",
          data: results,
          query: query,
          timestamp: Date.now(),
        });
      }
    }

    sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }
  }

  new LinkedInBridge();

  // Also observe page changes for SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log("🔄 Page changed:", location.href);

      if (location.href.includes("/search/results/companies")) {
        setTimeout(() => {
          const bridge = new LinkedInBridge();
          bridge.autoScrapeCurrentPage();
        }, 2000);
      }
    }
  }).observe(document, { subtree: true, childList: true });
})();
