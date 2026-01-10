// This script runs in MAIN world (same as page scripts)
// so it can directly access window object

(function () {
  console.log("🌐 Web App Bridge initializing...");

  // Extension ID - will be set dynamically
  let extensionId = null;

  // Create global bridge object accessible by the page
  window.linkedinBridge = {
    searchResults: [],
    suggestions: [],
    ready: false,
    onData: null,

    // Send search query to LinkedIn via extension
    sendSearch: (query) => {
      console.log("🔍 Sending search to LinkedIn:", query);
      window.postMessage(
        {
          type: "LINKEDIN_BRIDGE_SEARCH",
          query: query,
        },
        "*"
      );
    },
  };

  // Listen for messages from the isolated content script
  window.addEventListener("message", (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

    if (event.data.type === "LINKEDIN_BRIDGE_READY") {
      console.log("✅ LinkedIn Bridge connected!");
      window.linkedinBridge.ready = true;
      extensionId = event.data.extensionId;

      // Dispatch ready event
      window.dispatchEvent(new CustomEvent("linkedin-bridge-ready"));
    }

    if (event.data.type === "LINKEDIN_BRIDGE_DATA") {
      console.log("📥 Received LinkedIn data:", event.data.payload);

      if (event.data.payload.action === "linkedin_search_results") {
        window.linkedinBridge.searchResults = event.data.payload.data;

        // Trigger callback if set
        if (window.linkedinBridge.onData) {
          window.linkedinBridge.onData({
            type: "search_results",
            query: event.data.payload.query,
            results: event.data.payload.data,
            timestamp: event.data.payload.timestamp,
          });
        }

        // Also dispatch custom event
        window.dispatchEvent(
          new CustomEvent("linkedin-data", {
            detail: {
              type: "search_results",
              data: event.data.payload.data,
              query: event.data.payload.query,
            },
          })
        );
      }
    }
  });

  console.log("🌐 LinkedIn Bridge object created on window");
})();
