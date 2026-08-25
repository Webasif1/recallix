import userModel from "../models/user_model.js";
import { responseMessage } from "../utils/responseMessage.js";
import redis from "../config/cache.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { username, email, password } = req.body;

  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExist) {
    return responseMessage(res, {
      status: 409,
      message: "With this email or username user already exist",
      success: false,
      error: "User already exist",
    });
  }

  const user = await userModel.create({ username, email, password });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  responseMessage(res, {
    status: 200,
    message: "User has been created successfully",
    // Same shape as get-me, including createdAt: the client stores this
    // response as the session user, and the profile and dashboard both show
    // a "member since" date that was blank until the next full page load.
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return responseMessage(res, {
      status: 400,
      message: "Invalid email or password",
      success: false,
      error: "user not found",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return responseMessage(res, {
      status: 400,
      message: "Invalid email or password",
      success: false,
      error: "Incorrect password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  responseMessage(res, {
    status: 200,
    message: "Login successfully",
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user.id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    return responseMessage(res, {
      status: 404,
      message: "User not found",
      success: false,
      err: "User not Found",
    });
  }

  responseMessage(res, {
    status: 200,
    message: "User details fetched successfully",
    success: true,
    data: user,
  });
}

export async function logout(req, res) {
  const token = req.cookies.token;

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  // Blacklist for the token's REMAINING lifetime. The old fixed 1h TTL let a
  // signed-out 7 day token become valid again an hour later.
  if (token) {
    try {
      const { exp } = jwt.decode(token) || {};
      const ttl = exp ? exp - Math.floor(Date.now() / 1000) : 0;

      if (ttl > 0) {
        await redis.set(token, "revoked", "EX", ttl);
      }
    } catch (err) {
      // Never fail a logout because the cache is unavailable — the cookie is
      // already cleared, which is the part the user can see.
      console.error("Logout blacklist write failed:", err.message);
    }
  }

  responseMessage(res, {
    status: 200,
    message: "Logged out successfully",
    success: true,
  });
}
