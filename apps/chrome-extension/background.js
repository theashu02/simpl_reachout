// Message routing hub between tabs
const tabConnections = new Map();
const linkedinData = {
  searchResults: [],
  suggestions: [],
  lastUpdate: null,
};

// Store LinkedIn tab ID
let linkedinTabId = null;

console.log("🚀 Extension background script starting...");

// Handle connections from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📨 Background received:", msg.action, "from tab", sender.tab?.id);

  // Store sender tab info
  if (sender.tab?.id) {
    const tabInfo = {
      url: sender.tab.url,
      title: sender.tab.title,
      isLinkedIn: sender.tab.url?.includes("linkedin.com"),
    };
    tabConnections.set(sender.tab.id, tabInfo);

    // Track LinkedIn tab
    if (tabInfo.isLinkedIn) {
      linkedinTabId = sender.tab.id;
    }
  }

  // Handle search query from web app - route to LinkedIn tab
  if (msg.action === "search_query") {
    console.log("🔍 Routing search query to LinkedIn:", msg.query);

    // Find LinkedIn tabs and send the search command
    chrome.tabs.query({ url: "https://www.linkedin.com/*" }, (tabs) => {
      if (tabs.length > 0) {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "search_query",
              query: msg.query,
            })
            .catch((err) => {
              console.log("Could not send to LinkedIn tab:", err);
            });
        });
        console.log("✅ Search command sent to", tabs.length, "LinkedIn tab(s)");
      } else {
        console.log("⚠️ No LinkedIn tabs found");
        // Notify web app that LinkedIn is not open
        if (sender.tab?.id) {
          chrome.tabs
            .sendMessage(sender.tab.id, {
              action: "error",
              message: "Please open LinkedIn in another tab first",
            })
            .catch(() => {});
        }
      }
    });

    sendResponse({ success: true, message: "Search command sent" });
    return true;
  }

  // Handle LinkedIn search results - route to web app tabs
  if (msg.action === "linkedin_search_results") {
    console.log("📤 Routing LinkedIn results to web apps:", msg.data?.length, "results");

    linkedinData.searchResults = msg.data;
    linkedinData.lastUpdate = Date.now();

    // Find localhost tabs and send the results
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url?.includes("localhost") || tab.url?.includes("127.0.0.1")) {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "linkedin_search_results",
              data: msg.data,
              query: msg.query,
              timestamp: Date.now(),
            })
            .catch(() => {
              // Tab might not have content script
            });
        }
      });
    });

    sendResponse({ success: true });
    return true;
  }

  sendResponse({ success: true });
  return true;
});

// Monitor LinkedIn navigation
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.url.includes("linkedin.com/search/results/")) {
      console.log("🔍 LinkedIn search page loaded");

      // Inject monitor if needed
      chrome.scripting
        .executeScript({
          target: { tabId: details.tabId },
          files: ["linkedin_content.js"],
        })
        .catch((err) => console.log("Script already injected or error:", err));
    }
  },
  {
    url: [{ hostContains: "linkedin.com" }],
  }
);

// Also monitor localhost pages
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    console.log("🌐 Localhost page loaded:", details.url);
  },
  {
    url: [{ hostContains: "localhost" }, { hostContains: "127.0.0.1" }],
  }
);

console.log("✅ LinkedIn Bridge extension loaded successfully");
