// This script runs in ISOLATED world (content script context)
// It bridges between the extension messaging and the page

(function () {
  console.log("🔌 Web App Bridge (isolated) loading...");

  // Notify the page that extension is ready
  window.postMessage(
    {
      type: "LINKEDIN_BRIDGE_READY",
      extensionId: chrome.runtime.id,
    },
    "*"
  );

  // Listen for messages from the extension background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📥 Bridge received from extension:", msg.action);

    // Forward to page script via postMessage
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

  // Listen for messages from the page (search requests)
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type === "LINKEDIN_BRIDGE_SEARCH") {
      console.log("🔍 Bridge forwarding search:", event.data.query);

      chrome.runtime
        .sendMessage({
          action: "search_query",
          query: event.data.query,
        })
        .catch((err) => {
          console.error("Failed to send search:", err);
        });
    }
  });

  console.log("✅ Web App Bridge (isolated) ready");
})();
