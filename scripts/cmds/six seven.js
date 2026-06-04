const axios = require("axios");

module.exports = {
  config: {
    name: "six seven",
    aliases: ["67"],
    version: "1.4 angel ultimate",
    author: "Angel Edit ✨",
    role: 0,
    category: "fun",
    description: "💖 TikTok 67 trend auto reply"
  },

  onChat: async function ({ event, api }) {
    const body = (event.body || "").toLowerCase();

    const gifs = [
      "https://i.imgur.com/lcFfLSX.gif",
      "https://i.imgur.com/4wDHfJq.gif",
      "https://i.imgur.com/jSDs0ak.gif"
    ];

    const videoUrl = "https://files.catbox.moe/cu3atc.mp4";
    const audioUrl = "https://files.catbox.moe/9ebkev.mp3";

    // 💥 DÉTECTION 67 PARTOUT DANS LE MESSAGE
    const clean = body.replace(/[^0-9]/g, "");

    if (clean.includes("67")) {
      const useVideo = Math.random() < 0.25; // 25% vidéo / 75% gif

      if (useVideo) {
        return api.sendMessage(
          {
            body: "💖🔥 6️⃣7️⃣ TIKTOK TREND !!!",
            attachment: await global.utils.getStreamFromURL(videoUrl)
          },
          event.threadID,
          event.messageID
        );
      }

      const gif = gifs[Math.floor(Math.random() * gifs.length)];

      return api.sendMessage(
        {
          body: "💖🔥 6️⃣7️⃣ TIKTOK TREND !!!",
          attachment: [
            await global.utils.getStreamFromURL(gif),
            await global.utils.getStreamFromURL(audioUrl)
          ]
        },
        event.threadID,
        event.messageID
      );
    }

    // 💔 correction
    if (body === "!67" || body === "/67") {
      return api.sendMessage(
        "💖✨ Tape juste 67 sans ! ni /\n👉 Exemple : 67",
        event.threadID,
        event.messageID
      );
    }

    // 💬 trend
    if (body.includes("67") && body.includes("trend")) {
      return api.sendMessage(
        "💖🔥 Oui !! le trend 67 est viral sur TikTok 😭💥\nTape juste 67",
        event.threadID,
        event.messageID
      );
    }

    // 💬 discussion
    if (body.includes("67") && body.includes("frère")) {
      return api.sendMessage(
        "💖 Oui je connais 😭🔥 le trend 67 est partout sur TikTok !!\nEssaie : 67",
        event.threadID,
        event.messageID
      );
    }
  }
};
