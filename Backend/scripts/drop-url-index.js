/**
 * One-shot migration.
 *
 * Item.url used to carry a GLOBAL unique index (`url_1`), which meant the
 * second user to save any given link got a duplicate-key error. The schema now
 * declares a compound {user, url} index instead, but Mongo does not drop the
 * old one on its own — an existing database keeps enforcing it forever.
 *
 * Run once per environment:  node scripts/drop-url-index.js
 * It is safe to run again; a missing index is reported and skipped.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Item from "../src/models/Item.model.js";

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const indexes = await Item.collection.indexes();
  console.log(
    "Existing indexes:",
    indexes.map((i) => i.name).join(", "),
  );

  const legacy = indexes.find((i) => i.name === "url_1");

  if (legacy) {
    await Item.collection.dropIndex("url_1");
    console.log("Dropped legacy global index url_1.");
  } else {
    console.log("No legacy url_1 index found — nothing to drop.");
  }

  // Creates {user,url} unique + {user,createdAt} from the schema declaration.
  // Fails loudly if pre-existing rows violate uniqueness, which is what we want.
  await Item.syncIndexes();
  console.log("Indexes synced.");

  const after = await Item.collection.indexes();
  console.log(
    "Final indexes:",
    after.map((i) => i.name).join(", "),
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error("Migration failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
