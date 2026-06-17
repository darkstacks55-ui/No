const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const ownerInfo = {
  name: "ヾ Kαɪ.夜",
  facebook: "https://www.facebook.com/shade.userX",
  instagram: "x.shade108",
  supportGroup: "꒰ა 𝘚𝘶𝘱𝘱𝘰ʳᵗ 𝘣𝘪𝘦𝘯𝘵𝘰̂𝘵 𝘥𝘪𝘴𝘱𝘰𝘯𝘪𝘣𝘭𝘦 ໒꒱"
};

// URL de fond que vous avez fournie
const BACKGROUND_URL = "https://i.imgur.com/39RTtBo.jpeg";

module.exports = {
  config: {
    name: "botjoin",
    version: "3.0",
    author: "Angel System & AI",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();
    const addedUsers = logMessageData.addedParticipants;

    // Vérifie si c'est le bot qui a été ajouté au groupe
    const isBotAdded = addedUsers.some(u => u.userFbId === botID);
    if (!isBotAdded) return;

    const prefix = global.utils.getPrefix(threadID);
    const nickNameBot = global.GoatBot.config.nickNameBot || "Angel Bot ✨";

    // 1. Changement de pseudo automatique du Bot
    try {
      await api.changeNickname(nickNameBot, threadID, botID);
    } catch (e) {
      console.log("Impossible de changer le pseudo du bot :", e);
    }

    const cacheDir = path.join(__dirname, "..", "cache");
    await fs.ensureDir(cacheDir);
    const imgPath = path.join(cacheDir, `join_${threadID}.png`);

    // Préparation du message Premium
    const mainMessage = `
╭ ◜◝ ͡ ◜◝ ͡ ◝╮
♡ 𝘼𝙣𝙜𝙚𝙡 𝘽𝙤𝙩 ♡
╰ ◟◞ ͜ ◟◞ ╯

🎀 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨υ 𝐟𝐨𝐫 𝐢𝐧𝐯𝐢𝐭𝐢𝐧𝐠 𝐦𝐞

🔹 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
🔸 𝐔𝐬𝐞 : ${prefix}help

💫 𝐈’𝐦 𝐀𝐧𝐠𝐞𝐥 𝐁𝐨𝐭

╭══════════════╮
👑 𝐎𝐰𝐧𝐞𝐫 : ${ownerInfo.name}
🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : ${ownerInfo.facebook}
✈️ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : ${ownerInfo.instagram}
🤖 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 : ${ownerInfo.supportGroup}
╰══════════════╯

✨ 𝐀𝐥𝐰𝐚𝐲𝐬 𝐚𝐜𝐭𝐢𝐯𝐞 • 𝐒𝐭𝐚𝐲 𝐜𝐮𝐭𝐞 ✨
`;

    try {
      // 2. Récupération des informations du groupe et des utilisateurs
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "Groupe Messenger";
      const memberCount = threadInfo.participantIDs.length;
      
      // ID de la personne qui a ajouté le bot (généralement l'auteur du log event)
      const inviterID = event.author;

      // URLs des avatars Facebook haute résolution
      const inviterAvatarUrl = `https://graph.facebook.com/${inviterID}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const botAvatarUrl = `https://graph.facebook.com/${botID}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // 3. Téléchargement des images en parallèle
      const [bgImg, inviterImgBuffer, botImgBuffer] = await Promise.all([
        loadImage(BACKGROUND_URL),
        axios.get(inviterAvatarUrl, { responseType: "arraybuffer" }).then(res => res.data).catch(() => null),
        axios.get(botAvatarUrl, { responseType: "arraybuffer" }).then(res => res.data).catch(() => null)
      ]);

      // 4. Initialisation du Canvas (Basé sur la taille de l'image de fond)
      const width = bgImg.width || 1280;
      const height = bgImg.height || 720;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Dessiner le fond d'écran
      ctx.drawImage(bgImg, 0, 0, width, height);

      // --- AJOUT DE L'AVATAR EN HAUT À GAUCHE (Inviteur) ---
      if (inviterImgBuffer) {
        const inviterImg = await loadImage(inviterImgBuffer);
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2, true); // Position X:150, Y:150, Rayon:80
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(inviterImg, 70, 70, 160, 160);
        ctx.restore();
        
        // Bordure néon rose autour de l'avatar gauche
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2, true);
        ctx.stroke();
      }

      // --- AJOUT DE L'AVATAR EN BAS À DROITE (Bot) ---
      if (botImgBuffer) {
        const botImg = await loadImage(botImgBuffer);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width - 150, height - 150, 80, 0, Math.PI * 2, true); // Position ajustée selon la taille du fond
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(botImg, width - 230, height - 230, 160, 160);
        ctx.restore();

        // Bordure néon rose autour de l'avatar droit
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(width - 150, height - 150, 80, 0, Math.PI * 2, true);
        ctx.stroke();
      }

      // --- INSERER LES TEXTES ---
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      
      // Ombre pour effet Premium lisible
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;

      // 1. Texte "WELCOME" au centre (Légèrement décalé vers le haut du cercle pour esthétique)
      ctx.font = "bold 70px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("WELCOME", width / 2, height / 2 - 130);

      // 2. Nom du groupe en bas
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ffb6c1"; // Rose clair premium
      ctx.fillText(threadName, width / 2, height - 100);

      // 3. Nombre exact de membres sous le nom du groupe
      ctx.font = "italic 30px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Membres: ${memberCount}`, width / 2, height - 50);

      // Sauvegarde locale de l'image éditée
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, buffer);

      // Envoi réussi de l'image et du texte complet
      await api.sendMessage({
        body: mainMessage,
        attachment: fs.createReadStream(imgPath)
      }, threadID);

      // Nettoyage du fichier temporaire cache
      fs.unlinkSync(imgPath);

    } catch (err) {
      console.error("Erreur de génération Canvas : ", err);
      
      // FALLBACK : En cas d'échec de la création graphique, envoie le message texte
      const fallback = `
╭ ◜◝ ͡ ◜◝ ͡ ◝╮
♡ 𝘼𝙣𝙜𝙚𝙡 𝘽𝙤𝙩 ♡
╰ ◟◞ ͜ ◟◞ ╯

❌ 𝐈𝐦𝐚𝐠𝐞 𝐮𝐧𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 (Local Canvas Error)

🎀 ${mainMessage}
`;
      api.sendMessage(fallback, threadID);
    }
  }
};
