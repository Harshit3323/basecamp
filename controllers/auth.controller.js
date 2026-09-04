import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail, emailVerificationTemplate } from "../utils/mail.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, userName, password, role } = req.body;
  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser)
    throw new apiError(409, `user with the same email/username already exists`);
  const user = await User.create({
    userName,
    email,
    password,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationTemplate(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unhashedToken}`,
    ),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
  );

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});
