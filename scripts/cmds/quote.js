const { Command } = require('goatbot');
const axios = require('axios');

module.exports = new Command({
  name: "quote",
  version: "1.1.0",
  description: "Envoie une citation aléatoire",
  usage: "quote",
  category: "fun",
  role: 0,
  cooldown: 3,

  async execute({ message }) {
    try {
      await message.reply("📜 Recherche d'une citation...");

      const { data } = await axios.get(
        "https://api.quotable.io/random",
        {
          timeout: 8000
        }
      );

      if (!data || !data.content) {
        return message.reply("❌ Aucune citation trouvée.");
      }

      const author = data.author || "Auteur inconnu";

      return message.reply(
        `╭─❍ CITATION\n` +
        `│\n` +
        `│ "${data.content}"\n` +
        `│\n` +
        `│ ✍️ ${author}\n` +
        `╰───────────`
      );

    } catch (error) {
      console.error("[QUOTE ERROR]", error.message);

      return message.reply(
        "❌ Impossible de récupérer une citation pour le moment.\nRéessaie dans quelques secondes."
      );
    }
  }
});
