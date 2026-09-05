import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { Router } from "express";
import {
  validateReqBody,
  loginVlidator,
} from "../validators/reqBody.validator.js";
import { validateRequest } from "../middleware/validation.middleware.js";
const userRouter = Router();

userRouter.post("/register", validateReqBody, validateRequest, registerUser);

userRouter.post("/login", loginVlidator, validateRequest, loginUser);

userRouter.post("/logout", authMiddleware, logoutUser);

export default userRouter;
