import "dotenv/config";
import app from "./src/app.js";
import connectToDb from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

// Boot order matters: without a database every request 500s, so we connect
// before we start accepting traffic and exit if that fails.
const start = async () => {
  await connectToDb();

  app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
  });
};

start();
