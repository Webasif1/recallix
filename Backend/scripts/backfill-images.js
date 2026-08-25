/**
 * One-off backfill.
 *
 * Item.image was added after these rows were written, so every link saved
 * before that has no preview image and renders the generated fallback tile.
 * This re-scrapes those pages and fills the field in.
 *
 * Run once per environment:  node scripts/backfill-images.js
 *
 * Safe to re-run: it only looks at items that still have no image, so a second
 * run only retries the ones that failed. Pages that are gone or serve no
 * og:image stay null and keep the fallback tile — that is a valid end state,
 * not an error.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Item from "../src/models/Item.model.js";
import { scrapePage } from "../src/services/ai.service.js";

// Be a polite crawler: one page at a time, with a gap between hosts.
const DELAY_MS = 400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const pending = await Item.find({
    $or: [{ image: null }, { image: { $exists: false } }],
  }).select("_id url title");

  if (pending.length === 0) {
    console.log("Nothing to backfill — every item already has an image.");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`${pending.length} item(s) without a preview image.\n`);

  let found = 0;
  let missing = 0;

  for (const [index, item] of pending.entries()) {
    const position = `[${index + 1}/${pending.length}]`;

    try {
      const { image } = await scrapePage(item.url);

      if (image) {
        await Item.updateOne({ _id: item._id }, { $set: { image } });
        found++;
        console.log(`${position} ok       ${item.title?.slice(0, 48)}`);
      } else {
        missing++;
        console.log(`${position} no image ${item.title?.slice(0, 48)}`);
      }
    } catch (err) {
      missing++;
      console.log(`${position} failed   ${item.url} — ${err.message}`);
    }

    if (index < pending.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nimages found: ${found}`);
  console.log(`still without: ${missing}  (these keep the fallback tile)`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error("Backfill failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
