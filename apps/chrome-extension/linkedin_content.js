(function () {
  // Prevent multiple injections
  if (window.linkedInMonitorActive) {
    console.log("⚠️ Monitor already active");
    return;
  }
  window.linkedInMonitorActive = true;

  console.log("🎯 LinkedIn Monitor initialized");

  class LinkedInMonitor {
    constructor() {
      this.observer = null;
      this.lastResults = [];
      this.debounceTimer = null;
      this.init();
    }

    init() {
      // Start observing page changes
      this.observeSearchResults();

      // Listen for search commands from web app
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === "search_query") {
          console.log("🔎 Received search query:", msg.query);
          this.performSearch(msg.query);
          sendResponse({ success: true });
        }
        return true;
      });

      // Send initial data if on search page
      if (window.location.href.includes("/search/results/")) {
        setTimeout(() => this.extractAndSendResults(), 2000);
      }
    }

    observeSearchResults() {
      // Watch for DOM changes (search results loading)
      const targetNode = document.body;

      this.observer = new MutationObserver(() => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.extractAndSendResults();
        }, 500); // Debounce 500ms
      });

      this.observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });

      console.log("👀 Observing LinkedIn page changes");
    }

    extractAndSendResults() {
      const companies = this.extractCompanies();

      // Only send if results changed
      if (JSON.stringify(companies) !== JSON.stringify(this.lastResults)) {
        this.lastResults = companies;

        if (companies.length > 0) {
          console.log("📤 Sending", companies.length, "results");

          chrome.runtime.sendMessage({
            action: "linkedin_search_results",
            data: companies,
            query: this.getCurrentQuery(),
            timestamp: Date.now(),
          });
        }
      }
    }

    extractCompanies() {
      // Target LinkedIn search result cards
      const selectors = [".reusable-search__result-container", "[data-chameleon-result-urn]", ".entity-result"];

      let results = [];
      for (const selector of selectors) {
        results = document.querySelectorAll(selector);
        if (results.length > 0) break;
      }

      return Array.from(results)
        .map((result, index) => {
          try {
            // Extract company data
            const titleEl = result.querySelector(".entity-result__title-text a, .app-aware-link");
            const subtitleEl = result.querySelector(".entity-result__primary-subtitle, .entity-result__summary");
            const logoEl = result.querySelector("img.entity-result__image, img");
            const linkEl = result.querySelector('a.app-aware-link, a[href*="/company/"]');

            const name = titleEl?.textContent?.trim() || "";
            const subtitle = subtitleEl?.textContent?.trim() || "";
            const logo = logoEl?.src || "";
            const url = linkEl?.href || "";
            const companyId = url.match(/\/company\/([^\/\?]+)/)?.[1] || "";

            if (!name) return null;

            return {
              id: companyId || `result_${index}`,
              name: name,
              subtitle: subtitle,
              url: url,
              logo: logo,
              index: index,
            };
          } catch (e) {
            console.error("Error extracting company:", e);
            return null;
          }
        })
        .filter(Boolean);
    }

    getCurrentQuery() {
      const url = new URL(window.location.href);
      return url.searchParams.get("keywords") || "";
    }

    async performSearch(query) {
      try {
        // Find search input
        const searchInput = document.querySelector('input[aria-label*="Search"], input.search-global-typeahead__input');

        if (searchInput) {
          // Set value
          searchInput.value = query;
          searchInput.focus();

          // Trigger events
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
          searchInput.dispatchEvent(new Event("change", { bubbles: true }));

          // Wait a bit, then submit
          await this.sleep(500);

          // Try to find and click search button or press Enter
          const searchBtn = document.querySelector('button[aria-label*="Search"], .search-global-typeahead__search-button');
          if (searchBtn) {
            searchBtn.click();
          } else {
            // Fallback: press Enter
            searchInput.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "Enter",
                keyCode: 13,
                bubbles: true,
              })
            );
          }

          console.log("✅ Search executed:", query);
        } else {
          console.error("❌ Search input not found");
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  // Initialize monitor
  new LinkedInMonitor();
})();
