const { getStreamsFromAttachment } = global.utils;
const g = require("fca-aryan-nix");

// Stockage temporaire pour notifications et réponses
const notificationMemory = {};
const adminReplies = {};

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "6.0",
    author: "Shade",
    countDown: 5,
    role: 2,
    category: "settings",
    shortDescription: "📢 Envoie une notification stylée et permet aux admins de répondre via le bot",
    longDescription: "Envoie un message stylé à tous les groupes avec nom du groupe et notifie les admins des réponses pour qu'ils puissent répondre via le bot.",
    guide: { en: "notification <message>" },
    usePrefix: false,
    noPrefix: true
  },

  // Commande principale : envoi de la notification
  onStart: async function({ message, api, event, threadsData, envCommands, commandName, args }) {
    const { delayPerGroup = 300 } = envCommands[commandName] || {};
    if (!args[0]) return message.reply("⚠ Veuillez entrer le message à envoyer à tous les groupes.");

    const allThreads = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply("⚠ Aucun groupe trouvé.");

    message.reply(`⏳ Début de l'envoi aux ${allThreads.length} groupes...`);

    let sendSuccess = 0;
    const sendError = [];

    for (const thread of allThreads) {
      let groupName = thread.name || "Groupe inconnu";
      if (!thread.name) {
        try { const info = await api.getThreadInfo(thread.threadID); groupName = info.threadName || groupName; } catch {}
      }

      const notificationBody = `
━━━━━━━━━━━━━━
📢 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍
🏷️ 𝐆𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞: ${groupName}

💬 
${args.join(" ")}

      `.trim();

      const formSend = {
        body: notificationBody,
        attachment: await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ])
      };

      try {
        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        // Stocke le message pour call admin
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName };
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) { sendError.push({ threadID: thread.threadID, groupName, error: err.message }); }
    }

    // Bilan
    let bilan = `
━━━━━━━━━━━━
📬 𝐁𝐈𝐋𝐀𝐍 𝐃𝐄 𝐋'𝐄𝐍𝐕𝐎𝐈
✅ Groupes réussis : ${sendSuccess}
❌ Groupes échoués : ${sendError.length}
`;
    if (sendError.length) sendError.forEach(err => { bilan += `❌ ${err.groupName} : ${err.error}\n`; });
    bilan += `━━━━━━━━━━━━`;
    message.reply(bilan.trim());
  },

  // Détection des réponses à la notification pour call admin
  onMessage: async function({ api, event }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key => key.endsWith(`_${repliedMsgID}`));
    if (!notificationKey) return;

    const { groupName } = notificationMemory[notificationKey];
    const userName = event.senderName;
    const userID = event.senderID;

    // Prépare le message pour les admins
    const adminMessage = `
━━━━━━━━━━━━
👤 𝐑𝐄𝐏𝐎𝐍𝐒𝐄 𝐀̀ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍
📝 Nom : ${userName}
🆔 ID : ${userID}
🏷️ Groupe : ${groupName}
──────────────────────────
💬 Message :
${event.body}
💡 Répondez à ce message pour répondre à l'utilisateur via le bot.
━━━━━━━━━━━━
    `.trim();

    // Liste des admins (role = 2)
    const allThreads = await api.getThreadList(1000, null, ['INBOX']);
    const adminIDs = allThreads
      .filter(t => t.isGroup)
      .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
    const uniqueAdmins = [...new Set(adminIDs)];

    // Envoie à chaque admin et stocke pour la réponse
    for (const adminID of uniqueAdmins) {
      try {
        const sent = await api.sendMessage(adminMessage, adminID);
        adminReplies[sent.messageID] = {
          originalThreadID: event.threadID,
          userID
        };
      } catch {}
    }
  },

  // Gestion de la réponse d’un admin
  onReply: async function({ api, event }) {
    const replyData = adminReplies[event.messageReply?.messageID];
    if (!replyData) return;

    const { originalThreadID, userID } = replyData;
    try {
      await api.sendMessage(event.body, originalThreadID || userID);
      delete adminReplies[event.messageReply.messageID];
    } catch {}
  }
};
