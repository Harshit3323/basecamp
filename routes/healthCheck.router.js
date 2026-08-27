import { healthCheck } from "../controllers/healthCheck.controller.js";
import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", healthCheck);

export default healthRouter;
