const axios = require("axios");

const cmdsInfoUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/cmdsinfo.json";
const cmdsUrlJson = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/cmdsurl.json";
const fontUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/xfont.json";

const ITEMS_PER_PAGE = 10;

// 🔒 TON UID (seul autorisé)
const OWNER_UID = "61573867120837";

let fontMap = {};

async function loadFont() {
  try {
    const res = await axios.get(fontUrl, { timeout: 5000 });
    fontMap = res.data || {};
  } catch {
    fontMap = {};
  }
}

function toBold(text = "") {
  return text.split("").map(ch => fontMap[ch] || ch).join("");
}

module.exports.config = {
  name: "cs",
  aliases: ["cmdstore", "commandstore", "sakurastore"],
  version: "2.2-angel-secure",
  author: "Angel Secure Edition",
  role: 0,
  countDown: 3,
  category: "admin",
  guide: { en: "Usage: /cs [command | letter | page]" }
};

module.exports.onStart = async function ({ api, event, args }) {
  try {
    // 🔒 SECURITY CHECK
    if (event.senderID !== OWNER_UID) {
      return api.sendMessage("🌸⛔ Angel Guard: access denied.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    await loadFont();

    const query = (args.join(" ") || "").trim().toLowerCase();

    const res = await axios.get(cmdsInfoUrl, { timeout: 7000 });
    const cmds = res?.data?.cmdName;

    if (!Array.isArray(cmds)) {
      return api.sendMessage("❌ Database error.", event.threadID, event.messageID);
    }

    let finalArray = cmds;
    let page = 1;

    if (query) {
      if (!isNaN(query)) {
        page = parseInt(query);
      } else if (query.length === 1) {
        finalArray = cmds.filter(c => c?.cmd?.toLowerCase()?.startsWith(query));
      } else {
        finalArray = cmds.filter(c => c?.cmd?.toLowerCase()?.includes(query));
      }
    }

    if (!finalArray.length) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ No command found.", event.threadID, event.messageID);
    }

    const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);

    if (page < 1 || page > totalPages) {
      return api.sendMessage(`❌ Page must be 1-${totalPages}`, event.threadID, event.messageID);
    }

    const start = (page - 1) * ITEMS_PER_PAGE;
    const cmdsToShow = finalArray.slice(start, start + ITEMS_PER_PAGE);

    let msg =
`🌸💖 𝐀𝐍𝐆𝐄𝐋 𝐒𝐓𝐎𝐑𝐄 💖🌸
━━━━━━━━━━━━━━
📄 Page: ${page}/${totalPages}
🧩 Total: ${finalArray.length}
━━━━━━━━━━━━━━\n`;

    cmdsToShow.forEach((cmd, i) => {
      if (!cmd?.cmd) return;

      msg +=
`💠 ${start + i + 1}. ${cmd.cmd}
👨‍💻 Author: ${cmd.author || "Unknown"}
🕓 Update: ${cmd.update || "Unknown"}
━━━━━━━━━━━━━━\n`;
    });

    msg += `💌 Reply number to open command`;

    const sent = await api.sendMessage(msg, event.threadID, event.messageID);

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    if (!sent?.messageID) return;

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: this.config.name,
      type: "angel_secure",
      author: event.senderID,
      data: finalArray,
      page
    });

  } catch (err) {
    console.log(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return api.sendMessage("❌ Angel Store failed.", event.threadID, event.messageID);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  try {
    if (!Reply || !Reply.data) return;

    // 🔒 SECURITY
    if (event.senderID !== OWNER_UID) {
      return api.sendMessage("⛔ Angel lock active.", event.threadID, event.messageID);
    }

    const num = parseInt(event.body);
    if (isNaN(num)) return;

    const index = num - 1;

    if (index < 0 || index >= Reply.data.length) {
      return api.sendMessage("❌ Invalid choice", event.threadID, event.messageID);
    }

    const cmd = Reply.data[index];

    const res = await axios.get(cmdsUrlJson, { timeout: 7000 });
    const url = res?.data?.[cmd.cmd];

    if (!url) {
      return api.sendMessage("❌ URL not found", event.threadID, event.messageID);
    }

    api.unsendMessage(Reply.messageID);

    api.setMessageReaction("💖", event.messageID, () => {}, true);

    return api.sendMessage(
`🌸💌 𝐀𝐍𝐆𝐄𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃
━━━━━━━━━━━━━━
🧩 ${cmd.cmd}
👨‍💻 ${cmd.author || "Unknown"}
🌐 ${url}
━━━━━━━━━━━━━━`,
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Error loading command", event.threadID, event.messageID);
  }
};
