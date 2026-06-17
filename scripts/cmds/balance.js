const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$", "cash"],
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Meta AI",
    description: "Balance style carte bancaire",
    commandCategory: "economy",
    usages: "/bal",
    cooldowns: 2
  },

  onStart: async function (mainParam) {
    const { api, event } = mainParam;
    const { threadID, messageID, senderID } = event;

    // Détection automatique du module d'économie du bot
    const CurrenciesModel = mainParam.Currencies || global.client?.Currencies || global.Currencies;

    if (!CurrenciesModel) {
      return api.sendMessage("❌ Impossible de charger le système d'économie du bot.", threadID, messageID);
    }

    try {
      // Récupération des données de l'utilisateur
      let userData = await CurrenciesModel.getData(senderID);

      if (!userData) {
        await CurrenciesModel.setData(senderID, { money: 1000 });
        userData = { money: 1000 };
      }

      const money = userData.money || 0;
      const name = senderID;

      // Récupération du classement complet
      const allData = await CurrenciesModel.getAll(['money']);
      
      const sorted = (allData || [])
        .map(u => ({
          id: u.userID || u.id,
          money: u.money || 0
        }))
        .sort((a, b) => b.money - a.money);

      const rank = sorted.findIndex(u => u.id === senderID) + 1;

      // --- Dessin du Canvas ---
      const width = 850, height = 540;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0b0e14";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#1a1e27";
      ctx.fillRect(100, 140, 650, 400);

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "bold 48px Arial";
      ctx.fillText(`${money.toLocaleString()} $`, 160, 350);

      ctx.font = "24px Arial";
      ctx.fillText(name.toUpperCase(), 160, 420);

      ctx.fillStyle = rank <= 3 ? "#f5c542" : "#22c55e";
      ctx.fillRect(560, 410, 140, 40);

      ctx.fillStyle = "#0b0e14";
      ctx.font = "bold 22px Arial";
      ctx.fillText(`RANK #${rank || 'N/A'}`, 590, 435);

      // Chargement de l'avatar Facebook
      try {
        const avatar = await loadImage(
          `https://graph.facebook.com/${senderID}/picture?width=256&height=256`
        );
        ctx.save();
        ctx.beginPath();
        ctx.arc(700, 320, 35, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, 665, 285, 70, 70);
        ctx.restore();
      } catch (e) {
        // En cas d'échec de l'avatar, on dessine un cercle vide pour éviter le crash
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(700, 320, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const pathSave = path.join(cacheDir, `bal_${senderID}.png`);
      fs.writeFileSync(pathSave, canvas.toBuffer("image/png"));

      return api.sendMessage(
        { attachment: fs.createReadStream(pathSave) },
        threadID,
        () => {
          try { fs.unlinkSync(pathSave); } catch (err) {}
        },
        messageID
      );

    } catch (error) {
      console.error(error);
      return api.sendMessage(`Erreur interne : ${error.message}`, threadID, messageID);
    }
  }
};
