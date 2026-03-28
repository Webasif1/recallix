const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  try {
    const res = await fetch("http://localhost:3000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) throw new Error("Failed to save");

    alert("Saved to Recallix 🚀");
  } catch (err) {
    alert("Error saving item. Check console.");
  }
});
