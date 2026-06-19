const axios = require("axios");

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale", "hd"],
    version: "1.2 angel kawaii",
    role: 0,
    author: "Shade ✨ Angel Edit",
    countDown: 5,
    longDescription: "💖 Upscale image en 4K magique ✨",
    category: "image",
    guide: {
      en: "{pn} reply to an image 💖✨"
    }
  },

  onStart: async function ({ api, message, event }) {
    try {
      const reply = event.messageReply;

      if (!reply?.attachments?.length) {
        return message.reply("❌💔 Réponds à une image ✨");
      }

      const imgurl = reply.attachments[0].url;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const waitMsg = await message.reply("💖✨ Upscaling en cours...");

      // 🔥 TON API ICI
      const apiUrl = `https://api-4k.onrender.com/4k?url=${encodeURIComponent(imgurl)}`;

      const res = await axios.get(apiUrl);

      const imageLink = res?.data?.url;

      if (!imageLink) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌💔 API ne renvoie pas d’image valide...");
      }

      const imgBuffer = await axios.get(imageLink, {
        responseType: "arraybuffer"
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: "✨💖 Voilà ton image 4K ✨",
        attachment: Buffer.from(imgBuffer.data)
      });

      if (waitMsg?.messageID) {
        message.unsend(waitMsg.messageID);
      }

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌💔 Upscale failed");
    }
  }
};
