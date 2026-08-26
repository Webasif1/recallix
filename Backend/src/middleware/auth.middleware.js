import jwt from "jsonwebtoken";
import { responseMessage } from "../utils/responseMessage.js";
import redis from "../config/cache.js";

/** Key holding the epoch-seconds of a user's last password change. */
export const passwordChangeKey = (userId) => `pwchange:${userId}`;

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

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res, "Invalid token");
  }

  // Two cache checks, one round trip:
  //   1. logout() blacklists the exact token — without this a signed-out
  //      cookie stayed valid for its full 7 day lifetime.
  //   2. a password change stamps the user, evicting every token issued
  //      before it. A JWT cannot be recalled, so this is what makes
  //      "change my password" actually lock out other devices.
  let revoked = null;
  let changedAt = null;

  try {
    [revoked, changedAt] = await redis.mget(
      token,
      passwordChangeKey(decoded.id),
    );
  } catch (err) {
    // Fail open, as the blacklist always has: an unreachable cache must not
    // lock every user out of the product. The trade-off is that the eviction
    // guarantee is only as available as Redis.
    console.error("Redis session lookup failed:", err.message);
  }

  if (revoked) {
    return unauthorized(res, "Token revoked");
  }

  if (changedAt && decoded.iat && decoded.iat < Number(changedAt)) {
    return unauthorized(res, "Password changed");
  }

  req.user = decoded;
  next();
}
