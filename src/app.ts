import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Gearup server is running");
});

app.use("/api/auth/", authRoutes);

export default app;
