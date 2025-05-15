import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

const uploadFiles = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
    Body: fileContent,
    Bucket: process.env.AWS_BUCKET!,
    Key: fileName,
  }).promise();
  console.log("File uploaded successfully", response);
};

export { uploadFiles };
