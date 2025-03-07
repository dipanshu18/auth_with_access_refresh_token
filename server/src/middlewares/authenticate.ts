import type { RequestHandler } from "express";
import AppError from "../utils/AppError";
import { UNAUTHORIZED } from "../constants/http";
import { AppErrorCode } from "../constants/appErrorCode";
import jwt, { JsonWebTokenError, type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../constants/env";

export const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    throw new AppError(
      UNAUTHORIZED,
      "Not authorized",
      AppErrorCode.InvalidAccessToken
    );
  }

  let decoded: JwtPayload | undefined;
  try {
    decoded = jwt.verify(accessToken, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      if (error.message === "token-expired") {
        throw new AppError(
          UNAUTHORIZED,
          "Token expired",
          AppErrorCode.InvalidAccessToken
        );
      }
    }
  }

  if (!decoded) {
    throw new AppError(
      UNAUTHORIZED,
      "Invalid token",
      AppErrorCode.InvalidAccessToken
    );
  }

  req.userId = decoded.userId;
  req.sessionId = decoded.sessionId;

  next();
};
