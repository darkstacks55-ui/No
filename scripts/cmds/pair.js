const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    aliases: ["lovepair", "match", "duo"],
    author: "Shade × Gemini",
    version: "3.0.0",
    role: 0,
    category: "game",
    description: "⚡ Analyse la matrice du groupe pour générer ton duo compatible par genre",
    guide: {
      fr: "{p}{n} — Lancer la recherche de compatibilité dans le groupe"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;

    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}

      // Récupération des informations du groupe et du demandeur
      const threadInfo = await api.getThreadInfo(threadID);
      const users = threadInfo.userInfo || [];

      const myData = users.find(u => u.id === senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("🟥 **[ERREUR MATRICE]** Impossible de scanner ton profil réseau ou ton genre.", threadID, messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let candidates = [];

      // Filtrage par genre opposé (MALE / FEMALE)
      if (myGender === "MALE") {
        candidates = users.filter(u => u.gender === "FEMALE" && u.id !== senderID);
      } else if (myGender === "FEMALE") {
        candidates = users.filter(u => u.gender === "MALE" && u.id !== senderID);
      } else {
        candidates = users.filter(u => u.id !== senderID); // Si genre non spécifié, prend tout le monde
      }

      if (!candidates.length) {
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
        return api.sendMessage("📡 **[RECHERCHE ÉCHOUÉE]** Aucun sujet compatible détecté dans ce canal actuellement.", threadID, messageID);
      }

      // Sélection de la cible
      const match = candidates[Math.floor(Math.random() * candidates.length)];
      
      const senderName = await usersData.getName(senderID) || "Utilisateur Principal";
      const matchName = await usersData.getName(match.id) || "Sujet Synchronisé";

      // Dimensions du Canvas Premium
      const width = 800, height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // 🌌 Fond Cyber Émeraude Sombre
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#09120e");
      gradient.addColorStop(0.5, "#0d261a");
      gradient.addColorStop(1, "#09120e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Dessin des grilles technologiques en arrière-plan
      ctx.strokeStyle = "rgba(34, 197, 94, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
      }

      // Liens des avatars hautement stables via l'identifiant
      const avatarSenderUrl = `https://graph.facebook.com/${senderID}/picture?type=large`;
      const avatarMatchUrl = `https://graph.facebook.com/${match.id}/picture?type=large`;

      // Chargement sécurisé des images (avec fallback si image corrompue)
      let img1, img2;
      try {
        img1 = await loadImage(avatarSenderUrl);
      } catch (e) {
        img1 = await loadImage("https://files.catbox.moe/w9df05.png"); // Image de secours par défaut
      }

      try {
        img2 = await loadImage(avatarMatchUrl);
      } catch (e) {
        img2 = await loadImage("https://files.catbox.moe/w9df05.png");
      }

      // Fonction pour dessiner les portraits avec encadrement néon émeraude
      function drawCyberAvatar(ctx, img, x, y, size) {
        ctx.save();
        // Lueur néon verte
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 15;
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // Positionnement propre des avatars
      drawCyberAvatar(ctx, img1, 140, 100, 190);
      drawCyberAvatar(ctx, img2, 470, 100, 190);

      // Dessin du symbole central de synchronisation (Le cœur Matrix Émeraude)
      ctx.save();
      ctx.font = "bold 50px sans-serif";
      ctx.fillStyle = "#22c55e";
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 20;
      ctx.textAlign = "center";
      ctx.fillText("⚡", width / 2, height / 2 + 15);
      ctx.restore();

      const file = path.join(__dirname, `cyber_pair_${Date.now()}.png`);
      const out = fs.createWriteStream(file);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const rate = Math.floor(Math.random() * 31) + 70; // Score de 70% à 100%

        const msg = 
`⚡ **[MATRIX PAIR GENERATOR]**
━━━━━━━━━━━━━━━━━━━━━━━━━
🟩 **Sujet A :** ${senderName}
🟩 **Sujet B :** ${matchName}
━━━━━━━━━━━━━━━━━━━━━━━━━
📟 **Analyse des flux :** Les protocoles indiquent une convergence de vos terminaux.
🧬 **Taux de synchronisation :** ${rate}%

» *[Système] Connexion sécurisée établie avec succès.*`;

        try { api.setMessageReaction("💎", messageID, () => {}, true); } catch(e){}

        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(file)
          },
          threadID,
          () => fs.unlinkSync(file),
          messageID
        );
      });

    } catch (globalError) {
      console.error(globalError);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      api.sendMessage("🟥 **[ERREUR SCRIPT]** Le générateur n'a pas pu compiler les images en mémoire.", threadID, messageID);
    }
  }
};
