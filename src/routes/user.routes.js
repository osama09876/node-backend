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

const router = Router();

router.route("/register").post(
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

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateUserInfo);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// userRouter.route("/c/:username").get(verifyJWT, getUserChannelDetails);
router.route("/c/:username").get(verifyJWT, getUserChannelDetails);
router.route("/history").get(verifyJWT, getUserWatchHistory);

export default router;
