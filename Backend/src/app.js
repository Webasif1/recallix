import express from "express";
import authRouter from "./routes/auth.route.js";
import itemRoutes from "./routes/item.route.js";
import morgan from "morgan";
import cookie from "cookie-parser";
import cors from "cors";
import path from "path"


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"))
app.use(cookie());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "chrome-extension://oanhpfjblpgdfnnfgkfjhakcchnmjhfc",
      "https://recallix-3xvg.onrender.com",
      "https://69d224a1c1d67ef51d7855d3--recallixgg.netlify.app",
      "http://localhost:5173"
    ], // your extension ID
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemRoutes);

export default app;
