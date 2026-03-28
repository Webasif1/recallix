import express from "express";
import {
  createItem,
  getItems,
  deleteItem,
  searchItems,
  getResurfacedItems,
  getRelatedItems,
} from "../controller/item.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authUser, createItem);

router.get("/",authUser, getItems);
router.get("/search", authUser, searchItems);
router.get("/resurface", authUser, getResurfacedItems);
router.get("/:id/related", authUser, getRelatedItems);

router.delete("/:id",authUser, deleteItem);

export default router;
