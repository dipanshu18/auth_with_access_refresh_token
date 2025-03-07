import { Router } from "express";
import {
  sendPasswordResetHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
  passwordResetHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/email/verify/:code", verifyEmailHandler);
authRoutes.post("/password/forgot", sendPasswordResetHandler);
authRoutes.post("/password/reset", passwordResetHandler);

export default authRoutes;
