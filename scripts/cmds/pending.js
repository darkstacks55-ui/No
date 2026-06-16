const pendingGroups = new Map(); // stock temporaire

module.exports.config = {
  name: "pending",
  version: "1.0.0",
  role: 2,
  author: "Shade",
  description: "Pending list + approve via reply g1 g2 c1",
  category: "owern"
};

module.exports.onLoad = () => {
  console.log("Pending system loaded");
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // Exemple: récupération fake des groupes en attente
  const groups = global.pendingThreads || [];

  if (groups.length === 0) {
    return api.sendMessage("📋 Aucun groupe en attente.", threadID, messageID);
  }

  let msg = `📋 »「𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧」«\n`;
  msg += `┣✦ 𝗧𝗼𝘁𝗮𝗹 𝘁𝗵𝗿𝗲𝗮𝗱𝘀: ${groups.length}\n`;
  msg += `┣✦ 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗴1, g2... 𝘁𝗼 𝗮𝗽𝗽𝗿𝗼𝘃𝗲\n`;
  msg += `┣✦ 𝗨𝘀𝗲 c1, c2... 𝘁𝗼 𝗰𝗮𝗻𝗰𝗲𝗹\n`;
  msg += `┗━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  groups.forEach((g, i) => {
    msg += `┣ ${i + 1}. ${g.name}\n`;
    msg += `┗ 𝗜𝗗: ${g.id}\n`;
  });

  return api.sendMessage(msg, threadID, (err, info) => {
    global.pendingReply = {
      messageID: info.messageID,
      groups
    };
  });
};

// 🔥 LISTENER REPLY
module.exports.handleReply = async function ({ api, event }) {
  const { body, threadID } = event;

  if (!global.pendingReply) return;

  const match = body.match(/([gc])(\d+)/i);
  if (!match) return;

  const action = match[1]; // g ou c
  const index = parseInt(match[2]) - 1;

  const group = global.pendingReply.groups[index];
  if (!group) return api.sendMessage("❌ Groupe introuvable.", threadID);

  if (action.toLowerCase() === "g") {
    // APPROVE
    return api.sendMessage(
      `✅ Groupe APPROUVÉ : ${group.name}`,
      threadID
    );
  }

  if (action.toLowerCase() === "c") {
    // CANCEL
    return api.sendMessage(
      `❌ Groupe REFUSÉ : ${group.name}`,
      threadID
    );
  }
};
