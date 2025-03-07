import { z } from "zod";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { catchErrors } from "../utils/catchErrors";
import {
  createAccount,
  loginAccount,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../utils/cookies";
import { db } from "../utils/db";
import { JWT_SECRET } from "../constants/env";
import AppError from "../utils/AppError";

const registerSchema = z
  .object({
    email: z.string().email().min(1).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string(),
  userAgent: z.string().optional(),
});

const verificationCodeSchema = z.string().min(1).max(25);
const emailSchema = z.string().email().min(1).max(255);
const resetPasswordSchema = z.object({
  verificationCode: z.string().min(1).max(25),
  password: z.string().min(6).max(255),
});

export const registerHandler = catchErrors(async (req, res) => {
  // validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  // call service
  const { user, accessToken, refreshToken } = await createAccount(request);

  // return response
  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  res.status(CREATED).json({
    user,
    accessToken,
    refreshToken,
  });
  return;
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await loginAccount(request);

  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  res.status(OK).json({
    user,
    accessToken,
    refreshToken,
  });
  return;
});

export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    throw new AppError(UNAUTHORIZED, "Missing refresh token");
  }

  const { accessToken, newRefreshToken } = await refreshUserAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());

  res.status(OK).json({
    message: "Access token refreshed",
    accessToken,
    refreshToken,
  });
  return;
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  const payload = jwt.verify(accessToken || "", JWT_SECRET) as JwtPayload;
  if (payload) {
    await db.session.delete({ where: { id: payload.sessionId } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  res.status(OK).json({ message: "Logout successful" });
  return;
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  res.status(OK).json({
    message: "Email was successfully verified",
  });
  return;
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordResetEmail(email);

  res.status(OK).json({
    message: "Password reset email sent",
  });
  return;
});

export const passwordResetHandler = catchErrors(async (req, res) => {
  const { verificationCode, password } = resetPasswordSchema.parse(req.body);

  await resetPassword(verificationCode, password);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", {
    path: "/auth/refresh",
  });

  res.status(OK).json({
    message: "Password reset successful",
  });
  return;
});
