// LinkedIn Bridge - Background Script
// Routes messages between LinkedIn tab and web app tabs

let linkedinTabId = null;
let linkedinReady = false;

console.log("🚀 LinkedIn Bridge background script starting...");

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📨 Background received:", msg.action, "from", sender.tab?.url?.substring(0, 50));

  // Track LinkedIn tab
  if (sender.tab?.url?.includes("linkedin.com")) {
    linkedinTabId = sender.tab.id;

    if (msg.action === "linkedin_bridge_ready") {
      linkedinReady = true;
      console.log("✅ LinkedIn bridge ready on tab", linkedinTabId);

      // Notify all web app tabs
      notifyWebAppTabs({ action: "linkedin_ready" });
    }
  }

  // ===== REQUESTS FROM WEB APP =====

  // Handle suggestion requests from web app
  if (msg.action === "get_suggestions") {
    console.log("🔍 Routing suggestion request:", msg.query);

    if (linkedinTabId && linkedinReady) {
      chrome.tabs
        .sendMessage(linkedinTabId, {
          action: "get_suggestions",
          query: msg.query,
        })
        .then((response) => {
          sendResponse(response);
        })
        .catch((err) => {
          console.error("Failed to get suggestions:", err);
          sendResponse({ success: false, error: "LinkedIn tab not responding" });
        });
    } else {
      sendResponse({ success: false, error: "LinkedIn not connected. Open linkedin.com first." });
    }
    return true; // Keep channel open
  }

  // Handle search requests from web app
  if (msg.action === "search_companies") {
    console.log("🔍 Routing search request:", msg.query);

    if (linkedinTabId && linkedinReady) {
      chrome.tabs
        .sendMessage(linkedinTabId, {
          action: "search_companies",
          query: msg.query,
        })
        .then((response) => {
          sendResponse(response);
        })
        .catch((err) => {
          sendResponse({ success: false, error: "LinkedIn tab not responding" });
        });
    } else {
      sendResponse({ success: false, error: "LinkedIn not connected" });
    }
    return true;
  }

  // Handle company details request
  if (msg.action === "get_company_details") {
    console.log("🏢 Routing company details request:", msg.companyId);

    if (linkedinTabId && linkedinReady) {
      chrome.tabs
        .sendMessage(linkedinTabId, {
          action: "get_company_details",
          companyId: msg.companyId,
        })
        .then((response) => {
          sendResponse(response);
        })
        .catch((err) => {
          sendResponse({ success: false, error: "LinkedIn tab not responding" });
        });
    } else {
      sendResponse({ success: false, error: "LinkedIn not connected" });
    }
    return true;
  }

  // ===== RESPONSES FROM LINKEDIN =====

  // Route suggestions to web apps
  if (msg.action === "linkedin_suggestions") {
    console.log("💡 Routing suggestions to web apps:", msg.data?.length);
    notifyWebAppTabs(msg);
    sendResponse({ success: true });
    return true;
  }

  // Route search results to web apps
  if (msg.action === "linkedin_search_results") {
    console.log("📤 Routing search results to web apps:", msg.data?.length);
    notifyWebAppTabs(msg);
    sendResponse({ success: true });
    return true;
  }

  // Route company details to web apps
  if (msg.action === "linkedin_company_details") {
    console.log("🏢 Routing company details to web apps");
    notifyWebAppTabs(msg);
    sendResponse({ success: true });
    return true;
  }

  sendResponse({ success: true });
  return true;
});

// Send message to all localhost/web app tabs
function notifyWebAppTabs(msg) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url?.includes("localhost") || tab.url?.includes("127.0.0.1")) {
        chrome.tabs
          .sendMessage(tab.id, {
            ...msg,
            timestamp: Date.now(),
          })
          .catch(() => {});
      }
    });
  });
}

// Monitor LinkedIn navigation
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.url.includes("linkedin.com")) {
      console.log("🔗 LinkedIn page loaded, injecting bridge...");
      linkedinTabId = details.tabId;

      chrome.scripting
        .executeScript({
          target: { tabId: details.tabId },
          files: ["linkedin_content.js"],
        })
        .then(() => {
          console.log("✅ LinkedIn bridge injected");
        })
        .catch((err) => {
          console.log("Script injection error:", err.message);
        });
    }
  },
  {
    url: [{ hostContains: "linkedin.com" }],
  }
);

// Check if LinkedIn tab exists on startup
chrome.tabs.query({ url: "https://www.linkedin.com/*" }, (tabs) => {
  if (tabs.length > 0) {
    linkedinTabId = tabs[0].id;
    console.log("🔗 Found existing LinkedIn tab:", linkedinTabId);

    // Inject script
    chrome.scripting
      .executeScript({
        target: { tabId: linkedinTabId },
        files: ["linkedin_content.js"],
      })
      .catch(() => {});
  }
});

console.log("✅ LinkedIn Bridge background script loaded");
