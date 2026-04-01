import jwt, { decode } from "jsonwebtoken";
import { responseMessage } from "../utils/responseMessage.js";

export async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return responseMessage(res, {
      status: 401,
      message: "unauthorized",
      success: false,
      error: "No token Provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return responseMessage(res, {
      status: 401,
      message: "unauthorized",
      success: false,
      error: "Invalid token",
    });
  }
}
