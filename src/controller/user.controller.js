import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";
import ApiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Your registration logic here
  // get details from user
  //check user already registered or not registered
  //validation used
  //avatar is required
  //get avatar from user
  //upload to cloudinary
  //save user to database
  //remove user pasword and refresh token from response
  //return response

  const { userName, email, fullName, password } = req.body;
  // res.json({ message: "success" });
  // console.log(email);
  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    password,
  });
  const userRegisterd = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userRegisterd) {
    throw new ApiError(500, "User registration failed");
  }

  res
    .status(201)
    .json(ApiResponse(200, userRegisterd, "User registered successfully"));
});

export { registerUser };
