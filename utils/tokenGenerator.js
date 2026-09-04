import jwt from "jsonwebtoken";
import "dotenv/config";
import { userTokenSchema } from "../validation/userToken.validation.js";
export const generateToken = (payload) => {
  const validatedPayload = userTokenSchema.safeParse(payload);
  if (!validatedPayload.success) {
    throw new Error("Invalid payload for token generation");
  }
  const token = jwt.sign(validatedPayload.data, process.env.JWT_SECRET);
  return token;
};
