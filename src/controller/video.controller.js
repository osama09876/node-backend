import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  videoUploadToCloudinary,
} from "../utils/cloudnary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Invalid user");
  }
  // console.log(isValidObjectId(userId));

  let pageNumber = parseInt(page, 10);
  let limitNumber = parseInt(limit, 10);

  let pipeline = [];

  let match = {};

  if (query) {
    match.title = { $regex: query, $options: "i" };
    match.description = { $regex: query, $options: "i" };
  }

  if (userId) {
    match.userId = userId;
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: { $or: [match] } });
  }

  const sortStage = {
    $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  };

  const skipStage = {
    $skip: (pageNumber - 1) * limit,
  };

  const limitStage = {
    $limit: limitNumber,
  };

  pipeline.push(sortStage, skipStage, limitStage);

  const totalVideos = await Video.countDocuments(match);

  const getVideos = await Video.aggregate(pipeline);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideos, getVideos },
        "Fetch all videos successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if ([title, description].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
    // console.log(title, description);

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    // console.log(videoLocalPath);
    // console.log(thumbnailLocalPath);

    if (!(videoLocalPath || thumbnailLocalPath)) {
      throw new ApiError(404, "File not found");
    }

    const videoFile = await uploadToCloudinary(videoLocalPath);
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    console.log(videoFile?.url);
    console.log(thumbnail?.url);

    if (!(videoFile || thumbnail)) {
      throw new ApiError(404, "Video and thumbnail is required");
    }
    // const owne
    const newVideo = await Video.create({
      videoFile: videoFile?.url || "",
      thumbnail: thumbnailLocalPath || "",
      owner: user["_id"],
      title,
      description,
      duration: videoFile?.duration,
      views: 10,
      isPublished: true,
    });

    if (!newVideo) {
      throw new ApiError(500, "Couldn't upload video");
    }
    res
      .status(201)
      .json(new ApiResponse(200, newVideo, "Video published successfully"));
  } catch (error) {
    console.log("Error", error);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const isValid = isValidObjectId(videoId);
  if (!isValid) {
    throw new ApiError(400, "Invalid video ID");
  }
  // console.log(isValid);

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscriber: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              email: 1,
              subscriber: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "likeBy",
              foreignField: "_id",
              as: "likedBy",
            },
          },
          {
            $addFields: {
              likes: {
                $first: "$likes",
              },
              likeCount: {
                $size: "$likes",
              },

              isLiked: {
                $cond: {
                  if: { $in: [req.user?._id, "$likes.likeBy"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              likeCount: 1,
              isLiked: 1,
              likes: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        owner: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        comments: 1,
        likes: 1,
      },
    },
  ]);

  if (!video) {
    throw new ApiError(500, "Something went wrong when fetching video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));

  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if (!(title || description)) {
    throw new ApiError(404, "Field are required");
  }
  // const { thumbnail } = req.file;
  // console.log(videoId, title, description);

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  let thumbnailLocalPath = req.file.path;
  console.log(thumbnailLocalPath);

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const uploadThumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!uploadThumbnail.url) {
    throw new ApiError(500, "Error occurred while uploading");
  }
  // console.log(uploadThumbnail.url);

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: uploadThumbnail?.url,
      },
    },
    {
      new: true,
    }
  );
  // console.log(updatedVideo);

  if (!updatedVideo) {
    throw new ApiError(501, "Error occurred while updating");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id: " + videoId);
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Invalid videoId");
  }
  const video = await Video.findByIdAndUpdate(videoId, {
    $set: {
      isPublished: !req.body.isPublished,
    },
  });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
