const axios = require("axios");

module.exports = {
  config: {
    name: "67",
    aliases: ["sixseven"],
    version: "1.5 angel ultimate",
    author: "Angel Edit ✨ & ChatGPT",
    role: 0,
    category: "other",
    description: "💖 Détection automatique du trend 67 TikTok via onChat"
  },

  onChat: async function ({ event, api }) {
    const body = (event.body || "").toLowerCase();

    // 💥 DÉTECTION 67 DANS LE MESSAGE
    const clean = body.replace(/[^0-9]/g, "");

    if (clean.includes("67")) {
      const gifs = [
        "https://i.imgur.com/lcFfLSX.gif",
        "https://i.imgur.com/4wDHfJq.gif",
        "https://i.imgur.com/jSDs0ak.gif"
      ];

      const videoUrl = "https://files.catbox.moe/cu3atc.mp4";
      const audioUrl = "https://files.catbox.moe/9ebkev.mp3";

      const useVideo = Math.random() < 0.25; // 25% de chances d'envoyer la vidéo seule

      try {
        if (useVideo) {
          // 🎬 Envoi de la vidéo seule
          return api.sendMessage(
            {
              body: "💖🔥 6️⃣7️⃣ TIKTOK TREND !!!",
              attachment: await global.utils.getStreamFromURL(videoUrl)
            },
            event.threadID,
            event.messageID
          );
        } else {
          // 🎲 Sélection aléatoire d'un des 3 GIFs
          const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

          // 🖼️🔊 Envoi du GIF accompagné de l'audio
          return api.sendMessage(
            {
              body: "💖🔥 6️⃣7️⃣ TIKTOK TREND !!!",
              attachment: [
                await global.utils.getStreamFromURL(randomGif),
                await global.utils.getStreamFromURL(audioUrl)
              ]
            },
            event.threadID,
            event.messageID
          );
        }
      } catch (error) {
        console.error("Erreur lors du chargement des médias pour la commande 67:", error);
      }
    }
  },

  // Obligatoire pour enregistrer la commande dans le système de GoatBot
  onStart: async function () {}
};
