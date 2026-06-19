module.exports = {
  config: {
    name: "angelmsg",
    version: "1.1",
    author: "Shade ✨ Fix",
    role: 2,
    description: "💌 Envoi message privé stable",
    category: "system",
    guide: {
      en: "{pn} <uid> <message>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const OWNER_ID = "61573867120837";

    if (event.senderID !== OWNER_ID) {
      return api.sendMessage("❌ Owner only", event.threadID);
    }

    const uid = args[0];
    const msg = args.slice(1).join(" ").trim();

    if (!uid || !msg) {
      return api.sendMessage(
        "❌ Usage: angelmsg <uid> <message>",
        event.threadID
      );
    }

    try {

      // 💌 ENVOI PROPRE
      await api.sendMessage(
        {
          body: `💌 Message de Angel Bot:\n\n${msg}`
        },
        uid
      );

      return api.sendMessage(
        "✅ Message envoyé en privé ✨",
        event.threadID
      );

    } catch (e) {

      console.log("ANGELMSG ERROR:", e);

      return api.sendMessage(
        "❌ Impossible d'envoyer le message 💔\n👉 UID invalide ou DM bloqué",
        event.threadID
      );
    }
  }
};
