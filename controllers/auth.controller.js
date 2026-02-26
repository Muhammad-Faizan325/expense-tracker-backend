import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {uploadToCloudinary} from "../services/cloudianary.services.js"


export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields (Full Name, Email, Password) are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const localFilePath = req.file?.path;

  let profileImage = null;
  if (localFilePath) {
    const uploadResult = await uploadToCloudinary(localFilePath);
    profileImage = uploadResult?.url || null;
  }

  const user = await User.create({
    fullName,
    email,
    password,
    profileImageUrl: profileImage, 
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateToken();

  const loggedInUser = user.toObject();
  delete loggedInUser.password;

  const options = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) 
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});


export const getUserInfo = asyncHandler(async (req, res) => {
 
  const user = await User.findById(req.user?.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User data fetched successfully"));
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
   
    const localFilePath = req.file?.path;

    if (!localFilePath) {
        throw new ApiError(400, "Profile image file is missing!");
    }

   
    const cloudinaryResponse = await uploadToCloudinary(localFilePath);

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
        throw new ApiError(500, "Error while uploading image to Cloudinary");
    }

 
    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                profileImageUrl: cloudinaryResponse.url
            }
        },
        { new: true } 
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

   
    return res.status(200).json(
        new ApiResponse(
            200, 
            { user }, 
            "Profile image uploaded and updated successfully"
        )
    );
});