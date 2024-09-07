import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelDetails,
  getUserWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserInfo,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/get-current-user").get(verifyJWT, getCurrentUser);
userRouter.route("/update-account").patch(verifyJWT, updateUserInfo);
userRouter
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
userRouter
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// userRouter.route("/c/:username").get(verifyJWT, getUserChannelDetails);
userRouter.route("/c/:username").get(verifyJWT, getUserChannelDetails);
userRouter.route("/history").get(verifyJWT, getUserWatchHistory);

export default userRouter;
