import express from "express";
import cors from "cors";
import cookiePaser from "cookie-parser";
import { API_NAME } from "./constant.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookiePaser());

//routes

import userRouter from "./routes/user.routes.js";
app.use(`${API_NAME}/users`, userRouter);
export { app };
