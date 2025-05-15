"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
exports.getAllFiles = getAllFiles;
