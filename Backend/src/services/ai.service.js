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

          New content:
          Title: ${title}
          Tags: ${tags.join(", ")}

          Rules:
          - ALWAYS try to reuse an existing folder if it is even slightly related
          - DO NOT create new folder if a similar one exists
          - Only create a new folder if absolutely necessary
          - Keep folder names short and general (1-2 words max)
          - Avoid specific names like "React Hooks", use broader ones like "Frontend"
          - Output ONLY the folder name

          Answer:
          `;

    const response = await geminiModel.invoke(prompt);

    const result = response.content.trim();

    const normalize = (str) => str.toLowerCase().trim();

    const similarFolder = collections.find(
      (folder) =>
        normalize(folder).includes(normalize(result)) ||
        normalize(result).includes(normalize(folder)),
    );

    return similarFolder || result;
  } catch (error) {
    console.error("Gemini Error:", error);
    return suggestedFolder || "General";
  }
};
