import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import AppError from "../utils/AppError";
import { compareValue, hashValue } from "../utils/bcrypt";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import { db } from "../utils/db";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export type LoginAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export async function createAccount(data: CreateAccountParams) {
  // verify user doesn't exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(CONFLICT, "Email already in use");
  }

  // create user
  const hashPassword = await hashValue(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashPassword,
    },
    omit: {
      password: true,
    },
  });

  // create verification code
  const verificationCode = await db.verificationCode.create({
    data: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      expiresAt: oneYearFromNow(),
    },
  });

  // send verification email

  // create session
  const session = await db.session.create({
    data: {
      userAgent: data.userAgent,
      userId: user.id,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // sign access token && refresh token
  const refreshToken = jwt.sign(
    {
      sessionId: session.id,
    },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    {
      userId: user.id,
      sessionId: session.id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  // return user & tokens
  return {
    user,
    refreshToken,
    accessToken,
  };
}

export async function loginAccount(data: LoginAccountParams) {
  // verify user doesn't exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!existingUser) {
    throw new AppError(UNAUTHORIZED, "Invalid email or password");
  }

  // if (existingUser) {
  //   throw new Error("User already exists");
  // }

  // check user password
  const isPasswordValid = await compareValue(
    data.password,
    existingUser.password
  );

  if (!isPasswordValid) {
    throw new AppError(UNAUTHORIZED, "Invalid email or password");
  }

  // create session
  const session = await db.session.create({
    data: {
      userAgent: data.userAgent,
      userId: existingUser.id,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  // sign access token && refresh token
  const refreshToken = jwt.sign(
    {
      sessionId: session.id,
    },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    {
      userId: existingUser.id,
      sessionId: session.id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  // return user & tokens
  const { password, ...user } = existingUser;
  return {
    user,
    refreshToken,
    accessToken,
  };
}

export const refreshUserAccessToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;

  if (!payload) {
    throw new AppError(UNAUTHORIZED, "Invalid refresh token");
  }

  const session = await db.session.findFirst({
    where: { id: payload.sessionId },
  });
  const now = Date.now();

  if (!session) {
    throw new AppError(UNAUTHORIZED, "Session expired");
  }

  if (session.expiresAt.getTime() < now) {
    throw new AppError(UNAUTHORIZED, "Session expired");
  }

  // Refresh session if expires in the next 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    await db.session.update({
      where: {
        id: payload.sessionId,
      },
      data: {
        expiresAt: thirtyDaysFromNow(),
      },
    });
  }

  // sign access token && refresh token
  const newRefreshToken = sessionNeedsRefresh
    ? jwt.sign(
        {
          sessionId: session.id,
        },
        JWT_REFRESH_SECRET,
        {
          audience: ["user"],
          expiresIn: "30d",
        }
      )
    : undefined;

  const accessToken = jwt.sign(
    {
      userId: session.userId,
      sessionId: session.id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  // get the verification code
  const validCode = await db.verificationCode.findFirst({
    where: {
      id: code,
      type: "EMAIL_VERIFICATION",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  console.log(validCode);

  if (!validCode) {
    throw new AppError(NOT_FOUND, "Invalid or expired verification code");
  }

  // update user to verified to true
  const updatedUser = await db.user.update({
    where: {
      id: validCode.userId,
    },
    data: {
      verified: true,
    },
    omit: {
      password: true,
    },
  });

  if (!updatedUser) {
    throw new AppError(INTERNAL_SERVER_ERROR, "Failed to verify email");
  }

  // delete verification code
  await db.verificationCode.delete({ where: { id: code } });

  // return the user
  return {
    user: updatedUser,
  };
};

export const sendPasswordResetEmail = async (email: string) => {
  // get the user by email
  const user = await db.user.findFirst({ where: { email } });

  if (!user) {
    throw new AppError(NOT_FOUND, "User not found");
  }

  // check email rate limit
  const fiveMinAgo = fiveMinutesAgo();
  const count = await db.verificationCode.count({
    where: {
      userId: user.id,
      type: "RESET_PASSWORD",
      createdAt: {
        gt: fiveMinAgo,
      },
    },
  });

  if (count >= 1) {
    throw new AppError(
      TOO_MANY_REQUESTS,
      "Too many requests, please try again later"
    );
  }

  // create verification code
  const expiresAt = oneHourFromNow();
  const verificationCode = await db.verificationCode.create({
    data: {
      userId: user.id,
      type: "RESET_PASSWORD",
      expiresAt,
    },
  });

  // send verification email
  const url = `${APP_ORIGIN}/password/reset?code=${
    verificationCode.id
  }&exp=${expiresAt.getTime()}`;
  // send email with the url
  console.log(url);

  // return success
  return {
    url,
  };
};

export const resetPassword = async (code: string, password: string) => {
  // get the verification code
  const validCode = await db.verificationCode.findFirst({
    where: {
      id: code,
      type: "RESET_PASSWORD",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!validCode) {
    throw new AppError(NOT_FOUND, "Invalid or expired  verification code");
  }

  // update the users password
  const hashPass = await hashValue(password);
  const updatedUser = await db.user.update({
    where: {
      id: validCode.userId,
    },
    data: {
      password: hashPass,
    },
    omit: {
      password: true,
    },
  });

  if (!updatedUser) {
    throw new AppError(INTERNAL_SERVER_ERROR, "Failed to reset password");
  }

  // delete the verification code
  await db.verificationCode.delete({
    where: { id: validCode.id },
  });

  // delete all sessions
  await db.session.deleteMany({
    where: {
      userId: updatedUser.id,
    },
  });

  return {
    user: updatedUser,
  };
};
