import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { register, login, getMe, verifyEmail } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/get-me", authUser, getMe)

authRouter.get("/verify-email", verifyEmail)

export default authRouter;
