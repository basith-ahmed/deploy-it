import express from "express";

const app = express();

app.get("/*", (req, res) => {
    const host = req.hostname;
    const id = host.split(".")[0]; // get the project id as the subdomain

})

app.listen(3000);
