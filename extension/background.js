chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToRecallix",
    title: "Save to Recallix",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveToRecallix") {
    const url = tab.url;

    await fetch("http://localhost:5000/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    console.log("Saved via right-click 🚀");
  }
});
