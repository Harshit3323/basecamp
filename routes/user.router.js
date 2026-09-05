import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { Router } from "express";
import {
  validateReqBody,
  loginVlidator,
} from "../validators/reqBody.validator.js";
import { validateRequest } from "../middleware/validation.middleware.js";
const userRouter = Router();

userRouter.post("/register", validateReqBody, validateRequest, registerUser);

userRouter.post("/login", loginVlidator, validateRequest, loginUser);

export default userRouter;
