const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const url = tab.url;

  await fetch("http://localhost:5000/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  alert("Saved to Recallix 🚀");
});
