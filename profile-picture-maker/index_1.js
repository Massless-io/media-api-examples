require('dotenv').config({path: __dirname + '/.env'})

const axios = require("axios");
const express = require("express");
const multer = require("multer");
var FormData = require("form-data");

const app = express();
const port = 8080;
const upload = multer();

const headers = { "x-api-key": process.env.MEDIA_API_KEY };

app.post("/", upload.single("file"), async (req, res) => {
  // Forward the file from the form data
  const form = new FormData();
  form.append("file", req.file.buffer, { filename: req.file.originalname });

  // Call Media API and remove background
  const response = await axios.post(
    // "https://api.massless.io/v1/image/filter/greyscale",
    "https://api.massless.io/v1/image/ml/remove-background",
    form,
    {
      responseType: "arraybuffer",
      headers: { ...headers, ...form.getHeaders() },
    }
  );

  // Respond with processed image
  const image = Buffer.from(response.data, "base64");
  res.end(image);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
