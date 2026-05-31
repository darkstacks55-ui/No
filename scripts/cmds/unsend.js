const OWNER_UID = "61573867120837";

module.exports = {
  config: {
    name: "unsend",
    aliases: ["us"],
    version: "1.0 angel kawaii",
    author: "Shade ✨ Angel Edit",
    role: 0,
    shortDescription: "💖 Supprime un message du bot via reply",
    category: "system"
  },

  onStart: async function ({ api, event, message }) {

    // 💖 PROTECTION OWNER
    if (event.senderID !== OWNER_UID) {
      return message.reply("💔✨ Accès refusé...\nSeul l’owner Angel peut utiliser ça 💖");
    }

    // 💖 CHECK REPLY
    if (!event.messageReply) {
      return message.reply("🌸✨ Réponds à un message du bot pour le supprimer 💖");
    }

    try {
      await api.unsendMessage(event.messageReply.messageID);

      return message.reply("🧹💖 Message supprimé avec succès 🌸");

    } catch (err) {
      console.error(err);
      return message.reply("❌💔 Impossible de supprimer ce message...");
    }
  }
};
