const express = require("express");
const app = express();

const images = [
  "https://picsum.photos/800/1200",
  "https://picsum.photos/801/1200",
  "https://picsum.photos/802/1200"
];

app.get("/", (req, res) => {
  res.send("API 4K is running 🚀");
});

app.get("/4k", (req, res) => {
  const random = images[Math.floor(Math.random() * images.length)];
  res.json({ url: random });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port " + PORT));
