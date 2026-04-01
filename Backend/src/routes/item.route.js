import express from "express";
import {
  createItem,
  getItems,
  deleteItem,
  searchItems,
  getResurfacedItems,
  getRelatedItems,
  semanticSearch,
} from "../controller/item.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", createItem);

router.get("/", getItems);
router.get("/search", authUser, searchItems);
router.get("/semantic-search", authUser, semanticSearch);
router.get("/resurface", authUser, getResurfacedItems);
router.get("/:id/related", authUser, getRelatedItems);

router.delete("/:id", authUser, deleteItem);

export default router;
