import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "url is require"],
      unique: [true, "Url must be unique"],
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
    collection: {
      type: String,
      default: "General",
    },
    summary: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
