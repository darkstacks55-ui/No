const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ───── 👑 OWNER ─────
const OWNER_UID = "61573867120837";
const OWNER_NAME = "Shade";

// ───── 🔑 OPENAI API (👉 ICI TU METS TON API) ─────
const OPENAI_API_KEY = "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";

// ───── MEMORY ─────
const memoryFile = path.join(__dirname, "cache", "angel_memory.json");

if (!fs.existsSync(memoryFile)) {
  fs.writeFileSync(memoryFile, "{}");
}

let memory = {};

try {
  memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
} catch {
  memory = {};
}

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

// ───── FONT ─────
function font(text) {
  return text
    .replace(/a/g, "𝘢").replace(/b/g, "𝘣").replace(/c/g, "𝘤")
    .replace(/d/g, "𝘥").replace(/e/g, "𝘦").replace(/f/g, "𝘧")
    .replace(/g/g, "𝘨").replace(/h/g, "𝘩").replace(/i/g, "𝘪")
    .replace(/j/g, "𝘫").replace(/k/g, "𝘬").replace(/l/g, "𝘭")
    .replace(/m/g, "𝘮").replace(/n/g, "𝘯").replace(/o/g, "𝘰")
    .replace(/p/g, "𝘱").replace(/q/g, "𝘲").replace(/r/g, "𝘳")
    .replace(/s/g, "𝘴").replace(/t/g, "𝘵").replace(/u/g, "𝘶")
    .replace(/v/g, "𝘷").replace(/w/g, "𝘸").replace(/x/g, "𝘹")
    .replace(/y/g, "𝘺").replace(/z/g, "𝘻");
}

// ───── FRAME ─────
function frame(msg) {
  return `🌸 𝗔𝗡𝗚𝗘𝗟 𝗔𝗜 🌸\n━━━━━━━━━━\n${msg}\n━━━━━━━━━━`;
}

// ───── 🤖 AI CORE (OPENAI + FALLBACK) ─────
async function callAI(prompt) {

  // 🔥 1. OPENAI (PRIORITY)
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es ANGEL 🤍 une IA kawaii, douce et intelligente."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content;
    if (reply) return reply;

  } catch (e) {
    console.log("OpenAI failed");
  }

  // 🌸 2. FALLBACK API GRATUITE
  try {
    const free = await axios.get(
      "https://ai-chat-gpt-4-lite.onrender.com/api/hercai",
      {
        params: { question: prompt },
        timeout: 15000
      }
    );

    return (
      free.data?.reply ||
      free.data?.response ||
      "… Angel réfléchit doucement 🌸"
    );

  } catch (e) {
    console.log("Fallback failed");
  }

  return "… système instable 😿";
}

// ───── GENERATE ─────
async function generate(userID, userName, message) {

  if (!memory[userID]) memory[userID] = [];

  memory[userID].push({ name: userName, msg: message });

  if (memory[userID].length > 25) memory[userID].shift();

  saveMemory();

  const isOwner = userID === OWNER_UID;

  let prompt = `
Tu es ANGEL 🤍 IA kawaii.

Utilisateur: ${userName}
Message: ${message}
`;

  if (isOwner) {
    prompt += "\nTu respectes Shade ton créateur 💖";
  }

  const reply = await callAI(prompt);

  memory[userID].push({ name: "ANGEL", msg: reply });

  saveMemory();

  return frame(font(reply));
}

// ───── BOT ─────
module.exports = {
  config: {
    name: "angel",
    version: "4.0",
    author: "Shade",
    category: "ai"
  },

  onChat: async function ({ event, message, api }) {

    if (!event.body) return;

    const body = event.body.trim();
    const lower = body.toLowerCase();

    const userID = event.senderID;

    const userName =
      (await api.getUserInfo(userID))[userID]?.name || "toi";

    // ───── 1. reply si on répond à Angel ─────
    if (
      event.messageReply &&
      event.messageReply.senderID == api.getCurrentUserID()
    ) {
      return message.reply(await generate(userID, userName, body));
    }

    // ───── 2. activation "angel" ─────
    if (!lower.startsWith("angel")) return;

    // juste "angel"
    if (lower === "angel") {
      return message.reply(frame(font("bonjour 🌸 je suis Angel 💖")));
    }

    // angel + message
    const input = body.slice(5).trim();
    if (!input) return;

    return message.reply(await generate(userID, userName, input));
  }
};
