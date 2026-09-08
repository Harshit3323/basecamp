import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail, emailVerificationTemplate } from "../utils/mail.js";
import { tokenGenerator } from "../utils/tokenGenerator.js";
import { createHmac } from "crypto";

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
  sendMail({
    email: user.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationTemplate(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  }).catch((error) => {
    console.error("Email verification message was not sent:", error);
  });
  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry",
  );

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) throw new apiError(401, "Invalid email or password");

  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) throw new apiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = await tokenGenerator(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new apiResponse(200, null, "Login successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: "" },
  });

  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new apiResponse(200, null, "Logout successful"));
});

export const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiResponse(200, req.user, "currect user data fetched successfully"),
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken)
    throw new apiError(400, "Email verification token is required");

  const hashedVerificationToken = createHmac("sha256", process.env.JWT_SECRET)
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedVerificationToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) throw new apiError(400, "token is invalid or expired");

  user.isEmailVerified = true;

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, undefined, "Email verification complete"));
});

export const resendVerificationMail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new apiError(404, "User doesn't exist");

  if (user.isEmailVerified)
    throw new apiError(409, "Email is already verified");
  const { unhashedToken, hashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  sendMail({
    email: user.email,
    subject: "Email Verification",
    mailgenContent: emailVerificationTemplate(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  }).catch((error) => {
    console.error("Email verification message was not sent:", error);
  });

  return res
    .status(200)
    .json(new apiResponse(200, null, "Verification email sent successfully"));
});
