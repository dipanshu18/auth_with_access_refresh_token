import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import { APP_ORIGIN, PORT } from "./constants/env";
import { userRoutes } from "./routes/user.route";
import { authenticate } from "./middlewares/authenticate";
import { sessionRoutes } from "./routes/session.route";

const app = express();

app.use(
  cors({
    methods: ["GET", "POST", "PATCH", "DELETE"],
    origin: [APP_ORIGIN ?? "*"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(OK).json({ message: "healthy" });
  return;
});

app.use("/auth", authRoutes);
app.use("/user", authenticate, userRoutes);
app.use("/sessions", authenticate, sessionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server started on port:", PORT);
});
