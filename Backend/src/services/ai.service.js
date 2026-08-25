import { ChatMistralAI } from "@langchain/mistralai";
import axios from "axios";
import * as cheerio from "cheerio";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import Item from "../models/Item.model.js";

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Turn a candidate preview-image src into a usable absolute URL.
 *
 * og:image is frequently relative ("/static/hero.png") or protocol-relative,
 * and occasionally a data: URI we do not want to store in Mongo. Anything that
 * is not plain http(s) after resolution is rejected.
 */
const resolveImage = (src, pageUrl) => {
  if (!src || typeof src !== "string") return null;

  const trimmed = src.trim();
  if (!trimmed) return null;

  try {
    const resolved = new URL(trimmed, pageUrl);

    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }

    return resolved.toString();
  } catch {
    return null;
  }
};

/**
 * Fetch a page once and pull out everything we display.
 *
 * Previously this only returned the title and discarded the parsed document,
 * so the preview image had to be scraped again later. Both come out of the
 * same cheerio pass now — one request, no extra cost.
 */
export const scrapePage = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      // Some sites 403 a bare axios UA
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecallixBot/1.0)" },
    });

    const dom = cheerio.load(data);

    let title = dom("title").text().trim();

    if (!title) {
      title =
        dom("meta[property='og:title']").attr("content")?.trim() ||
        dom("meta[name='twitter:title']").attr("content")?.trim() ||
        "Untitled";
    }

    const image =
      resolveImage(dom("meta[property='og:image']").attr("content"), url) ||
      resolveImage(
        dom("meta[property='og:image:secure_url']").attr("content"),
        url,
      ) ||
      resolveImage(dom("meta[name='twitter:image']").attr("content"), url) ||
      resolveImage(dom("link[rel='image_src']").attr("href"), url) ||
      null;

    return { title: title.trim(), image };
  } catch (error) {
    console.error("Page fetch error:", error.message);
    return { title: "Untitled", image: null };
  }
};

export const processContent = async (url) => {
  // Scraped OUTSIDE the try below: if the model call fails we still want the
  // real title and preview image rather than degrading the whole save to
  // "Untitled" with no thumbnail.
  const { title, image } = await scrapePage(url);

  try {

    const prompt = `
    You are an AI that organizes saved content.

    Return ONLY valid JSON:
    {
      "title": "clean title",
      "tags": ["tag1", "tag2"],
      "folder": "folder-name",
      "summary": "short 2-3 line summary"
    }

    Rules:
    - Summary must be simple and clear
    - Max 2-3 lines
    - Tags max 5
    - Folder broad category

    Content:
    Title: ${title}
    URL: ${url}
    `;

    const response = await mistralModel.invoke(prompt);

    const text = response.content;

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    const cleanJson = text.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(cleanJson);

    // The scraped <title> is usually better than whatever the model invents
    return {
      title: parsed.title?.trim() || title || "Untitled",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      folder: parsed.folder?.trim() || "General",
      summary: parsed.summary?.trim() || "",
      image,
    };
  } catch (error) {
    console.error("AI Error:", error.message);

    // Degrade to the scraped metadata rather than losing the save entirely
    return {
      title: title || "Untitled",
      tags: [],
      folder: "General",
      summary: "",
      image,
    };
  }
};

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export const decideFolder = async (suggestedFolder, title, tags, userId) => {
  try {
    // Scoped to the saving user — one account's folder names must never leak
    // into another account's prompt.
    const collections = await Item.distinct("collection", { user: userId });

    const prompt = `
You are an AI that organizes content into folders.

Existing folders:
${collections.join(", ") || "None"}

New content:
Title: ${title}
Tags: ${(tags || []).join(", ")}

Rules:
- If an existing folder is clearly relevant (e.g., same topic, category, or domain), reuse it.
- If no existing folder is a good match, create a new, appropriate folder.
- Do NOT force reuse of an unrelated folder just to avoid creating a new one.
- Folder names must be short (1–2 words), broad but descriptive (e.g., "AI", "Frontend", "Design").
- Avoid overly specific names like "React Hooks" – prefer "Frontend" or "React".
- Output ONLY the folder name, nothing else.

Answer:
`

    const response = await geminiModel.invoke(prompt);

    const result = response.content.trim();

    const normalize = (str) => str.toLowerCase().trim();

    const similarFolder = collections.find(
      (folder) =>
        normalize(folder).includes(normalize(result)) ||
        normalize(result).includes(normalize(folder)),
    );

    return similarFolder || result || suggestedFolder || "General";
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return suggestedFolder || "General";
  }
};
