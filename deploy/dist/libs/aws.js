"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFinalDistToS3 = exports.downloadFromS3 = void 0;
const aws_sdk_1 = require("aws-sdk");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT,
});
// downloadFromS3: downloads all files from a folder in S3 to the local machine
const downloadFromS3 = (folderPath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // allFiles: is an array of all files in the folder ${path}
    const allFiles = yield s3
        .listObjectsV2({
        Bucket: process.env.AWS_BUCKET,
        Prefix: folderPath,
    })
        .promise();
    // allfiles.Contents: is an array of all file names in the folder ${path}
    const allPromises = ((_a = allFiles.Contents) === null || _a === void 0 ? void 0 : _a.map((_a) => __awaiter(void 0, [_a], void 0, function* ({ Key }) {
        // promise to download each file
        return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
            if (!Key) {
                resolve("");
                return;
            }
            const finalPath = path_1.default.join(__dirname, Key);
            // create the dir if !exists
            const dirName = path_1.default.dirname(finalPath);
            if (!fs_1.default.existsSync(dirName)) {
                fs_1.default.mkdirSync(dirName, { recursive: true });
            }
            const file = fs_1.default.createWriteStream(finalPath);
            s3.getObject({
                Bucket: process.env.AWS_BUCKET,
                Key: Key,
            })
                .createReadStream()
                .pipe(file)
                .on("finish", () => {
                resolve("");
            });
        }));
    }))) || [];
    // wait for all promises to resolve
    yield Promise.all(allPromises === null || allPromises === void 0 ? void 0 : allPromises.filter((x) => x != undefined));
});
exports.downloadFromS3 = downloadFromS3;
const getAllFiles = (repoPath) => {
    let response = [];
    const allFileAndFolderPath = fs_1.default.readdirSync(repoPath);
    allFileAndFolderPath.forEach((fileOrFolder) => {
        const fileOrFolderPath = path_1.default.join(repoPath, fileOrFolder);
        const isDirectory = fs_1.default.statSync(fileOrFolderPath).isDirectory();
        if (isDirectory) {
            response = [...response, ...getAllFiles(fileOrFolderPath)];
        }
        else {
            response.push(fileOrFolderPath);
        }
    });
    return response;
};
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3
        .upload({
        Body: fileContent,
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
    })
        .promise();
    console.log("File uploaded successfully", response);
});
const uploadFinalDistToS3 = (id) => {
    const distPath = path_1.default.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(distPath);
    allFiles.forEach((file) => {
        uploadFile(`dist/${id}/` + file.slice(distPath.length + 1), file);
    });
};
exports.uploadFinalDistToS3 = uploadFinalDistToS3;
