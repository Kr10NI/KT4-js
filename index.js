const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  shortUrl: { type: String, required: true, unique: true },
  originalUrl: { type: String, required: true },
});

const URL = mongoose.model("URL", urlSchema);

app.post("/create", async (req, res) => {
  const { url: originalUrl } = req.body;
  if (!originalUrl) return res.status(400).send({ error: "URL is required" });

  let existingUrl = await URL.findOne({ originalUrl });
  if (existingUrl) {
    return res.send({ shortUrl: `${req.headers.host}/${existingUrl.shortUrl}` });
  }

  const shortUrl = shortid.generate();

  const newUrl = new URL({ shortUrl, originalUrl });
  await newUrl.save();

  res.send({ shortUrl: `${req.headers.host}/${shortUrl}` });
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  const urlRecord = await URL.findOne({ shortUrl });
  if (!urlRecord) return res.status(404).send({ error: "URL not found" });

  res.redirect(urlRecord.originalUrl);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
