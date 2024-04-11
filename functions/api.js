const express = require("express");
const serverless = require("serverless-http");
const app = express();

app.get("/", (req, res) => {
  res.send("hello from netlify");
});

export const handler = serverless(app);
