import { z } from "zod";
import { NOT_FOUND, OK } from "../constants/http";
import AppError from "../utils/AppError";
import { catchErrors } from "../utils/catchErrors";
import { db } from "../utils/db";

const sessionIdSchema = z.string().min(1).max(25);

export const getAllUserSessions = catchErrors(async (req, res) => {
  const sessions = await db.session.findMany({
    where: {
      userId: req.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (sessions.length < 1) {
    throw new AppError(NOT_FOUND, "No active sessions found");
  }

  const withCurrentSessions = sessions.map((session) => ({
    ...session,
    ...(session.id === req.sessionId && {
      isCurrent: true,
    }),
  }));

  res.status(OK).json(withCurrentSessions);
  return;
});

export const deleteSession = catchErrors(async (req, res) => {
  const id = sessionIdSchema.parse(req.params.id);

  const session = await db.session.findFirst({
    where: {
      id,
    },
  });

  if (!session) {
    throw new AppError(NOT_FOUND, "No session found");
  }

  await db.session.delete({
    where: {
      id: session.id,
    },
  });

  res.status(OK).json({
    message: "Session removed",
  });
  return;
});
