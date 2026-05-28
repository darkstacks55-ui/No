const axios = require('axios');
const validUrl = require('valid-url');
const fs = require('fs');
const path = require('path');
const ytSearch = require('yt-search');
const { v4: uuidv4 } = require('uuid');

const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";
const YT_API = "http://65.109.80.126:20409/aryan/yx";
const EDIT_API = "https://gemini-edit-omega.vercel.app/edit";

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 😹 FRAME KAI
function frame(msg) {
  return `╭━━━〔 KAI 😹 〕━━━╮\n\n${msg}\n\n╰━━━〔 BOY AI 🔥 〕━━━╯`;
}

// 💖 FONT
function font(text) {
  const map = {
    a:"𝘢",b:"𝘣",c:"𝘤",d:"𝘥",e:"𝘦",f:"𝘧",g:"𝘨",h:"𝘩",i:"𝘪",
    j:"𝘫",k:"𝘬",l:"𝘭",m:"𝘮",n:"𝘯",o:"𝘰",p:"𝘱",q:"𝘲",r:"𝘳",
    s:"𝘴",t:"𝘵",u:"𝘶",v:"𝘷",w:"𝘸",x:"𝘹",y:"𝘺",z:"𝘻"
  };

  return String(text)
    .split("")
    .map(c => map[c.toLowerCase()] || c)
    .join("");
}

// 📥 DOWNLOAD
const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(response.data));
  return filePath;
};

// ♻️ RESET
const resetConversation = async (api, event, message) => {
  api.setMessageReaction("♻️", event.messageID, () => {}, true);
  try {
    await axios.delete(`${CLEAR_ENDPOINT}/${event.senderID}`);
    return message.reply(frame(font("conversation reset 😹")));
  } catch {
    return message.reply(frame(font("reset failed ❌")));
  }
};

// 🎨 EDIT
const handleEdit = async (api, event, message, args) => {
  const prompt = args.join(" ");
  if (!prompt) return message.reply(frame(font("give prompt 😹")));

  try {
    const res = await axios.get(EDIT_API, { params: { prompt } });

    if (!res.data?.images?.[0]) {
      return message.reply(frame(font("❌ error image")));
    }

    const base64 = res.data.images[0].replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    const imagePath = path.join(TMP_DIR, `${Date.now()}.png`);
    fs.writeFileSync(imagePath, buffer);

    return message.reply({
      body: frame(font("✨ image generated")),
      attachment: fs.createReadStream(imagePath)
    });

  } catch {
    return message.reply(frame(font("❌ edit error")));
  }
};

// 🎬 YOUTUBE
const handleYouTube = async (api, event, message, args) => {
  const option = args[0];
  const query = args.slice(1).join(" ");

  if (!query) return message.reply(frame(font("search missing 😹")));

  if (query.startsWith("http")) {
    const type = option === "-v" ? "mp4" : "mp3";

    try {
      const { data } = await axios.get(`${YT_API}?url=${encodeURIComponent(query)}&type=${type}`);
      const filePath = await downloadFile(data.download_url, type);
      return message.reply({ attachment: fs.createReadStream(filePath) });
    } catch {
      return message.reply(frame(font("download failed ❌")));
    }
  }

  try {
    const results = (await ytSearch(query)).videos.slice(0, 5);

    let list = font("🎧 choose 😹\n\n");
    results.forEach((v, i) => {
      list += `${i + 1}. ${v.title}\n`;
    });

    return message.reply(frame(list));

  } catch {
    return message.reply(frame(font("youtube error ❌")));
  }
};

// 🤖 KAI AI
const handleAIRequest = async (api, event, text, message) => {
  try {

    const res = await axios.post(API_ENDPOINT, {
      uid: event.senderID,
      message: `
Tu es KAI 😹

Tu es :
- garçon
- drôle
- gamer
- taquin
- naturel

Règles :
- français simple
- réponses courtes
- pas de style IA bizarre
- emojis 😹🛐👀
- tu donne de l'humour 
- faire rire les gens avec tes réponses 

Utilisateur:
${text}
`
    });

    let reply = res.data?.reply || "…";

    reply = font(
      reply
        .replace(/based/gi, "")
        .replace(/analysis/gi, "")
        .replace(/technical/gi, "")
        .trim()
    );

    return message.reply(frame(reply));

  } catch {
    return message.reply(frame(font("kai error 😹")));
  }
};

// ───── MODULE ─────
module.exports = {

  config: {
    name: 'kai',
    version: 'KAI-1.0',
    author: 'Shade',
    role: 0,
    category: 'ai'
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").trim();
    if (!input) return message.reply(frame(font("kai ready 😹")));

    if (input === "clear") {
      return resetConversation(api, event, message);
    }

    return handleAIRequest(api, event, input, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;

    const text = event.body?.trim();
    if (!text) return;

    return handleAIRequest(api, event, text, message);
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.trim();
    if (!body?.toLowerCase().startsWith("kai ")) return;
    return handleAIRequest(null, event, body.slice(3), message);
  }
};
