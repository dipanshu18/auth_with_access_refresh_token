import type { CookieOptions } from "express";
import { NODE_ENV } from "../constants/env";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure,
};

export function getAccessTokenCookieOptions(): CookieOptions {
  return {
    ...defaults,
    expires: fifteenMinutesFromNow(),
  };
}

export function getRefreshTokenCookieOptions(): CookieOptions {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: "/auth/refresh",
  };
}
