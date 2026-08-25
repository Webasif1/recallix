import jwt from "jsonwebtoken";
import { responseMessage } from "../utils/responseMessage.js";
import redis from "../config/cache.js";

const unauthorized = (res, error) =>
  responseMessage(res, {
    status: 401,
    message: "Your session has expired. Please sign in again.",
    success: false,
    error,
  });

export async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return unauthorized(res, "No token Provided");
  }

  try {
    // logout() writes the token here; without this check a signed-out cookie
    // stayed valid for its full 7 day lifetime.
    const isBlacklisted = await redis.get(token).catch((err) => {
      // Redis being down must not lock everyone out — fail open on the
      // blacklist, the signature check below still applies.
      console.error("Redis blacklist lookup failed:", err.message);
      return null;
    });

    if (isBlacklisted) {
      return unauthorized(res, "Token revoked");
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return unauthorized(res, "Invalid token");
  }
}
