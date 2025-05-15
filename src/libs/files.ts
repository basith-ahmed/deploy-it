import fs from "fs";
import path from "path";

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

export { getAllFiles };
