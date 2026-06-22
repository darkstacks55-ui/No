// Fonction utilitaire pour extraire proprement un ID depuis un texte, un UID pur ou un lien Facebook
function extractUID(input) {
  if (!input) return null;
  const cleanInput = input.trim();
  if (/^\d+$/.test(cleanInput)) return cleanInput;
  const idMatch = cleanInput.match(/[?&]id=(\d+)/);
  if (idMatch) return idMatch[1];
  const slashMatch = cleanInput.match(/\/(\d+)(?:\/|\?|$)/);
  if (slashMatch) return slashMatch[1];
  return null;
}

module.exports = {
  config: {
    name: "angelmsg",
    aliases: ["amsg", "senddm", "privatemsg"],
    version: "2.0.0",
    author: "Shade × Gemini",
    role: 2,
    description: "💌 Transmettre un message privé crypté à une cible via son UID ou son Lien",
    category: "system",
    guide: {
      fr: "{p}{n} [UID ou Lien] [Votre message]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const OWNER_ID = "61573867120837";

    // 🔒 Restriction d'accès exclusive à l'Owner
    if (senderID !== OWNER_ID) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return api.sendMessage("⛔ **[ACCÈS REFUSÉ]** Terminal sécurisé. Action réservée au Fondateur Suprême.", threadID, messageID);
    }

    const targetInput = args[0];
    const messageContent = args.slice(1).join(" ").trim();

    // Vérification de la présence des arguments requis
    if (!targetInput || !messageContent) {
      return api.sendMessage("💡 **[USAGE REQUIS]** Syntaxe : `angelmsg [UID ou Lien] [Votre message]`", threadID, messageID);
    }

    // Extraction de la cible
    const targetUID = extractUID(targetInput);

    if (!targetUID) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return api.sendMessage("❌ **[ERREUR TARGET]** Impossible de résoudre le lien ou l'UID fourni.", threadID, messageID);
    }

    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}

      // Envoi du message privé à la cible
      await api.sendMessage({
        body: `📥 **[TRANSMISSION PRIVÉE - SHADE SYSTEM]**\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${messageContent}`
      }, targetUID);

      // Confirmation de succès sur le thread d'origine
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}
      return api.sendMessage(`🟩 **[PASTILLE TRANSMISE]** Flux de données envoyé avec succès à la cible (UID: ${targetUID}).`, threadID, messageID);

    } catch (error) {
      console.error("ANGELMSG ERROR:", error);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return api.sendMessage(`🟥 **[ÉCHEC DE TRANSIT]** Impossible d'établir la liaison privée avec l'UID : ${targetUID}.\n⚠️ *Raisons possibles : DM fermés, l'utilisateur n'a jamais parlé au bot ou restrictions Facebook.*`, threadID, messageID);
    }
  }
};
