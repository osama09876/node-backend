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
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import palylistRouter from "./routes/playlist.routes.js";
import { plugin } from "mongoose";
app.use(`${API_NAME}/users`, userRouter);
app.use(`${API_NAME}/videos`, videoRouter);
app.use(`${API_NAME}/subscription`, subscriptionRouter);
app.use(`${API_NAME}/tweets`, tweetRouter);
app.use(`${API_NAME}/likes`, likeRouter);
app.use(`${API_NAME}/comments`, commentRouter);
app.use(`${API_NAME}/dashboard`, dashboardRouter);
app.use(`${API_NAME}/healthcheck`, healthcheckRouter);
app.use(`${API_NAME}/playlists`, palylistRouter);
export { app };
