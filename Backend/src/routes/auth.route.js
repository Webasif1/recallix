import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
  register,
  login,
  getMe,
  verifyEmail,
} from "../controller/auth.controller.js";
import {
  registerValidator,
  loginValidation,
} from "../validator/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidation, login);
authRouter.get("/get-me", authUser, getMe);

authRouter.get("/verify-email", verifyEmail);

export default authRouter;
