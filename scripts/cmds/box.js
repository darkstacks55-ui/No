module.exports = {
  config: {
    name: "box",
    version: "1.5 angel fixed",
    author: "Shade ✨ Fix",
    role: 0,
    shortDescription: "📦 Gestion groupe",
    category: "group"
  },

  onStart: async function ({ api, event, message }) {

    try {

      const info = await api.getThreadInfo(event.threadID);

      const box = `
╭───────────────✦
│ 📦 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨
├────────────────
│ 🏷️ ${info.threadName}
│ 😀 ${info.emoji || "😊"}
│ 👥 ${info.participantIDs.length}
│ 👑 ${info.adminIDs.length}
├────────────────
│ 1️⃣ Nom groupe
│ 2️⃣ Photo groupe
│ 3️⃣ Emoji groupe
│ 4️⃣ UID groupe
│ 5️⃣ Membres
│ 6️⃣ Infos
├────────────────
👉 Réponds avec un chiffre 💖
      `;

      const msg = await api.sendMessage(box, event.threadID);

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: "box",
        author: event.senderID,
        threadID: event.threadID
      });

    } catch (err) {
      console.log(err);
      message.reply("💔 Erreur box");
    }
  },

  onReply: async function ({ api, event, Reply, message }) {

    if (event.senderID !== Reply.author) return;

    const choice = event.body?.trim();

    const info = await api.getThreadInfo(event.threadID);

    // 🆔 UID
    if (choice === "4") {
      return message.reply(`🆔 ${event.threadID}`);
    }

    // 👥 MEMBERS
    if (choice === "5") {
      return message.reply(info.participantIDs.join("\n"));
    }

    // 📊 INFO
    if (choice === "6") {
      return message.reply(
        `📦 Groupe: ${info.threadName}\n👥 ${info.participantIDs.length}\n👑 ${info.adminIDs.length}`
      );
    }

    // 🏷️ NAME
    if (choice === "1") {
      return message.reply("🏷️ Envoie le nouveau nom 💖", (err, msg) => {
        global.GoatBot.onReply.set(msg.messageID, {
          commandName: "box_name",
          author: event.senderID,
          threadID: event.threadID
        });
      });
    }

    // 🖼️ PHOTO
    if (choice === "2") {
      return message.reply("🖼️ Envoie une image 💖", (err, msg) => {
        global.GoatBot.onReply.set(msg.messageID, {
          commandName: "box_photo",
          author: event.senderID,
          threadID: event.threadID
        });
      });
    }

    // 😀 EMOJI
    if (choice === "3") {
      return message.reply("😀 Envoie un emoji 💖", (err, msg) => {
        global.GoatBot.onReply.set(msg.messageID, {
          commandName: "box_emoji",
          author: event.senderID,
          threadID: event.threadID
        });
      });
    }
  },

  // 💖 EXTRA HANDLERS (IMPORTANT)
  onReplyBox_name: async function ({ api, event }) {
    await api.setTitle(event.body, event.threadID);
    api.sendMessage("🏷️ Nom changé 💖", event.threadID);
  },

  onReplyBox_photo: async function ({ api, event }) {
    const img = event.attachments?.[0]?.url;
    if (!img) return api.sendMessage("❌ Envoie une image", event.threadID);

    const res = await api.changeGroupImage(img, event.threadID);
    api.sendMessage("🖼️ Photo changée 💖", event.threadID);
  },

  onReplyBox_emoji: async function ({ api, event }) {
    await api.changeThreadEmoji(event.body, event.threadID);
    api.sendMessage("😀 Emoji changé 💖", event.threadID);
  }
};
