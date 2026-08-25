import mongoose from "mongoose";
import Item from "../models/Item.model.js";
import { processContent, decideFolder } from "../services/ai.service.js";
import { detectType } from "../utils/detectType.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { responseMessage } from "../utils/responseMessage.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { normalizeUrl } from "../utils/normalizeUrl.js";

export const createItem = async (req, res) => {
  try {
    const url = normalizeUrl(req.body.url);

    if (!url) {
      return responseMessage(res, {
        status: 400,
        message: "Enter a valid http or https link",
        success: false,
        error: "URL is required",
      });
    }

    const existingItem = await Item.findOne({ url, user: req.user.id });

    if (existingItem) {
      return responseMessage(res, {
        status: 409,
        message: "You already saved this link",
        success: false,
        error: "Item already saved",
        data: existingItem,
      });
    }

    const aiData = await processContent(url);
    const finalFolder = await decideFolder(
      aiData.folder,
      aiData.title,
      aiData.tags,
      req.user.id,
    );
    const textForEmbedding = `
          ${aiData.title || ""}
          ${aiData.summary || ""}
          ${(aiData.tags || []).join(" ")}
          `;

    const embedding = await generateEmbedding(textForEmbedding);

    const type = detectType(url);

    const newItem = await Item.create({
      url,
      user: req.user.id,
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
    // Compound {user, url} unique index — concurrent saves of the same link
    if (error?.code === 11000) {
      return responseMessage(res, {
        status: 409,
        message: "You already saved this link",
        success: false,
        error: "Item already saved",
      });
    }

    console.error("Create Item Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Could not save this link",
      success: false,
      error: "Something went wrong",
    });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return responseMessage(res, {
        status: 200,
        message: "Empty query",
        success: true,
        data: [],
      });
    }

    const safe = escapeRegex(query.trim());

    const items = await Item.find({
      user: req.user.id,
      $or: [
        { title: { $regex: safe, $options: "i" } },
        { summary: { $regex: safe, $options: "i" } },
        { tags: { $regex: safe, $options: "i" } },
        { collection: { $regex: safe, $options: "i" } },
      ],
    })
      .select("-embedding")
      .sort({ createdAt: -1 });

    responseMessage(res, {
      status: 200,
      message: "Search completed",
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Search Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Search failed",
      success: false,
      error: "Search failed",
    });
  }
};

export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);

    if (!query || !query.trim()) {
      return responseMessage(res, {
        status: 200,
        message: "Empty query",
        success: true,
        data: [],
      });
    }

    const queryEmbedding = await generateEmbedding(query.trim());

    // generateEmbedding returns [] when the provider fails — cosine would be 0
    // for every item and the ranking would be meaningless, so say so instead.
    if (!queryEmbedding.length) {
      return responseMessage(res, {
        status: 503,
        message: "Recall is temporarily unavailable",
        success: false,
        error: "Embedding provider unavailable",
      });
    }

    const items = await Item.find({ user: req.user.id });

    const scoredItems = items
      .map((item) => {
        const { embedding, ...rest } = item.toObject();
        return { ...rest, score: cosineSimilarity(queryEmbedding, embedding) };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    responseMessage(res, {
      status: 200,
      message: "Recall completed",
      success: true,
      data: scoredItems,
    });
  } catch (error) {
    console.error("Semantic Search Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Recall failed",
      success: false,
      error: "Semantic search failed",
    });
  }
};

export const getItems = async (req, res) => {
  try {
    // embedding is ~1024 floats per item and is never used by the client
    const items = await Item.find({ user: req.user.id })
      .select("-embedding")
      .sort({ createdAt: -1 });

    responseMessage(res, {
      status: 200,
      message: "Item fetch successfully",
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get Items Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Failed to fetch items",
      success: false,
      error: "Failed to fetch items",
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseMessage(res, {
        status: 400,
        message: "Invalid item id",
        success: false,
        error: "Invalid item id",
      });
    }

    // Scoped by user so one account can never delete another's item
    const deletedItem = await Item.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deletedItem) {
      return responseMessage(res, {
        status: 404,
        message: "Item not found",
        success: false,
        error: "Item not found",
      });
    }

    responseMessage(res, {
      status: 200,
      message: "Item deleted successfully",
      success: true,
      data: { _id: deletedItem._id },
    });
  } catch (error) {
    console.error("Delete Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Failed to delete item",
      success: false,
      error: "Failed to delete item",
    });
  }
};

export const getResurfacedItems = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const date = new Date();
    date.setDate(date.getDate() - days);

    const items = await Item.find({
      user: req.user.id,
      createdAt: { $lte: date },
    })
      .select("-embedding")
      .sort({ createdAt: 1 })
      .limit(limit);

    responseMessage(res, {
      status: 200,
      message: "Item fetch successfully",
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Resurface Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Failed to resurface items",
      success: false,
      error: "Failed to resurface items",
    });
  }
};

export const getRelatedItems = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return responseMessage(res, {
        status: 400,
        message: "Invalid item id",
        success: false,
        error: "Invalid item id",
      });
    }

    const currentItem = await Item.findOne({ _id: id, user: req.user.id });

    if (!currentItem) {
      return responseMessage(res, {
        status: 404,
        message: "Item not found",
        success: false,
        error: "Item not found",
      });
    }

    const relatedItems = await Item.find({
      user: req.user.id,
      _id: { $ne: id },
      $or: [
        { tags: { $in: currentItem.tags } },
        { collection: currentItem.collection },
      ],
    })
      .select("-embedding")
      .sort({ createdAt: -1 })
      .limit(5);

    responseMessage(res, {
      status: 200,
      message: "Related items fetched successfully",
      success: true,
      data: relatedItems,
    });
  } catch (error) {
    console.error("Related Items Error:", error);
    responseMessage(res, {
      status: 500,
      message: "Failed to fetch related items",
      success: false,
      error: "Failed to fetch related items",
    });
  }
};
