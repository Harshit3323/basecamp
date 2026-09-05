import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail, emailVerificationTemplate } from "../utils/mail.js";
import { tokenGenerator } from "../utils/tokenGenerator.js";

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
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unhashedToken}`,
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
