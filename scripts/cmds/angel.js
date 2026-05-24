const axios = require("axios");
const fs = require("fs");

const memoryFile = "./angel_memory.json";

// 👑 OWNER
const OWNER_UID = "61573867120837";
const OWNER_NAME = "Shade";

// 🧠 MEMORY
let memory = {};

if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile, "utf8"));
}

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

// 🌸 FRAME
function frame(msg) {
  return `🌸═════ ANGEL AI ═════🌸
${msg}
🌸══════════════════🌸`;
}

// 💖 FONT
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

// 🤖 ANGEL API
async function callAngelAPI(prompt) {

  try {

    const res = await axios.get(
      "https://ai-chat-gpt-4-lite.onrender.com/api/hercai",
      {
        params: {
          question: `
Tu es ANGEL 🌸

Tu es :
- douce
- kawaii
- naturelle
- féminine
- intelligente
- légèrement taquine

Règles :
- Tu réponds en français
- Réponses courtes
- Réponses naturelles
- Pas de texte technique
- Pas de longs paragraphes anglais
- Tu utilises parfois 🌸✨💖

Utilisateur :
${prompt}
`
        },

        timeout: 15000
      }
    );

    let reply =
      res.data?.reply ||
      res.data?.response ||
      res.data?.result ||
      res.data?.gpt4 ||
      "🌸 Angel réfléchit doucement...";

    // 🧼 nettoyage
    reply = reply
      .replace(/Based on the information provided/gi, "")
      .replace(/technical question/gi, "")
      .replace(/analysis/gi, "")
      .replace(/complex/gi, "")
      .replace(/however/gi, "")
      .replace(/I can see that/gi, "")
      .replace(/multiple possible interpretations/gi, "")
      .trim();

    return reply;

  } catch (err) {

    console.log(err);

    return "😿 Angel ne peut pas répondre pour le moment...";
  }
}

// 💬 GENERATE
async function generateResponse(userID, userName, message) {

  if (!memory[userID]) memory[userID] = [];

  memory[userID].push({
    name: userName,
    message
  });

  if (memory[userID].length > 50) {
    memory[userID].shift();
  }

  saveMemory();

  // 👑 résumé créateur
  if (/^résumé$/i.test(message)) {

    if (userID !== OWNER_UID) {
      return "❌ Seul Shade peut voir ça 💖";
    }

    let summaryPrompt = `
Tu es ANGEL 🌸

Résume les conversations
de manière kawaii et naturelle 💖
`;

    Object.entries(memory).forEach(([uid, msgs]) => {

      summaryPrompt += `
UID: ${uid}

${msgs.map(
  m => `${m.name}: ${m.message}`
).join("\n")}
`;
    });

    return await callAngelAPI(summaryPrompt);
  }

  // 🌸 prompt principal
  let prompt = `
Créateur : ${OWNER_NAME}

Utilisateur : ${userName}

Conversation :

${memory[userID]
  .map(m => `${m.name}: ${m.message}`)
  .join("\n")}
`;

  // 👑 créateur
  if (userID === OWNER_UID) {

    prompt += `
Tu reconnais Shade comme ton créateur 💖
`;
  }

  // 🌸 créateur question
  if (/createur|qui.*cree|qui.*fait/i.test(message)) {
    return "🌸 Mon créateur est Shade 💖";
  }

  const reply = await callAngelAPI(prompt);

  memory[userID].push({
    name: "ANGEL",
    message: reply
  });

  saveMemory();

  return reply;
}

// ───── BOT ─────
module.exports = {

  config: {
    name: "angel",
    aliases: ["angelai"],
    version: "6.0",
    author: "Shade",
    role: 0,
    category: "ai",
    shortDescription: "Angel AI kawaii 🌸"
  },

  // 🌸 !angel
  onStart: async function ({
    message,
    event,
    args,
    api
  }) {

    const input = args.join(" ").trim();

    const userID = event.senderID;

    const userName =
      (await api.getUserInfo(userID))[userID]?.name || "toi";

    // juste !angel
    if (!input) {

      return message.reply(
        frame(
          font("bonjour 🌸 je suis Angel 💖")
        )
      );
    }

    const reply = await generateResponse(
      userID,
      userName,
      input
    );

    return message.reply(
      frame(font(reply))
    );
  },

  // 🌸 CHAT SYSTEM
  onChat: async function ({
    event,
    message,
    api
  }) {

    if (!event.body) return;

    const body = event.body.trim();

    const userID = event.senderID;

    const userName =
      (await api.getUserInfo(userID))[userID]?.name || "toi";

    // 💖 reply à Angel
    if (
      event.messageReply &&
      event.messageReply.senderID ==
      api.getCurrentUserID()
    ) {

      const reply = await generateResponse(
        userID,
        userName,
        body
      );

      return message.reply(
        frame(font(reply))
      );
    }

    // 🌸 activation avec angel
    if (!body.toLowerCase().startsWith("angel")) return;

    const input = body.slice(5).trim();

    // juste "angel"
    if (!input) {

      return message.reply(
        frame(
          font("oui ? 🌸")
        )
      );
    }

    const reply = await generateResponse(
      userID,
      userName,
      input
    );

    return message.reply(
      frame(font(reply))
    );
  }
};
