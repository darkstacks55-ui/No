const moment = require("moment-timezone");
const OWNER_ID = "61573867120837"; // Ton ID exclusif

module.exports = {
  config: {
    name: "ban",
    aliases: ["blacklist", "block"],
    version: "3.0.0",
    author: "Shade × Gemini",
    countDown: 5,
    role: 2,
    description: "🛡️ Système d'exclusion et de bannissement du groupe (Owner Only)",
    category: "admin",
    guide: {
      fr: "{p}{n} [@tag | uid | reply] [Raison] → Bannir un utilisateur\n{p}{n} unban [@tag | uid | reply] → Réhabiliter un utilisateur\n{p}{n} list → Afficher la base de données des bannis"
    }
  },

  langs: {
    fr: {
      onlyOwner: "⛔ **[ACCÈS REFUSÉ]** Protocole de haute sécurité. Seul le Fondateur Suprême possède l'autorité d'exclusion.",
      notFoundTarget: "⚠️ **[CIBLE MANQUANTE]** Veuillez mentionner un utilisateur, fournir son UID ou répondre à son message.",
      bannedSuccess: "🟩 **[SÉCURITÉ ENCLENCHÉE]** Le sujet %1 a été banni du terminal avec succès.",
      unbannedSuccess: "🔓 **[RÉHABILITATION]** L'accès au terminal a été restauré pour %1.",
      noData: "📡 **[BASE DE DONNÉES]** Aucun bannissement actif enregistré dans ce groupe.",
      selfBan: "❌ **[ERREUR EXECUTIVE]** Auto-destruction impossible. Vous ne pouvez pas vous bannir vous-même.",
      listHeader: "🖥️ **[PROTOCOLE BLACKLIST - TERMINAL]**\n━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    }
  },

  // --- LE BLOQUEUR AUTOMATIQUE (onChat) ---
  // Intercepte les messages des personnes bannies et bloque l'exécution de leurs commandes
  onChat: async function ({ api, event, threadsData }) {
    const { threadID, senderID, body } = event;
    if (!body || senderID === OWNER_ID) return;

    const threadData = await threadsData.get(threadID) || {};
    const dataBanned = threadData.data?.banned_ban || [];

    if (dataBanned.some(u => u.id == senderID)) {
      try {
        api.setMessageReaction("🚫", event.messageID, () => {}, true);
      } catch (e) {}
      return; // Bloque instantanément l'écoute du message
    }
  },

  // --- LOGIQUE ADMINISTRATIVE (onStart) ---
  onStart: async function ({ message, event, args, threadsData, usersData, api, getLang }) {
    const { threadID, messageID, senderID } = event;

    // 🔒 Restriction d'accès stricte à l'Owner
    if (senderID !== OWNER_ID) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return message.reply(getLang("onlyOwner"));
    }

    const threadData = await threadsData.get(threadID) || {};
    const dataBanned = threadData.data?.banned_ban || [];
    const action = args[0]?.toLowerCase();

    // --- CASE : UNBAN ---
    if (action === "unban") {
      const target = !isNaN(args[1]) ? args[1] : Object.keys(event.mentions || {})[0] || event.messageReply?.senderID;

      if (!target) return message.reply(getLang("notFoundTarget"));

      const index = dataBanned.findIndex(i => i.id == target);
      if (index === -1) {
        return message.reply("⚠️ Ce sujet n'est pas répertorié dans la blacklist.");
      }

      dataBanned.splice(index, 1);
      await threadsData.set(threadID, dataBanned, "data.banned_ban");

      const name = await usersData.getName(target) || target;
      try { api.setMessageReaction("🔓", messageID, () => {}, true); } catch(e){}
      return message.reply(getLang("unbannedSuccess", name));
    }

    // --- CASE : LIST ---
    if (action === "list") {
      if (!dataBanned.length) return message.reply(getLang("noData"));
      
      let msg = getLang("listHeader");
      for (const u of dataBanned) {
        const name = await usersData.getName(u.id) || "Utilisateur Inconnu";
        msg += `💀 **Cible :** ${name}\n🆔 **UID :** ${u.id}\n📅 **Date :** ${u.time}\n📝 **Raison :** ${u.reason}\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      }

      try { api.setMessageReaction("📡", messageID, () => {}, true); } catch(e){}
      return message.reply(msg);
    }

    // --- CASE : BAN TARGET ---
    let reasonIndex = 1;
    let target = event.messageReply?.senderID || Object.keys(event.mentions || {})[0];

    if (!target && args[0] && !isNaN(args[0])) {
      target = args[0];
    } else if (target) {
      // Si la cible vient d'un tag ou d'un reply, la raison commence après le premier argument
      reasonIndex = Object.keys(event.mentions || {}).length > 0 ? args.length : 1; 
    }

    if (!target) return message.reply(getLang("notFoundTarget"));
    if (target == senderID) return message.reply(getLang("selfBan"));

    const name = await usersData.getName(target) || target;
    const time = moment().tz("Africa/Kinshasa").format("HH:mm:ss [le] DD/MM/YYYY");
    const reason = args.slice(reasonIndex === args.length ? 1 : 0).join(" ").trim() || "Aucune raison spécifiée (Protocole Standard)";

    // Éviter les doublons dans la liste
    if (dataBanned.some(u => u.id == target)) {
      return message.reply("⚠️ Ce sujet est déjà banni du système.");
    }

    dataBanned.push({
      id: target,
      reason: reason,
      time: time
    });

    await threadsData.set(threadID, dataBanned, "data.banned_ban");

    try { api.setMessageReaction("🚫", messageID, () => {}, true); } catch(e){}
    return message.reply(getLang("bannedSuccess", name));
  }
};
