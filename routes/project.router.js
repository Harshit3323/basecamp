import { Router } from "express";
import {
  addMember,
  createProject,
  deleteProject,
  editMemberRole,
  listMembers,
  listProjects,
  projectDetails,
  removeMember,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateProjectExists,
  verifyMemberExists,
  verifyProjectPermission,
} from "../middleware/project.middleware.js";

const projectRouter = Router();

projectRouter.get("/", authMiddleware, listProjects);
projectRouter.post("/", authMiddleware, createProject);

projectRouter.get(
  "/:projectId",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(),
  projectDetails,
);
projectRouter.put(
  "/:projectId",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(["admin"]),
  updateProject,
);
projectRouter.delete(
  "/:projectId",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(["admin"]),
  deleteProject,
);

projectRouter.get(
  "/:projectId/members",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(),
  listMembers,
);
projectRouter.post(
  "/:projectId/members",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(["admin"]),
  addMember,
);
projectRouter.put(
  "/:projectId/members/:userId",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(["admin"]),
  verifyMemberExists,
  editMemberRole,
);
projectRouter.delete(
  "/:projectId/members/:userId",
  authMiddleware,
  validateProjectExists,
  verifyProjectPermission(["admin"]),
  verifyMemberExists,
  removeMember,
);

export default projectRouter;
