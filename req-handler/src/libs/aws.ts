import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

const downloadDist = async (id: string, filePath: string) => {
  const response = await s3
    .getObject({
      Bucket: process.env.AWS_BUCKET!,
      Key: `dist/${id}${filePath}`,
    })
    .promise();

    return response
};

export { downloadDist };