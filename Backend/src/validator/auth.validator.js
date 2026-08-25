import { body, validationResult } from "express-validator";
import { responseMessage } from "../utils/responseMessage.js";

export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const list = errors.array();

    // Same envelope as every other endpoint, so the client can always read
    // `message`. Field errors ride along in `data` for inline form display.
    return responseMessage(res, {
      status: 400,
      message: list[0].msg,
      success: false,
      error: "Validation failed",
      data: {
        fields: list.map(({ path, msg }) => ({ field: path, message: msg })),
      },
    });
  }

  next();
}

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validate,
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];
