import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate_id } from "./utils";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/deploy",async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate_id();
  await simpleGit().clone(repoUrl, `output/${id}`);
  res.json({id});
});

app.listen(3000);
