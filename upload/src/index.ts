import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";
import { generate_id } from "./libs/id";
import { getAllFiles } from "./libs/files";
import { uploadFile } from "./libs/aws";
import { createClient } from "redis";

const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate_id();

  // temp redis as db to store status
  publisher.hSet("status", id, "uploading");

  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");

  res.json({ id: id });
});

app.listen(3000);
