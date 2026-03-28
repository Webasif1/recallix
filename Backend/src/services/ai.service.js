import { ChatMistralAI } from "@langchain/mistralai";
import axios from "axios";
import * as cheerio from "cheerio";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import Item from "../models/Item.model.js";

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const extractTitleFromURL = async (url) => {
  try {
    const { data } = await axios.get(url);
    const dom = cheerio.load(data);
    let title = dom("title").text();

    if (!title) {
      title = $("meta[property='og:title']").attr("content") || "Untitled";
    }

    return title.trim();
  } catch (error) {
    console.error("Title fetch error:", error.message);
    return "Untitled";
  }
};

export const processContent = async (url) => {
  try {
    const title = await extractTitleFromURL(url);

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

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Error:", error);

    return {
      title: "Untitled",
      tags: [],
      folder: "General",
    };
  }
};

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export const decideFolder = async (suggestedFolder, title, tags) => {
  try {
    const collections = await Item.distinct("collection");

    const prompt = `
    You are an AI that organizes content into folders.

    Existing folders:
    ${collections.join(", ") || "None"}

    Suggested folder: ${suggestedFolder}
    Title: ${title}
    Tags: ${tags.join(", ")}

    Rules:
    - If a similar folder exists, return that exact name
    - If not, return a new better folder name
    - Return ONLY folder name (no explanation)

    Answer:
    `;

    const response = await geminiModel.invoke(prompt);

    return response.content.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return suggestedFolder || "General";
  }
};
