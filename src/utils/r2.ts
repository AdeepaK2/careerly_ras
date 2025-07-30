
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const uploadFileToR2 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderPath?: string
): Promise<{ success: boolean; message: string; url?: string; error?: any }> => {
  // Create the full file path with folder if provided
  const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
  
  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fullPath,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return {
      success: true,
      message: "File uploaded successfully",
      url: `${process.env.R2_ENDPOINT}/${fullPath}`,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, message: "Upload failed", error };
  }
};

export const downloadFileFromR2 = async (
  filePath: string
): Promise<{ success: boolean; message: string; fileBuffer?: Buffer; contentType?: string; error?: any }> => {
  const downloadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filePath,
  };

  try {
    const command = new GetObjectCommand(downloadParams);
    const response = await s3Client.send(command);
    
    if (response.Body) {
      const fileBuffer = Buffer.from(await response.Body.transformToByteArray());
      return {
        success: true,
        message: "File downloaded successfully",
        fileBuffer,
        contentType: response.ContentType,
      };
    } else {
      return { success: false, message: "No file content found" };
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return { success: false, message: "Download failed", error };
  }
};
