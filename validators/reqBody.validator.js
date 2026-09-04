import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.js";

export const validateReqBody = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("userName is required")
    .isLowercase()
    .withMessage("userName must be in lowercase"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be a valid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
];
