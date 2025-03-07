import type { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";

function handleZodError(res: Response, error: z.ZodError) {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });

  return;
}

function handleAppError(res: Response, error: AppError) {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });

  return;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (req.path === "/auth/refresh") {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", {
      path: "/auth/refresh",
    });
  }

  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  return;
};
