chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToRecallix",
    title: "Save to Recallix",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveToRecallix") {
    const url = tab.url;

    try {
      const res = await fetch("http://localhost:3000/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error("Failed to save");

      console.log("Saved via right-click 🚀");
    } catch (err) {
      console.error(err);
    }
  }
});
