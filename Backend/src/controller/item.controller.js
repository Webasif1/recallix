import Item from "../models/Item.model.js";
import { processContent, decideFolder } from "../services/ai.service.js";
import { detectType } from "../utils/detectType.js";

export const createItem = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const aiData = await processContent(url);
    const finalFolder = await decideFolder(
      aiData.folder,
      aiData.title,
      aiData.tags,
    );

    const type = detectType(url);

    const newItem = await Item.create({
      url,
      title: aiData.title,
      tags: aiData.tags,
      collection: finalFolder,
      type: type,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Create Item Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const items = await Item.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
        { collection: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const getResurfacedItems = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const date = new Date();
    date.setDate(date.getDate() - days);

    const items = await Item.find({
      createdAt: { $lte: date },
    })
      .sort({ createdAt: 1 }) // oldest first
      .limit(10);

    res.json(items);
  } catch (error) {
    console.error("Resurface Error:", error);
    res.status(500).json({ error: "Failed to resurface items" });
  }
};
