import { API_BASE } from "./config.js";

const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");
const titleEl = document.getElementById("pageTitle");
const urlEl = document.getElementById("pageUrl");

const setStatus = (message, tone = "") => {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`;
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

// Show what is about to be saved before the user commits to it
const currentTab = await getActiveTab();
titleEl.textContent = currentTab?.title ?? "This page";

try {
  urlEl.textContent = new URL(currentTab.url).hostname.replace(/^www\./, "");
} catch {
  urlEl.textContent = "";
}

saveBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();

  if (!tab?.url || !/^https?:/i.test(tab.url)) {
    setStatus("This page can't be saved.", "error");
    return;
  }

  saveBtn.disabled = true;
  setStatus("Reading the page…");

  try {
    const res = await fetch(`${API_BASE}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Recallix authenticates with an httpOnly cookie. Without this the
      // request carried no session and every save came back 401.
      credentials: "include",
      body: JSON.stringify({ url: tab.url }),
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 401) {
      setStatus("Sign in to Recallix first, then try again.", "error");
      return;
    }

    if (!res.ok) {
      setStatus(body.message || "Couldn't save this page.", "error");
      return;
    }

    setStatus("Saved to Recallix.", "success");
    saveBtn.textContent = "Saved";
  } catch {
    setStatus("Network error. Check your connection.", "error");
  } finally {
    if (saveBtn.textContent !== "Saved") saveBtn.disabled = false;
  }
});
