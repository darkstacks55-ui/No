const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_ENDPOINT = "https://shizuai.vercel.app/chat";

const OWNER_UID = "61573867120837";
const OWNER_NAME = "Shade";

const memoryFile = "./angel_memory.json";

// 🧠 MEMORY SAFE
let memory = {};

if (fs.existsSync(memoryFile)) {
  try {
    memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  } catch {
    memory = {};
  }
}

function saveMemory() {
  try {
    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
  } catch {}
}

// 🌸 FRAME
function frame(msg) {
  return `🌸═════ ANGEL AI ═════🌸\n${msg}\n🌸══════════════════🌸`;
}

// 💖 FONT (safe)
function font(text = "") {
  return text.toString()
    .replace(/[a-z]/g, c =>
      "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻"[
        "abcdefghijklmnopqrstuvwxyz".indexOf(c)
      ] || c
    );
}

// 🤖 AI CALL
async function callAI(prompt) {
  try {
    const res = await axios.post(API_ENDPOINT, {
      message: prompt
    });

    return res.data?.reply || "…";
  } catch {
    return "😿 Angel ne peut pas répondre.";
  }
}

// 💬 GENERATE
async function generate(userID, userName, message) {

  const isOwner = userID === OWNER_UID;

  if (!memory[userID]) memory[userID] = [];

  memory[userID].push({ name: userName, message });

  if (memory[userID].length > 20) {
    memory[userID].shift();
  }

  saveMemory();

  // 🌸 RECOGNITION OWNER
  if (isOwner && /angel/i.test(message)) {
    return frame(font(`oui ${OWNER_NAME} 💖 je te reconnais…`));
  }

  // 👀 QUI EST LE CREATOR
  if (/createur|qui.*cree/i.test(message)) {
    return frame(font("Mon créateur est Shade 🌸✨"));
  }

  const history = memory[userID]
    .slice(-10)
    .map(m => `${m.name}: ${m.message}`)
    .join("\n");

  let prompt = `
Tu es ANGEL 🤍 IA kawaii.

Règles:
- douce
- naturelle
- pas de réponses étranges
- réponses courtes
- emojis 🌸💖✨

Créateur: ${OWNER_NAME}

${isOwner ? "IMPORTANT: tu reconnais l'utilisateur comme ton créateur." : ""}

Conversation:
${history}

Message:
${message}
`;

  const reply = await callAI(prompt);

  memory[userID].push({ name: "ANGEL", message: reply });

  saveMemory();

  return frame(font(reply));
}

// ───── BOT ─────
module.exports = {
  config: {
    name: "angel",
    version: "2.0",
    author: "Shade",
    role: 0,
    category: "ai"
  },

  onStart: async function ({ message, event, args, api }) {
    const input = args.join(" ").trim();
    const userID = event.senderID;

    const userName =
      (await api.getUserInfo(userID))[userID]?.name || "toi";

    if (!input) {
      return message.reply(frame("bonjour 🌸 Angel est là 💖"));
    }

    const reply = await generate(userID, userName, input);

    return message.reply(reply);
  },

  onChat: async function ({ event, message }) {

    const body = event.body?.trim();
    if (!body) return;

    // ❌ ACTIVATION UNIQUEMENT "angel"
    if (!body.toLowerCase().startsWith("angel ")) return;

    const input = body.slice(6).trim();

    if (!input) {
      return message.reply(frame("oui ? 🌸"));
    }

    const userID = event.senderID;

    const userName = event.author || "toi";

    const reply = await generate(userID, userName, input);

    return message.reply(reply);
  }
};
