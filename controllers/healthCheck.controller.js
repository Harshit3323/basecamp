import mongoose from "mongoose";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";

export const healthCheck = async (req, res) => {
  try {
    throw new Error("Test error");
    res.status(200).json(new apiResponse(200, "Server Is Running"));
  } catch (error) {
    res.status(500).json(new apiError(500, error.message, [], undefined));
  }
};
