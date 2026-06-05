const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API = "https://gemini-edit-omega.vercel.app/edit";

// 📁 mémoire persistante
const memoryFile = path.join(__dirname, "gem_memory.json");

let memory = {};

// 🔄 load memory safe
if (fs.existsSync(memoryFile)) {
  try {
    memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  } catch {
    memory = {};
  }
}

// 💾 save memory
function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

module.exports = {
  config: {
    name: "gem",
    version: "3.0 PRO",
    author: "Shade",
    role: 0,
    category: "image-edit"
  },

  onStart: async function ({ message, event, args, api }) {
    const userID = event.senderID;
    const prompt = args.join(" ").trim();

    const attachment = event.messageReply?.attachments?.[0];

    // ❌ check image
    if (!attachment || attachment.type !== "photo") {
      return message.reply("🌸 Réponds à une image !");
    }

    if (!prompt) {
      return message.reply("💡 Exemple : !gem ajoute un ciel sombre");
    }

    // 🧠 init memory safe
    if (!memory[userID]) {
      memory[userID] = {
        image: null,
        story: ""
      };
    }

    // 🧠 IMPORTANT FIX (image stable)
    if (!memory[userID].image) {
      memory[userID].image = attachment.url;
    }

    memory[userID].story += `, ${prompt}`;
    saveMemory();

    let loading;

    try {
      api.setMessageReaction("🎨", event.messageID, () => {}, true);

      loading = await message.reply("🎨 génération en cours...");

      const res = await axios.get(API, {
        timeout: 60000,
        params: {
          prompt: memory[userID].story,
          imgurl: memory[userID].image
        }
      });

      const img = res.data?.images?.[0];

      if (!img) {
        throw new Error("API_RETURN_EMPTY");
      }

      const base64 = img.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `gem_${userID}_${Date.now()}.png`);
      fs.writeFileSync(filePath, buffer);

      if (loading?.messageID) {
        await api.unsendMessage(loading.messageID);
      }

      api.setMessageReaction("🖼️", event.messageID, () => {}, true);

      return message.reply({
        body: "✨ GEM PRO terminé avec succès",
        attachment: fs.createReadStream(filePath)
      });

    } catch (e) {
      console.log("====== GEM PRO ERROR ======");
      console.log(e.message || e);

      if (loading?.messageID) {
        await api.unsendMessage(loading.messageID);
      }

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply(
        "💔 GEM PRO erreur\n👉 Vérifie ton image ou ton API"
      );
    }
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.toLowerCase();

    if (body === "!gem reset") {
      memory[event.senderID] = {
        image: null,
        story: ""
      };

      saveMemory();

      return message.reply("🧠 mémoire GEM PRO reset ✔️");
    }
  }
};
