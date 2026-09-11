import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
projectSchema.methods.isOwner = function (userId) {
  return this.createdBy.equals(userId);
};

projectSchema.index({ createdBy: 1, name: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
