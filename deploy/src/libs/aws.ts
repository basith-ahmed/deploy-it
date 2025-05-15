import { S3 } from "aws-sdk";
import path from "path";
import fs from "fs";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT,
});

// downloadFromS3: downloads all files from a folder in S3 to the local machine
const downloadFromS3 = async (folderPath: string) => {
  // allFiles: is an array of all files in the folder ${path}
  const allFiles = await s3
    .listObjectsV2({
      Bucket: process.env.AWS_BUCKET!,
      Prefix: folderPath,
    })
    .promise();

  // allfiles.Contents: is an array of all file names in the folder ${path}
  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      // promise to download each file
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalPath = path.join(__dirname, Key);

        // create the dir if !exists
        const dirName = path.dirname(finalPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        const file = fs.createWriteStream(finalPath);
        s3.getObject({
          Bucket: process.env.AWS_BUCKET!,
          Key: Key!,
        })
          .createReadStream()
          .pipe(file)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];

  // wait for all promises to resolve
  await Promise.all(allPromises?.filter((x) => x != undefined));
};

const getAllFiles = (repoPath: string) => {
  let response: string[] = [];

  const allFileAndFolderPath = fs.readdirSync(repoPath);

  allFileAndFolderPath.forEach((fileOrFolder) => {
    const fileOrFolderPath = path.join(repoPath, fileOrFolder);
    const isDirectory = fs.statSync(fileOrFolderPath).isDirectory();

    if (isDirectory) {
      response = [...response, ...getAllFiles(fileOrFolderPath)];
    } else {
      response.push(fileOrFolderPath);
    }
  });

  return response;
};

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: process.env.AWS_BUCKET!,
      Key: fileName,
    })
    .promise();
  console.log("File uploaded successfully", response);
};

const uploadFinalDistToS3 = (id: string) => {
  const distPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(distPath);
  allFiles.forEach((file) => {
    uploadFile(`dist/${id}/` + file.slice(distPath.length + 1), file);
  });
};
export { downloadFromS3, uploadFinalDistToS3 };
