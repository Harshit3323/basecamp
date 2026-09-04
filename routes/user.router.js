import { registerUser } from "../controllers/auth.controller.js";
import { Router } from "express";
import { validateReqBody } from "../validators/reqBody.validator.js";
import { validateRequest } from "../middleware/validation.middleware.js";
const userRouter = Router();

userRouter.post("/register", validateReqBody, validateRequest, registerUser);

export default userRouter;
