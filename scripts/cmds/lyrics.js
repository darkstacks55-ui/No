const axios = require("axios");
const fs = require("fs");
const path = require("path");
const canvas = require("canvas");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["paroles"],
    version: "2.0",
    author: "Aryan Chauhan & Shade",
    role: 0,
    category: "media",
    longDescription: { fr: "Obtenir les paroles d'une chanson avec sa pochette d'album" },
    guide: { fr: "{pn} [nom de la chanson]" }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const songName = args.join(" ");
      if (!songName) return message.reply("❌ Veuillez fournir un nom de chanson.");

      // ⚠️ REMPLACE ce lien par l'URL de TA propre API hébergée !
      const monUrlApi = `https://ton-api-lyrics.onrender.com/api/lyrics?song=${encodeURIComponent(songName)}`;
      
      const response = await axios.get(monUrlApi);
      const data = response.data;

      // Gestion de l'image de fond et de la pochette
      const bgUrl = "https://i.imgur.com/4M7QYqH.jpg";
      const bg = await canvas.loadImage(bgUrl);
      const img = data.image ? await canvas.loadImage(data.image) : await canvas.createCanvas(200, 200);

      const c = canvas.createCanvas(800, 800);
      const ctx = c.getContext("2d");

      // Dessin des images
      ctx.drawImage(bg, 0, 0, 800, 800);
      ctx.drawImage(img, 50, 50, 200, 200);

      // Texte : Titre et Artiste
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(data.title || songName, 280, 120);

      ctx.font = "italic 24px Arial";
      ctx.fillStyle = "#cccccc";
      ctx.fillText(data.artist || "Mon API Paroles", 280, 170);

      // Paroles (limitées pour pas que ça dépasse de l'image)
      const lyrics = data.lyrics ? data.lyrics.slice(0, 600) : "Aucune parole trouvée.";
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      wrapText(ctx, lyrics, 50, 300, 700, 28);

      // Création propre du fichier temporaire pour le bot
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      const filePath = path.join(cacheDir, `lyrics_${event.senderID}_${Date.now()}.png`);

      const buffer = c.toBuffer();
      fs.writeFileSync(filePath, buffer);

      // Envoi du message et suppression automatique de l'image du cache
      return message.reply({
        body: `🎵 Paroles générées par mon API !`,
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (e) {
      console.error(e);
      return message.reply("❌ Erreur de connexion à ton API : " + (e.response?.data?.error || e.message));
    }
  }
};

// Fonction wrapText corrigée (elle faisait planter ton bot avant)
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  
  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, y);
      line = w + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}
