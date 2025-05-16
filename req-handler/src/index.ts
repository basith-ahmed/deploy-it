import express from "express";
import { downloadDist } from "./libs/aws";


const app = express();

app.get("/*", async (req, res) => {
  const host = req.hostname;
  const id = host.split(".")[0]; // get the project id from the subdomain

  const filePath = req.path;

  const contents = await downloadDist(id, filePath)

  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "text/javascript";

  res.setHeader("Content-Type", type);
  res.send(contents.Body);
});

app.listen(3001);
