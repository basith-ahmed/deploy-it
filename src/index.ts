import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json())

app.get("/repo-url", (req, res) => {
  const repoUrl = req.body.repoUrl;
  console.log("Received repo URL:", repoUrl);
  res.json({});
});

app.listen(3000);
