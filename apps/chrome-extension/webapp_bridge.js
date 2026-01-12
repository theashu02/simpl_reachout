// This script runs in ISOLATED world (content script context)
// Bridges between Chrome extension messaging and page postMessage

(function () {
  console.log("🔌 Web App Bridge (isolated) loading...");

  // Check if extension context is still valid
  function isContextValid() {
    try {
      // This will throw if context is invalidated
      return !!chrome.runtime?.id;
    } catch (e) {
      return false;
    }
  }

  // Notify page about context status
  function notifyPageAboutContext(valid) {
    window.postMessage(
      {
        type: valid ? "LINKEDIN_BRIDGE_READY" : "LINKEDIN_BRIDGE_DISCONNECTED",
        extensionId: valid ? chrome.runtime?.id : null,
        message: valid ? "Connected" : "Extension was reloaded. Please refresh this page.",
      },
      "*"
    );
  }

  // Notify page that extension is ready after a short delay
  setTimeout(() => {
    if (isContextValid()) {
      notifyPageAboutContext(true);
      console.log("📢 Sent ready message to page");
    } else {
      notifyPageAboutContext(false);
      console.log("⚠️ Extension context invalidated on load");
    }
  }, 100);

  // Listen for messages from extension background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📥 Isolated bridge received:", msg.action);

    // Forward to page via postMessage
    window.postMessage(
      {
        type: "LINKEDIN_BRIDGE_DATA",
        payload: msg,
      },
      "*"
    );

    sendResponse({ received: true });
    return true;
  });

  // Listen for requests from page
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    // Handle API requests from page
    if (event.data.type === "LINKEDIN_BRIDGE_REQUEST") {
      const { action, query, companyId } = event.data;
      console.log("🔍 Forwarding request to extension:", action);

      // Check if context is still valid
      if (!isContextValid()) {
        console.error("⚠️ Extension context invalidated - please refresh the page");
        window.postMessage(
          {
            type: "LINKEDIN_BRIDGE_DATA",
            payload: {
              action: "error",
              message: "Extension was reloaded. Please refresh this page (Ctrl+R).",
            },
          },
          "*"
        );
        return;
      }

      chrome.runtime
        .sendMessage({
          action: action,
          query: query,
          companyId: companyId,
        })
        .then((response) => {
          // If we got direct response, send it to page
          if (response?.data) {
            window.postMessage(
              {
                type: "LINKEDIN_BRIDGE_DATA",
                payload: {
                  action: action === "get_suggestions" ? "linkedin_suggestions" : action === "search_companies" ? "linkedin_search_results" : action === "get_company_details" ? "linkedin_company_details" : action,
                  data: response.data,
                  query: query,
                },
              },
              "*"
            );
          }
        })
        .catch((err) => {
          console.error("Request failed:", err);

          // Check if it's a context invalidation error
          const message = err.message?.includes("invalidated") || err.message?.includes("Extension context") ? "Extension was reloaded. Please refresh this page (Ctrl+R)." : err.message || "Request failed";

          window.postMessage(
            {
              type: "LINKEDIN_BRIDGE_DATA",
              payload: {
                action: "error",
                message: message,
              },
            },
            "*"
          );
        });
    }
  });

  console.log("✅ Web App Bridge (isolated) ready");
})();
