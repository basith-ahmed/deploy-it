import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";
import { generate_id } from "./libs/id";
import { getAllFiles } from "./libs/files";
import { uploadFile } from "./libs/aws";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate_id();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  res.json({ id: id });
});

app.listen(3000);
