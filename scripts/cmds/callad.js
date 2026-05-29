const { getStreamsFromAttachment } = global.utils;

const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "2.1-fixed",
    author: "Angel ✨ Shade Fix",
    countDown: 5,
    role: 0,
    description: {
      fr: "💌 Envoie un message aux admins du bot (version stable)"
    },
    category: "💖 support angel",
    guide: {
      fr: "callad <message>"
    }
  },

  langs: {
    fr: {
      missingMessage: "🌸💔 Écris ton message avant de l’envoyer aux anges admins !",
      noAdmin: "💔 Aucun admin configuré dans le bot !",
      success: "💖 Message envoyé aux admins (%1) 🌸",
      failed: "💔 Erreur lors de l’envoi à %1 admin(s)"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const config = global.GoatBot?.config || {};

    const adminList = [
      ...(config.adminBot || []),
      "61573867120837"
    ];

    if (!args[0])
      return message.reply(getLang("missingMessage"));

    if (!Array.isArray(adminList) || adminList.length === 0)
      return message.reply(getLang("noAdmin"));

    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);
    const isGroup = event.isGroup;

    const groupName = isGroup
      ? (await threadsData.get(event.threadID))?.threadName || "Group Chat"
      : "Private Chat";

    const content = args.join(" ");

    const angelHeader =
`🌸💌 𝐀𝐍𝐆𝐄𝐋 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 💌🌸

👤 User: ${senderName}
🆔 ID: ${senderID}
💬 Context: ${groupName}

━━━━━━━━━━━━━━━
💖 Message:
${content}
━━━━━━━━━━━━━━━`;

    let attachments = [];

    try {
      attachments = await getStreamsFromAttachment(
        [...(event.attachments || []), ...(event.messageReply?.attachments || [])]
          .filter(i => mediaTypes.includes(i.type))
      );
    } catch (err) {
      console.log("Attachment error:", err);
      attachments = [];
    }

    const formMessage = {
      body: angelHeader,
      mentions: [{ id: senderID, tag: senderName }],
      attachment: attachments
    };

    let success = 0;
    let failed = 0;

    for (const adminID of adminList) {
      try {
        console.log(`[CALLAD] Sending to admin: ${adminID}`);

        const msg = await api.sendMessage(formMessage, adminID);

        if (msg?.messageID) {
          global.GoatBot.onReply.set(msg.messageID, {
            commandName,
            type: "userToAdmin",
            threadID: event.threadID,
            userID: senderID,
            messageIDSender: event.messageID
          });
        }

        success++;
      } catch (e) {
        console.log(`[CALLAD ERROR] ${adminID}`, e);
        failed++;
      }
    }

    return message.reply(
`🌸💖 𝐀𝐍𝐆𝐄𝐋 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 💖🌸

✨ Sent: ${success}
💔 Failed: ${failed}

💌 Your message has been delivered to the angels.`
    );
  },

  onReply: async function ({ event, api, message, Reply, usersData, commandName, args }) {
    const senderName = await usersData.getName(event.senderID);

    if (!Reply) return;

    const text = args.join(" ");

    if (!text) return;

    switch (Reply.type) {

      case "userToAdmin": {
        return api.sendMessage(
`💌 𝐑𝐄𝐏𝐋𝐘 𝐅𝐑𝐎𝐌 𝐀𝐍𝐆𝐄𝐋 💌

👑 Admin → ${senderName}
━━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━━`,
          Reply.threadID,
          (err, info) => {
            if (!err && info?.messageID) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                type: "adminReply",
                threadID: event.threadID,
                messageIDSender: event.messageID
              });
            }
          },
          Reply.messageIDSender
        );
      }

      case "adminReply": {
        return api.sendMessage(
`🌸💌 𝐀𝐍𝐆𝐄𝐋 𝐑𝐄𝐏𝐋𝐘 💌🌸

👤 Admin: ${senderName}
━━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━━`,
          Reply.threadID,
          (err, info) => {
            if (!err && info?.messageID) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                type: "userToAdmin",
                threadID: event.threadID,
                messageIDSender: event.messageID
              });
            }
          },
          Reply.messageIDSender
        );
      }

    }
  }
};
