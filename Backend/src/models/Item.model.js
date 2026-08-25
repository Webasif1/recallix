import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "url is require"],
    },
    title: {
      type: String,
      default: "Untitled",
    },
    type: {
      type: String,
      enum: ["article", "video", "image", "pdf", "other"],
      default: "other",
    },
    tags: [
      {
        type: String,
      },
    ],
    // NOTE: `collection` shadows a reserved Mongoose document property
    // (doc.collection is the driver handle). It works as a schema path and the
    // browser extension depends on this field name, so it stays — read it via
    // doc.get("collection") or a lean object if you ever hit the shadow.
    collection: {
      type: String,
      default: "General",
    },
    summary: {
      type: String,
      default: "",
    },
    // Preview image scraped from the page (og:image and friends). Null when
    // the page has none — the client renders a generated tile in that case,
    // so never store a placeholder URL here.
    image: {
      type: String,
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// A link is unique per user, not globally — two people may save the same page.
// Replaces the old global `url_1` index; run scripts/drop-url-index.js once
// against an existing database to remove it.
itemSchema.index({ user: 1, url: 1 }, { unique: true });

// Every list/search query filters by user and sorts by recency
itemSchema.index({ user: 1, createdAt: -1 });

const Item = mongoose.model("Item", itemSchema);

export default Item;
