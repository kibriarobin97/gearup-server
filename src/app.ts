import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoriesRoutes } from "./modules/categories/categories.route";
import { gearRoutes } from "./modules/gearItem/gearItem.route";

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

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoriesRoutes);

app.use("/api/gear", gearRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
