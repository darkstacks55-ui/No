const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale", "hd"],
    version: "1.2 angel kawaii",
    role: 0,
    author: "Shade ✨ Angel Edit",
    countDown: 5,
    longDescription: "💖 Upscale une image en qualité 4K magique ✨",
    category: "🌸 image",
    guide: {
      en: "{pn} reply to an image 💖✨"
    }
  },

  onStart: async function ({ message, event }) {
    try {

      // 🖼️ Vérifie image reply
      const reply = event.messageReply;
      if (
        !reply ||
        !reply.attachments ||
        reply.attachments.length === 0
      ) {
        return message.reply("❌💔 Réponds à une image pour l’upscale ✨");
      }

      const imgurl = encodeURIComponent(reply.attachments[0].url);

      // 🌐 API (corrigée)
      const upscaleUrl = `https://free-goat-api.onrender.com/4k?url=${imgurl}`;

      // ⏳ réaction loading
      message.reaction("⏳", event.messageID);

      // 💬 message temporaire
      const waitMsg = await message.reply("💖✨ Upscaling en cours... patience l'ami 🌸");

      // 🔄 requête API
      const { data } = await axios.get(upscaleUrl);

      if (!data || !data.image) {
        message.reaction("❌", event.messageID);
        return message.reply("❌💔 API n’a pas renvoyé d’image...");
      }

      const img = await global.utils.getStreamFromURL(
        data.image,
        "angel-upscale.png"
      );

      // ✅ succès
      message.reaction("✅", event.messageID);

      await message.reply({
        body: "✨💖 Voilà ton image 4K angelifiée ✨",
        attachment: img
      });

      // 🧹 supprime message loading
      if (waitMsg?.messageID) {
        message.unsend(waitMsg.messageID);
      }

    } catch (err) {
      console.error(err);
      message.reaction("❌", event.messageID);
      return message.reply("❌💔 Une erreur est survenue avec l’upscale...");
    }
  }
};
