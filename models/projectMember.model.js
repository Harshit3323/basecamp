import mongoose, { Schema } from "mongoose";

const AvailableUserRoles = ["admin", "project_admin", "member"];

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: "member",
    },
  },
  { timestamps: true },
);

// one membership per user per project — prevents duplicate joins
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

projectMemberSchema.statics.isLastAdmin = async function (
  projectId,
  excludingUserId,
) {
  const adminCount = await this.countDocuments({
    project: projectId,
    role: "admin",
    user: { $ne: excludingUserId }, // count admins NOT including the one being changed
  });
  return adminCount === 0; // true only if removing/demoting this one leaves zero admins
};
export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
export { AvailableUserRoles };
