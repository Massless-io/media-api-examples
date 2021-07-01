require("dotenv").config({ path: __dirname + "/.env" });

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

  // Host the media to get a mediaId
  const {
    data: { mediaId },
  } = await axios.post("https://api.massless.io/v1/media", form, {
    headers: { ...headers, ...form.getHeaders() },
  });

  // Remove background
  const {
    data: { mediaId: rbgId },
  } = await axios.post(
    "https://api.massless.io/v1/image/ml/remove-background",
    { mediaId },
    {
      headers,
    }
  );

  // Greyscale
  const {
    data: { mediaId: greyId },
  } = await axios.post(
    "https://api.massless.io/v1/image/filter/greyscale",
    { mediaId: rbgId },
    {
      headers,
    }
  );

  // Resize to 64 px wide
  const {
    data: { mediaId: resizeId },
  } = await axios.post(
    "https://api.massless.io/v1/image/resize",
    { mediaId: greyId, width: 64 },
    {
      headers,
    }
  );

  // Compress
  const {
    data: { mediaId: compressId },
  } = await axios.post(
    "https://api.massless.io/v1/image/compress",
    { mediaId: resizeId, quality: 85 },
    {
      headers,
    }
  );

  // Publish
  const {
    data: { url },
  } = await axios.post(
    "https://api.massless.io/v1/media/publish",
    { mediaId: compressId },
    {
      headers,
    }
  );

  // Respond with url
  res.json({ url });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
