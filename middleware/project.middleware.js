import { ProjectMember } from "../models/projectMember.model.js";
import { Project } from "../models/project.model.js";
import apiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyProjectPermission = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!membership) {
      return next(new apiError(403, "You are not a member of this project"));
    }

    if (allowedRoles.length && !allowedRoles.includes(membership.role)) {
      return next(
        new apiError(403, "You don't have permission to perform this action"),
      );
    }

    req.projectMembership = membership;
    next();
  });

export const validateProjectExists = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new apiError(404, "Project not found"));
  }

  req.project = project;
  next();
});

export const verifyMemberExists = asyncHandler(async (req, res, next) => {
  const { projectId, userId } = req.params;

  const membership = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });

  if (!membership) {
    return next(new apiError(404, "This user is not a member of the project"));
  }

  req.targetMembership = membership;
  next();
});
