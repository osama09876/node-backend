import { rejects } from "assert";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { resolve } from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const videoUploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        localFilePath,
        {
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadToCloudinary, videoUploadToCloudinary };
