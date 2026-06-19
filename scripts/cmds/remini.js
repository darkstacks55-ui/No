const axios = require('axios');

module.exports = {
  config: {
    name: "remini",
    aliases: ["enhance"],
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Enhance images to 4K using AI"
    },
    description: {
      en: "Enhance images using the Remini API to make them high-quality or 4K."
    },
    category: "image",
    guide: {
      en: "Use the command: !remini <image_url> or reply to an image."
    }
  },

  onStart: async function({ api, event, args }) {
    let imageUrl = args[0];

    if (!imageUrl && event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    }

    if (!imageUrl) {
      return api.sendMessage("⚠️ Please provide an image URL or reply to an image.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(`https://aryapio.onrender.com/tools/remini`, {
        params: {
          url: imageUrl,
          apikey: "aryan123"
        }
      });

      if (response.data.status && response.data.result) {
        const enhancedUrl = response.data.result;
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage({
          body: `🖼️ Image enhanced successfully!`,
          attachment: await global.utils.getStreamFromURL(enhancedUrl, "remini.png")
        }, event.threadID, event.messageID);
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("Failed to enhance the image. Please check the URL or try again later.", event.threadID, event.messageID);
      }

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("An error occurred while enhancing the image.", event.threadID, event.messageID);
    }
  }
};
