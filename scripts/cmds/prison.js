const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const PRISON_DB = new Map(); // threadID -> { uid: true }

module.exports = {
  config: {
    name: "prison",
    aliases: ["jail"],
    version: "✨ 5.0 angel RPG",
    author: "Shade × Christus",
    role: 0,
    category: "game",
    shortDescription: "🚔 Prison RPG kawaii system"
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const action = args[0];
    const threadID = event.threadID;

    if (!PRISON_DB.has(threadID)) PRISON_DB.set(threadID, {});
    const db = PRISON_DB.get(threadID);

    // =========================
    // 🚔 ADD PRISON
    // =========================
    if (action === "add") {
      const targetID =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID;

      if (!targetID)
        return message.reply("💔✨ Tag ou reply quelqu’un !");

      db[targetID] = {
        jailed: true,
        miniGame: Math.random() < 0.5 ? "🪓 casse-mur" : "🎲 chance"
      };

      const name = await usersData.getName(targetID);

      api.setMessageReaction("⛓️", event.messageID, () => {}, true);

      return message.reply(
        `🚔✨ ${name} est EN PRISON !\n💰 Amende pour sortir : 50$\n🎮 Mini-jeu: disponible`
      );
    }

    // =========================
    // 📜 LIST PRISON (NOMS)
    // =========================
    if (action === "list") {
      const list = Object.keys(db);

      if (list.length === 0)
        return message.reply("💖✨ Prison vide pour le moment");

      let text = "🚔💖 LISTE DES PRISONNIERS\n\n";

      for (const uid of list) {
        const name = await usersData.getName(uid);
        text += `⛓️ ${name}\n`;
      }

      return message.reply(text);
    }

    // =========================
    // 🎮 MINI JEUX PRISON
    // =========================
    if (action === "play") {
      const targetID = event.senderID;

      if (!db[targetID])
        return message.reply("💖✨ Tu n’es pas en prison !");

      const game = db[targetID].miniGame;

      if (game === "🪓 casse-mur") {
        const win = Math.random() < 0.4;

        if (win) {
          delete db[targetID];
          return message.reply("💥 TU AS CASSÉ LE MUR ! TU ES LIBRE 🚪✨");
        } else {
          return message.reply("💔 ÉCHEC ! Le mur est trop solide 😭");
        }
      }

      if (game === "🎲 chance") {
        const win = Math.random() < 0.3;

        if (win) {
          delete db[targetID];
          return message.reply("🍀 INCROYABLE CHANCE ! TU ES LIBRE 💖");
        } else {
          return message.reply("🎲 PAS DE CHANCE... reste en prison 😭");
        }
      }
    }

    // =========================
    // 🧹 FREE (PAY 50$)
    // =========================
    if (action === "free") {
      const targetID =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID;

      if (!targetID)
        return message.reply("💔✨ Qui veux-tu libérer ?");

      const user = await usersData.get(targetID);

      if (user.money < 50)
        return message.reply("💔✨ Pas assez d’argent (50$ requis)");

      user.money -= 50;
      await usersData.set(targetID, { money: user.money });

      delete db[targetID];

      const name = await usersData.getName(targetID);

      return message.reply(
        `🚪✨ ${name} est LIBÉRÉ !\n💸 -50$ payé`
      );
    }

    // =========================
    // 🚔 JAIL IMAGE / GIF
    // =========================
    let targetID =
      Object.keys(event.mentions)[0] ||
      event.messageReply?.senderID;

    if (!targetID)
      return message.reply("💔✨ Tag ou reply quelqu’un");

    const name = await usersData.getName(targetID);
    const avatar = await usersData.getAvatarUrl(targetID);

    const filePath = path.join(__dirname, "tmp", `${targetID}_prison.gif`);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let success = false;

    // 🌐 API PRIORITY
    try {
      const apiURL = `https://api.popcat.xyz/jail?image=${encodeURIComponent(avatar)}`;
      const res = await axios.get(apiURL, { responseType: "arraybuffer" });

      await fs.outputFile(filePath, res.data);
      success = true;
    } catch (e) {
      console.log("API failed → fallback GIF...");
    }

    // 🎞️ FALLBACK GIF
    if (!success) {
      const gifURL =
        "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

      const gifBuffer = await axios.get(gifURL, {
        responseType: "arraybuffer"
      });

      await fs.outputFile(filePath, gifBuffer.data);
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    return message.reply({
      body:
        `🚔💖 ANGEL PRISON SYSTEM 💖🚔\n\n` +
        `👤 Prisonnier : ${name}\n` +
        `🎮 Mini-jeu disponible → /prison play\n` +
        `⛓️ Statut : EN PRISON`,
      attachment: fs.createReadStream(filePath)
    });
  }
};
