import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './apiError';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'image',
          public_id: fileName,
        },
        (error, result) => {
          if (error)
            return reject(new ApiError(500, 'Cloudinary upload failed'));
          resolve(result);
        },
      )
      .end(fileBuffer);
  });
};
