import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { register, login } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", authUser, login);

export default authRouter;
