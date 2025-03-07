import { Router } from "express";
import {
  deleteSession,
  getAllUserSessions,
} from "../controllers/session.controller";

const sessionRoutes = Router();

sessionRoutes.get("/", getAllUserSessions);

sessionRoutes.delete("/:id", deleteSession);

export { sessionRoutes };
