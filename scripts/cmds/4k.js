const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://65.109.80.126:20409/aryan/4k";

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "1.3",
    role: 0,
    author: "Shade",
    category: "image"
  },

  onStart: async function ({ message, event, api }) {

    const img = event.messageReply?.attachments?.[0];

    if (!img || img.type !== "photo") {
      return message.reply("🌸 Réponds à une image !");
    }

    const url = img.url;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `4k_${Date.now()}.png`);

    let loading;

    try {

      // ⏳ STATUS LIKE KAI / AI
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      loading = await message.reply("⏳ 4K processing... 🌸✨");

      const res = await axios.get(
        `${API_URL}?imageUrl=${encodeURIComponent(url)}`
      );

      if (!res.data?.enhancedImageUrl) {
        throw new Error("API error");
      }

      const imgRes = await axios.get(res.data.enhancedImageUrl, {
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      imgRes.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // remove loading message
      await api.unsendMessage(loading.messageID);

      // ✔️ success reaction
      api.setMessageReaction("✔️", event.messageID, () => {}, true);

      return message.reply({
        body: "💖 4K terminé ✨",
        attachment: fs.createReadStream(filePath)
      });

    } catch (e) {

      console.error(e);

      if (loading) {
        await api.unsendMessage(loading.messageID);
      }

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply("❌ 4K failed 🌸");

    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};
