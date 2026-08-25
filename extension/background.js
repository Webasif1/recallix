import { API_BASE } from "./config.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToRecallix",
    title: "Save to Recallix",
    contexts: ["page", "link"],
  });
});

const notify = (title, message) => {
  // The popup is closed during a context-menu save, so use a badge instead of
  // a silent console.log the user never sees.
  chrome.action.setBadgeText({ text: title });
  chrome.action.setBadgeBackgroundColor({ color: "#4f46e5" });
  chrome.action.setTitle({ title: message });

  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 4000);
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "saveToRecallix") return;

  const url = info.linkUrl || tab?.url;
  if (!url || !/^https?:/i.test(url)) return;

  try {
    const res = await fetch(`${API_BASE}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Cookie-based auth — omitted before, so every save was rejected.
      credentials: "include",
      body: JSON.stringify({ url }),
    });

    if (res.status === 401) {
      notify("!", "Sign in to Recallix, then try again");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      notify("!", body.message || "Could not save to Recallix");
      return;
    }

    notify("✓", "Saved to Recallix");
  } catch (err) {
    notify("!", `Network error: ${err.message}`);
  }
});
