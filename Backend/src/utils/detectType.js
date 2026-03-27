export const detectType = (url) => {
  if (!url) return "other";

  const lowerUrl = url.toLowerCase();

  // 🎥 Video
  if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be") ||
    lowerUrl.includes("vimeo.com")
  ) {
    return "video";
  }

  // 📄 PDF
  if (lowerUrl.endsWith(".pdf")) {
    return "pdf";
  }

  // 🖼️ Image
  if (
    lowerUrl.endsWith(".jpg") ||
    lowerUrl.endsWith(".jpeg") ||
    lowerUrl.endsWith(".png") ||
    lowerUrl.endsWith(".webp")
  ) {
    return "image";
  }

  // 📰 Article (default for links)
  if (lowerUrl.startsWith("http")) {
    return "article";
  }

  return "other";
};
