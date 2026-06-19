const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "pair3",
    author: "Christus",
    category: "game",
    version: "1.0",
    role: 0,
    shortDescription: {
      en: "💘 Génère une compatibilité amoureuse entre toi et un autre membre du groupe"
    },
    longDescription: {
      en: "Cette commande calcule un match amoureux entre toi et un membre compatible du groupe en fonction du genre. Affiche les avatars circulaires, un fond, et un pourcentage d'amour."
    },
    guide: {
      en: "{p}{n} — Utilise cette commande dans un groupe pour trouver ton partenaire"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("⚠️ Impossible de déterminer ton genre.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("⚠️ Ton genre est indéfini. Impossible de trouver un match.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ Aucun partenaire compatible trouvé dans ce groupe.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      let fontMap;
      try {
        const { data } = await axios.get(`${baseUrl}/21.json`);
        fontMap = data;
      } catch (e) {
        console.error("Erreur de chargement de police :", e.message);
        fontMap = {};
      }

      const convertFont = (text) =>
        text.split("").map(ch => fontMap[ch] || ch).join("");

      senderName = convertFont(senderName);
      matchName = convertFont(matchName);

      const width = 735, height = 411;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://files.catbox.moe/g6lr9y.jpg");
      ctx.drawImage(background, 0, 0, width, height);

      const sIdImage = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const pairPersonImage = await loadImage(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      const avatarPositions = {
        sender: { x: 131, y: 128, size: 154 },
        partner: { x: width - 302, y: 128, size: 154 },
      };

      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(ctx, sIdImage, avatarPositions.sender.x, avatarPositions.sender.y, avatarPositions.sender.size);
      drawCircle(ctx, pairPersonImage, avatarPositions.partner.x, avatarPositions.partner.y, avatarPositions.partner.size);

      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `💞 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝗲́ 𝗮𝗺𝗼𝘂𝗿𝗲𝘂𝘀𝗲 𝗳𝗶𝗻𝗮𝗹𝗶𝘀𝗲́𝗲 💞

🎀  ${senderName} ✨️
🎀  ${matchName} ✨️

🕊️ 𝓓𝓮𝓼𝓽𝓲𝓷 𝓿𝓸𝓾𝓼 𝓪 𝓾𝓷𝓲𝓼 🌹  
✨️ 𝓠𝓾𝓮 𝓿𝓸𝓽𝓻𝓮 𝓵𝓲𝓪𝓲𝓼𝓸𝓷 𝓭𝓾𝓻𝓮 𝓮́𝓽𝓮𝓻𝓷𝓮𝓵𝓵𝓮𝓶𝓮𝓷𝓽 ✨️

💘 𝙉𝙞𝙫𝙚𝙖𝙪 𝙙𝙚 𝙘𝙤𝙢𝙥𝙖𝙩𝙞𝙗𝙞𝙡𝙞𝙩𝙚́ : ${lovePercent}% 💘`;

        api.sendMessage(
          { body: message, attachment: fs.createReadStream(outputPath) },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage("❌ Une erreur s'est produite : " + error.message, event.threadID, event.messageID);
    }
  },
};
