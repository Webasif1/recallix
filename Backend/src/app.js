import express from "express";
import authRouter from "./routes/auth.route.js";
import itemRoutes from "./routes/item.route.js"
import morgan from "morgan";
import cookie from "cookie-parser"

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie());
app.use(morgan("dev"))

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/api/auth", authRouter)
app.use("/api/items", itemRoutes);

export default app;
