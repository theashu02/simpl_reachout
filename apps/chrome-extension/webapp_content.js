// This script runs in MAIN world (same as page scripts)
// Creates window.linkedinBridge accessible by the React app

(function () {
  console.log("🌐 Web App Bridge (MAIN) initializing...");

  // Create global bridge object
  window.linkedinBridge = {
    ready: false,
    linkedinConnected: false,

    // Data storage
    suggestions: [],
    searchResults: [],
    companyDetails: null,

    // Callbacks
    onReady: null,
    onSuggestions: null,
    onSearchResults: null,
    onCompanyDetails: null,
    onError: null,

    // ===== API Methods =====

    // Get company suggestions as user types
    getSuggestions: (query) => {
      console.log("🔍 Getting suggestions for:", query);
      window.postMessage(
        {
          type: "LINKEDIN_BRIDGE_REQUEST",
          action: "get_suggestions",
          query: query,
        },
        "*"
      );
    },

    // Search for companies
    searchCompanies: (query) => {
      console.log("🔍 Searching companies:", query);
      window.postMessage(
        {
          type: "LINKEDIN_BRIDGE_REQUEST",
          action: "search_companies",
          query: query,
        },
        "*"
      );
    },

    // Get detailed company info
    getCompanyDetails: (companyId) => {
      console.log("🏢 Getting company details:", companyId);
      window.postMessage(
        {
          type: "LINKEDIN_BRIDGE_REQUEST",
          action: "get_company_details",
          companyId: companyId,
        },
        "*"
      );
    },

    // Legacy method for compatibility
    sendSearch: (query) => {
      window.linkedinBridge.searchCompanies(query);
    },
  };

  // Listen for messages from isolated content script
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    // Bridge ready
    if (event.data.type === "LINKEDIN_BRIDGE_READY") {
      console.log("✅ LinkedIn Bridge connected!");
      window.linkedinBridge.ready = true;
      window.dispatchEvent(new CustomEvent("linkedin-bridge-ready"));
      if (window.linkedinBridge.onReady) {
        window.linkedinBridge.onReady();
      }
    }

    // LinkedIn connected
    if (event.data.type === "LINKEDIN_BRIDGE_DATA") {
      const payload = event.data.payload;
      console.log("📥 Bridge received:", payload.action);

      // LinkedIn ready notification
      if (payload.action === "linkedin_ready") {
        window.linkedinBridge.linkedinConnected = true;
        window.dispatchEvent(new CustomEvent("linkedin-connected"));
      }

      // Suggestions
      if (payload.action === "linkedin_suggestions") {
        window.linkedinBridge.suggestions = payload.data || [];

        if (window.linkedinBridge.onSuggestions) {
          window.linkedinBridge.onSuggestions({
            type: "suggestions",
            data: payload.data,
            query: payload.query,
          });
        }

        window.dispatchEvent(
          new CustomEvent("linkedin-suggestions", {
            detail: { data: payload.data, query: payload.query },
          })
        );
      }

      // Search results
      if (payload.action === "linkedin_search_results") {
        window.linkedinBridge.searchResults = payload.data || [];

        if (window.linkedinBridge.onSearchResults) {
          window.linkedinBridge.onSearchResults({
            type: "search_results",
            data: payload.data,
            query: payload.query,
          });
        }

        window.dispatchEvent(
          new CustomEvent("linkedin-search-results", {
            detail: { data: payload.data, query: payload.query },
          })
        );

        // Also dispatch as linkedin-data for compatibility
        window.dispatchEvent(
          new CustomEvent("linkedin-data", {
            detail: { type: "search_results", data: payload.data, query: payload.query },
          })
        );
      }

      // Company details
      if (payload.action === "linkedin_company_details") {
        window.linkedinBridge.companyDetails = payload.data;

        if (window.linkedinBridge.onCompanyDetails) {
          window.linkedinBridge.onCompanyDetails({
            type: "company_details",
            data: payload.data,
          });
        }

        window.dispatchEvent(
          new CustomEvent("linkedin-company-details", {
            detail: { data: payload.data },
          })
        );
      }

      // Errors
      if (payload.action === "error") {
        if (window.linkedinBridge.onError) {
          window.linkedinBridge.onError(payload.message);
        }
        window.dispatchEvent(
          new CustomEvent("linkedin-error", {
            detail: { message: payload.message },
          })
        );
      }
    }
  });

  console.log("🌐 LinkedIn Bridge created on window");
})();
