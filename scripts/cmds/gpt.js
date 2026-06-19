const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_ENDPOINT = "https://dev.oculux.xyz/api/gptimage";
const SEED_FLAG = "--seed";
const WIDTH_FLAG = "--width";
const HEIGHT_FLAG = "--height";

module.exports = {
  config: {
    name: "gpt",
    aliases: ["gptimg", "aimage"],
    version: "1.0 angel kawaii",
    author: "Shade ✨ Angel Edit",
    countDown: 20,
    role: 0,
    longDescription: "💖 Generate or edit images using GPT Image model (Angel kawaii)",
    category: "ai",
    guide: {
      en:
        "{pn} <prompt> [--seed <true/false or number>] [--width <px>] [--height <px>]\n" +
        "💖 Example: {pn} cute cat in space\n" +
        "💖 Edit: reply image + {pn} remove background"
    }
  },

  onStart: async function ({ message, args, event }) {

    let rawPrompt = args.join(" ");
    let prompt = rawPrompt;

    let refUrl = null;
    let seed = null;
    let width = null;
    let height = null;

    // 💖 IMAGE REPLY CHECK (safe)
    try {
      if (event.messageReply?.attachments?.length) {
        const att = event.messageReply.attachments.find(
          a => a.type === "photo" || a.type === "image"
        );
        if (att?.url) refUrl = att.url;
      }
    } catch (e) {}

    // 💖 FLAG EXTRACTOR SAFE
    const extractFlag = (flag, regex) => {
      const match = prompt.match(regex);
      if (!match) return null;
      prompt = prompt.replace(match[0], "").trim();
      return match[1];
    };

    const seedValue = extractFlag(SEED_FLAG, new RegExp(`${SEED_FLAG}\\s+([^\\s]+)`, 'i'));
    if (seedValue) {
      if (seedValue.toLowerCase() === "true") seed = true;
      else if (seedValue.toLowerCase() === "false") seed = false;
      else if (!isNaN(seedValue)) seed = parseInt(seedValue);
    }

    const widthValue = extractFlag(WIDTH_FLAG, new RegExp(`${WIDTH_FLAG}\\s+(\\d+)`, 'i'));
    if (widthValue) width = parseInt(widthValue);

    const heightValue = extractFlag(HEIGHT_FLAG, new RegExp(`${HEIGHT_FLAG}\\s+(\\d+)`, 'i'));
    if (heightValue) height = parseInt(heightValue);

    prompt = prompt.trim();

    // 💖 SAFE PROMPT CHECK
    if (!prompt) {
      return message.reply("💔✨ Please give me a prompt, angel needs it 💖");
    }

    message.reaction("⏳", event.messageID);

    let tempFilePath;

    try {
      let fullApiUrl = `${API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}`;

      if (refUrl) fullApiUrl += `&ref=${encodeURIComponent(refUrl)}`;
      if (seed !== null) fullApiUrl += `&seed=${seed}`;
      if (width !== null) fullApiUrl += `&width=${width}`;
      if (height !== null) fullApiUrl += `&height=${height}`;

      const res = await axios.get(fullApiUrl, {
        responseType: "stream",
        timeout: 90000
      });

      if (!res || res.status !== 200) {
        throw new Error(`Angel API error (${res?.status || "unknown"})`);
      }

      const cacheDir = path.join(__dirname, "cache");

      // 💖 SAFE FOLDER CREATION
      await fs.ensureDir(cacheDir);

      tempFilePath = path.join(
        cacheDir,
        `angel_gpt_${Date.now()}.png`
      );

      const writer = fs.createWriteStream(tempFilePath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      message.reaction("💖", event.messageID);

      await message.reply({
        body: `🌸✨ Angel GPT Image ${refUrl ? "Edit Mode" : "Generate Mode"} 💖`,
        attachment: fs.createReadStream(tempFilePath)
      });

    } catch (error) {

      message.reaction("❌", event.messageID);

      console.error("Angel GPT error:", error);

      return message.reply(
        "💔✨ Angel failed to generate image...\nTry a simpler prompt 💖"
      );

    } finally {
      if (tempFilePath && await fs.pathExists(tempFilePath)) {
        await fs.remove(tempFilePath);
      }
    }
  }
};
