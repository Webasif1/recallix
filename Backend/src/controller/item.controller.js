import Item from "../models/Item.model.js";
import { processContent, decideFolder } from "../services/ai.service.js";
import { detectType } from "../utils/detectType.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { responseMessage } from "../utils/responseMessage.js";

export const createItem = async (req, res) => {
  console.log(req.user)
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const existingItem = await Item.findOne({ url });

    if (existingItem) {
      return res.status(400).json({
        error: "Item already saved",
      });
    }

    const aiData = await processContent(url);
    const finalFolder = await decideFolder(
      aiData.folder,
      aiData.title,
      aiData.tags,
    );
    const textForEmbedding = `
          ${aiData.title}
          ${aiData.summary}
          ${aiData.tags.join(" ")}
          `;

    const embedding = await generateEmbedding(textForEmbedding);

    const type = detectType(url);

    const newItem = await Item.create({
      url,
      user: req.user,
      title: aiData.title,
      tags: aiData.tags,
      collection: finalFolder,
      type: type,
      summary: aiData.summary,
      embedding: embedding,
    });

    responseMessage(res, {
      status: 201,
      message: "Item created successfully",
      success: true,
      data: newItem,
    });
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

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;

    const queryEmbedding = await generateEmbedding(query);

    const items = await Item.find();

    const scoredItems = items.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { ...item.toObject(), score };
    });

    scoredItems.sort((a, b) => b.score - a.score);

    const formattedItems = scoredItems.slice(0, 5).map((item) => ({
      url: item.url,
      title: item.title,
      tags: item.tags,
      collection: item.collection,
      type: item.type,
      summary: item.summary,
    }));

    responseMessage(res, {
      status: 201,
      message: "Item fetch successfully",
      success: true,
      data: formattedItems,
    });
    // res.json(scoredItems.slice(0, 5));
  } catch (error) {
    console.error("Semantic Search Error:", error);
    res.status(500).json({ error: "Semantic search failed" });
  }
};

export const getItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user }).sort({
      createdAt: -1,
    });
    const formattedItems = items.map((item) => ({
      url: item.url,
      title: item.title,
      tags: item.tags,
      collection: item.collection,
      type: item.type,
      summary: item.summary,
    }));

    responseMessage(res, {
      status: 201,
      message: "Item fetch successfully",
      success: true,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete item" });
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
      .sort({ createdAt: 1 })
      .limit(10);

    const formattedItems = items.map((item) => ({
      url: item.url,
      title: item.title,
      tags: item.tags,
      collection: item.collection,
      type: item.type,
      summary: item.summary,
    }));

    responseMessage(res, {
      status: 201,
      message: "Item fetch successfully",
      success: true,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Resurface Error:", error);
    res.status(500).json({ error: "Failed to resurface items" });
  }
};

export const getRelatedItems = async (req, res) => {
  try {
    const { id } = req.params;

    const currentItem = await Item.findById(id);

    if (!currentItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const relatedItems = await Item.find({
      _id: { $ne: id },
      $or: [
        { tags: { $in: currentItem.tags } },
        { collection: currentItem.collection },
      ],
    })
      .limit(5)
      .sort({ createdAt: -1 });

    res.json(relatedItems);
  } catch (error) {
    console.error("Related Items Error:", error);
    res.status(500).json({ error: "Failed to fetch related items" });
  }
};
