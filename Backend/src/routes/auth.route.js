import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
} from "../controller/auth.controller.js";
import {
  registerValidator,
  loginValidation,
  updateProfileValidator,
  changePasswordValidator,
} from "../validator/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidation, login);
authRouter.get("/get-me", authUser, getMe);

authRouter.patch("/me", authUser, updateProfileValidator, updateProfile);
authRouter.patch(
  "/password",
  authUser,
  changePasswordValidator,
  changePassword,
);

authRouter.get("/log-out", authUser, logout);

export default authRouter;
