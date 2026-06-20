const axios = require("axios");
const fs = require("fs");
const path = require("path");

const memoryFile = path.join(__dirname, "gem_memory.json");
let memory = {};

if (fs.existsSync(memoryFile)) {
  try {
    memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  } catch {
    memory = {};
  }
}

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

// Appel à l'API Hugging Face avec un modèle optimisé pour l'anime et le fantastique
async function queryHuggingFace(prompt, token) {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/Lykon/dreamshaper-xl-v2-turbo",
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer"
    }
  );

  return Buffer.from(response.data);
}

module.exports = {
  config: {
    name: "gem",
    version: "6.0",
    author: "Shade",
    role: 0,
    category: "ai",
    guide: { fr: "Réponds à une image avec tes consignes de montage de scène" }
  },

  onStart: async function ({ message, event, args, api }) {
    const userID = event.senderID;
    const prompt = args.join(" ").trim();
    const hfToken = process.env.HF_TOKEN; // Nom de la variable sur Render

    if (!hfToken) {
      return message.reply("❌ Erreur : La variable `HF_TOKEN` n'est pas configurée sur Render.");
    }

    if (prompt.toLowerCase() === "reset") {
      memory[userID] = { image: null, story: "" };
      saveMemory();
      return message.reply("🧠 Mémoire des scènes réinitialisée !");
    }

    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || attachment.type !== "photo") {
      return message.reply("🌸 Réponds à une image pour imaginer ta scène !");
    }

    if (!prompt) {
      return message.reply("💡 Exemple : Réponds à la photo et écris : .gem en train de se battre avec sukuna sur une maison en bois");
    }

    // Si c'est une nouvelle image, on commence une nouvelle histoire
    if (!memory[userID] || memory[userID].image !== attachment.url) {
      memory[userID] = { image: attachment.url, story: `Anime style montage, inspired by the appearance of the person in the photo, ${prompt}` };
    } else {
      // Sinon on ajoute la suite des modifications demandées par l'utilisateur
      memory[userID].story = `${memory[userID].story}, ${prompt}`;
    }
    
    saveMemory();

    let loading;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `gem_${userID}_${Date.now()}.png`);

    try {
      api.setMessageReaction("🎨", event.messageID, () => {}, true);
      loading = await message.reply("🎨 Création de la scène en cours...");

      // Génération de l'image basée sur l'histoire accumulée
      const imageBuffer = await queryHuggingFace(memory[userID].story, hfToken);

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(filePath, imageBuffer);

      if (loading?.messageID) {
        await api.unsendMessage(loading.messageID);
      }

      api.setMessageReaction("🖼️", event.messageID, () => {}, true);

      return message.reply({
        body: "🖼️ Voici ton montage généré !",
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (e) {
      console.log("====== GEM ERROR ======", e.message || e);
      if (loading?.messageID) await api.unsendMessage(loading.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return message.reply("💔 Le serveur de dessin est saturé ou se réveille. Réessaie dans 30 secondes !");
    }
  }
};
