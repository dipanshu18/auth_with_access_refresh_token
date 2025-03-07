import { NOT_FOUND, OK } from "../constants/http";
import AppError from "../utils/AppError";
import { catchErrors } from "../utils/catchErrors";
import { db } from "../utils/db";

export const getUserHandler = catchErrors(async (req, res) => {
  const user = await db.user.findFirst({
    where: {
      id: req.userId,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  res.status(OK).json(user);
  return;
});
