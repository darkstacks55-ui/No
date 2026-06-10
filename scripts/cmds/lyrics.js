module.exports = {
  config: {
    name: "lyrics",
    aliases: [],
    version: "1.0",
    author: "Aryan Chauhan",
    role: 0,
    category: "general",
    longDescription: { en: "Get song lyrics with album art" },
    guide: { en: "{pn} [song name]" }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const songName = args.join(" ");
      if (!songName) return message.reply("Please provide a song name.");

      const { data } = await require("axios").get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);

      const canvas = require("canvas");
      const img = await canvas.loadImage(data.image);
      const bg = await canvas.loadImage("https://i.imgur.com/4M7QYqH.jpg");
      const c = canvas.createCanvas(800, 800);
      const ctx = c.getContext("2d");
      ctx.drawImage(bg, 0, 0, 800, 800);
      ctx.drawImage(img, 50, 50, 200, 200);

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(data.title, 280, 120);
      ctx.fillText(data.artist, 280, 170);

      const lyrics = data.lyrics.slice(0, 500);
      ctx.font = "20px Arial";
      wrapText(ctx, lyrics, 50, 300, 700, 25);

      const buffer = c.toBuffer();
     .reply({ attachment: require("fs").createReadStream(await require("fs").promises.writeFile("lyrics.png", bufferthen(() => "lyrics.png")) });
    } catch (e) {
      message.reply("Error: " + e.message);
    }
  }
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, y);
      line = w + " ";
      y += lineHeight;
    else line = test;
  }
  ctx.fillText(line, x, y);
}
