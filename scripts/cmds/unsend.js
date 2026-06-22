const OWNER_UID = "61573867120837";

module.exports = {
  config: {
    name: "unsend",
    aliases: ["us", "u"],
    version: "2.0 angel deluxe",
    author: "Shade ✨ Angel Edit",
    role: 0,
    shortDescription: "💖 Supprime un message du bot via reply",
    category: "system"
  },

  // 🌸 ÉCOUTE AUTOMATIQUE SANS PRÉFIXE ("U" ou "u" direct en reply)
  onChat: async function ({ api, event }) {
    const { messageReply, body, senderID, messageID } = event;

    if (body && (body === "u" || body === "U") && messageReply) {
      // Vérification OWNER + validation que le message ciblé appartient au bot
      if (senderID === OWNER_UID && messageReply.senderID === api.getCurrentUserID()) {
        try {
          await api.unsendMessage(messageReply.messageID);
          // Supprime aussi le "U" envoyé par l'owner pour ne laisser aucune trace
          try { await api.unsendMessage(messageID); } catch (e) {}
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  // 🌸 GESTION CLASSIQUE AVEC PRÉFIXE
  onStart: async function ({ api, event, message }) {
    // 💖 PROTECTION OWNER
    if (event.senderID !== OWNER_UID) {
      return message.reply("💔✨ Accès refusé...\nSeul l’owner Angel peut utiliser ça 💖");
    }

    // 💖 CHECK REPLY
    if (!event.messageReply) {
      return message.reply("🌸✨ Réponds à un message du bot pour le supprimer 💖");
    }

    if (event.messageReply.senderID !== api.getCurrentUserID()) {
      return message.reply("🌸✨ Je ne peux supprimer que mes propres messages 💖");
    }

    try {
      // Supprime le message ciblé sans envoyer de texte de confirmation
      await api.unsendMessage(event.messageReply.messageID);
    } catch (err) {
      console.error(err);
      return message.reply("❌💔 Impossible de supprimer ce message...");
    }
  }
};
