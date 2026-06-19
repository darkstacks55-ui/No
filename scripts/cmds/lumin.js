const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "lumin",
    version: "1.0",
    author: "Christus",
    countDown: 5,
    role: 0,
    description: {
      fr: "Génère une image IA en utilisant l'API Oculux Luminarium",
    },
    category: "ai",
    guide: {
      fr: "{pn} <prompt>\nExemple : /lumin ville néon futuriste de nuit",
    },
  },

  onStart: async function ({ message, event, args, api, commandName }) {
    
    let prefix = "/";
    try {
      prefix =
        (global.utils?.getPrefix &&
          (await global.utils.getPrefix(event.threadID))) ||
        global.GoatBot?.config?.prefix ||
        "/";
    } catch {
      prefix = "/";
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply(
        `⚠️ Veuillez fournir un prompt.\nExemple : ${prefix}${commandName} ville néon futuriste de nuit`
      );
    }

    api.setMessageReaction("🎨", event.messageID, () => {}, true);
    const waitingMsg = await message.reply("🎨 Génération de votre image Luminarium... Veuillez patienter...");

    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://dev.oculux.xyz/api/luminarium?prompt=${encodedPrompt}`;
    const imgPath = path.join(__dirname, "cache", `lumin_${event.senderID}.png`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, response.data);

      await message.reply(
        {
          body: `✅ Voici votre image générée ${commandName}.`,
          attachment: fs.createReadStream(imgPath),
        },
        () => {
          fs.unlinkSync(imgPath);
          if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
        }
      );
    } catch (error) {
      console.error("Erreur de génération Luminarium :", error);
      message.reply("⚠️ Échec de la génération de l'image. Veuillez réessayer plus tard.");
      if (waitingMsg?.messageID) api.unsendMessage(waitingMsg.messageID);
    }
  },
};
