import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "This field is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "You are not allowed to tweet");
  }
  const creattweet = await Tweet.create({
    content,
    owner: user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, creattweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  const isValid = isValidObjectId(userId);
  if (!isValid) {
    throw new ApiError(400, "Invalid user ID");
  }
  // const user = await User.findById(userId);
  // if (!user) {
  //   throw new ApiError(400, "User not found");
  // }
  // const tweets = await Tweet.find({ owner: userId }).populate(
  //   "owner",
  //   "username"
  // );
  // .select("-avatar -coverImage -password -refreshToken");
  // const user = await User.findById(userId);
  // if (!user) {
  //   throw new ApiError(404, "User not found");
  // }
  // const tweets = await Tweet.find({ owner: userId }).populate("owner", "username");

  const tweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
            },
          },
        ],
      },
    },

    {
      $project: {
        content: 1,
        owner: 1,
        createdAt: 1,
      },
    },
  ]);
  // console.log(tweets);

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError("Invalid tweet id: " + tweetId);
  }
  if (!content) {
    throw new ApiError(400, "This field is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );
  if (!updateTweet) {
    throw new ApiError(500, "Error occurred while updating");
  }
  res.status(200).json(new ApiResponse(200, "TWeet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const isValid = isValidObjectId(tweetId);
  if (!isValid) {
    throw new ApiError(404, "TweetId not valid");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  console.log("isValid");

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "You are not allowed to delete a tweet");
  }
  await Tweet.findByIdAndDelete(tweetId);
  res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
  res.json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
