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

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/upload", async (req, res) => {
  
  const repoUrl = req.body.repoUrl;
  const id = generate_id();

  // temp redis as db to store status
  publisher.hSet("status", id, "uploading");

  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  const uploadPromises = files.map(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  // wait till all the files are uploaded before pushing to the queue
  await Promise.all(uploadPromises);

  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");

  res.json({ id: id });
});

app.get("/status/:id", async (req, res) => {
  const id = req.params.id;
  const status = await subscriber.hGet("status", id as string);

  res.json({ status: status });
});

app.listen(3000);
