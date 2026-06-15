const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "hug",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Shade (improved by ChatGPT)",
  description: "Hug kawaii en image (version pro)",
  commandCategory: "fun",
  usages: "[@tag | reply]",
  cooldowns: 3
};

// 🔧 Fix roundRect compatibility (important)
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, mentions } = event;

  let targetID = senderID;

  if (Object.keys(mentions || {}).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (event.messageReply) {
    targetID = event.messageReply.senderID;
  }

  try {
    // 🔥 Optimisé (1 seule requête)
    const users = await api.getUserInfo([senderID, targetID]);
    const senderName = users[senderID]?.name || "User";
    const targetName = users[targetID]?.name || "User";

    // 🖼️ Avatars
    const [sRes, tRes] = await Promise.all([
      axios.get(`https://graph.facebook.com/${senderID}/picture?width=400&height=400`, { responseType: "arraybuffer" }),
      axios.get(`https://graph.facebook.com/${targetID}/picture?width=400&height=400`, { responseType: "arraybuffer" })
    ]);

    const senderAvatar = await loadImage(Buffer.from(sRes.data));
    const targetAvatar = await loadImage(Buffer.from(tRes.data));

    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    // 🌸 Fond gradient doux
    const grad = ctx.createLinearGradient(0, 0, 900, 500);
    grad.addColorStop(0, "#ffe4f7");
    grad.addColorStop(0.5, "#fff5fc");
    grad.addColorStop(1, "#ffe4f7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 500);

    // 💕 Petits coeurs décoratifs
    ctx.fillStyle = "rgba(255, 105, 180, 0.25)";
    ctx.font = "28px Arial";
    for (let i = 0; i < 18; i++) {
      ctx.fillText("♡", Math.random() * 900, Math.random() * 500);
    }

    // 🧁 Carte centrale
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    roundRect(ctx, 50, 80, 800, 340, 30);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,182,193,0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // ✨ Ombre douce avatars
    ctx.shadowColor = "#ffb6c1";
    ctx.shadowBlur = 20;

    // 👤 Avatar sender (gauche)
    ctx.save();
    ctx.beginPath();
    ctx.arc(280, 250, 80, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(senderAvatar, 200, 170, 160, 160);
    ctx.restore();

    // 👤 Avatar target (droite)
    ctx.save();
    ctx.beginPath();
    ctx.arc(620, 250, 80, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(targetAvatar, 540, 170, 160, 160);
    ctx.restore();

    ctx.shadowBlur = 0;

    // 💞 Coeurs centre
    ctx.fillStyle = "#ff4fa3";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("♡♡♡", 450, 255);

    // 🌸 Titre
    ctx.fillStyle = "#ff4fa3";
    ctx.font = "bold 44px Arial";
    ctx.fillText("HUG!", 450, 420);

    // 📝 Description
    ctx.fillStyle = "#7a4b66";
    ctx.font = "26px Arial";
    ctx.fillText(`${senderName} fait un câlin à ${targetName} ♡`, 450, 465);

    // 💾 Save file
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `hug_${senderID}_${targetID}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    return api.sendMessage(
      {
        body: `🌸 ${senderName} → 🤍 → ${targetName}`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage(
      "💔 Erreur: impossible de générer l'image hug.",
      threadID,
      messageID
    );
  }
};
