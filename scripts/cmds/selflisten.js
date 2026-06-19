const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sl",
    aliases: ["selflisten"],
    version: "2.0",
    author: "Shade",
    role: 2,
    shortDescription: "Activer/Désactiver selfListen",
    longDescription: "Active ou désactive le self-listen du bot sans le redémarrer",
    category: "security",
    guide: "/sl on | /sl off"
  },

  onStart: async function ({ args, message, event, api }) {
    const input = args[0]?.toLowerCase();

    const configPath = path.join(__dirname, "..", "..", "config.json");
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      return message.reply("❌ Impossible de charger le fichier config.");
    }

    if (!input) {
      const status = config.optionsFca.selfListen ? "ON" : "OFF";
      return message.reply(`🤖 selfListen est actuellement ${status}.\nUtilisez /sl on ou /sl off`);
    }

    if (!["on", "off"].includes(input)) {
      return message.reply("❌ Option invalide. Utilisez /sl on ou /sl off");
    }

    const newValue = input === "on";

    try {
      config.optionsFca.selfListen = newValue;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.setOptions({ selfListen: newValue });

      const replyMsg = `✅ selfListen a été ${newValue ? "activé (ON)" : "désactivé (OFF)"}.`;
      message.reply(replyMsg);
      console.log(`[COMMANDE SL] selfListen changé à ${newValue} par ${event.senderID} le ${new Date().toLocaleString()}`);
    } catch (err) {
      console.error("[ERREUR COMMANDE SL]", err);
      message.reply("❌ Échec de la mise à jour de la config.");
    }
  }
};
