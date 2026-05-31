const OWNER_UID = "61573867120837"; // 💖 remplace par ton UID

module.exports = {
  config: {
    name: "join",
    version: "✨ 3.1 angel kawaii",
    author: "Christus × Shade 💖",
    countDown: 5,
    role: 2,
    dev: true,
    shortDescription: "💖 Join group angel system",
    longDescription: "🌸 Liste des groupes + join kawaii system",
    category: "owner",
    guide: { en: "{p}{n} [page|next|prev]" },
  },

  onStart: async function ({ api, event, args }) {
    try {
      // 💖 UID LOCK
      if (event.senderID !== OWNER_UID) {
        return api.sendMessage(
          "⛔💔 Désolé mon amour… tu n’as pas la permission d’utiliser cette commande 💖✨",
          event.threadID,
          event.messageID
        );
      }

      const groupList = await api.getThreadList(200, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);

      if (!filteredList.length)
        return api.sendMessage("💔✨ Aucun groupe trouvé…", event.threadID);

      const pageSize = 15;
      const totalPages = Math.ceil(filteredList.length / pageSize);

      if (!global.joinPage) global.joinPage = {};
      const currentThread = event.threadID;

      let page = 1;
      if (args[0]) {
        const input = args[0].toLowerCase();
        if (input === "next") page = (global.joinPage[currentThread] || 1) + 1;
        else if (input === "prev") page = (global.joinPage[currentThread] || 1) - 1;
        else if (input.includes("/")) page = parseInt(input.split("/")[0]) || 1;
        else page = parseInt(input) || 1;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      global.joinPage[currentThread] = page;

      const startIndex = (page - 1) * pageSize;
      const currentGroups = filteredList.slice(startIndex, startIndex + pageSize);

      const formatted = currentGroups.map((g, i) =>
        `💖 ${startIndex + i + 1}. 『${g.threadName || "🌸 Groupe sans nom"}』\n👥 ${g.participantIDs.length} membres\n🆔 ${g.threadID}\n`
      );

      const message = [
        "╭─────────────💖",
        "│ 🌸 ANGEL GROUP JOIN",
        "│──────────────────",
        formatted.join("\n"),
        "│──────────────────",
        `│ 📄 Page ${page}/${totalPages} 💖`,
        "│ 🌸 Réponds avec le numéro pour rejoindre",
        "╰─────────────💖"
      ].join("\n");

      const sentMessage = await api.sendMessage(message, event.threadID);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID,
        list: filteredList,
        page,
        pageSize
      });

    } catch (e) {
      console.error(e);
      api.sendMessage("💔✨ Erreur angel system…", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const OWNER_UID = "61573867120837";

    if (event.senderID !== OWNER_UID) return;

    const { author, list, page, pageSize } = Reply;
    if (event.senderID !== author) return;

    const groupIndex = parseInt(event.body, 10);
    if (isNaN(groupIndex))
      return api.sendMessage("💔✨ Numéro invalide…", event.threadID);

    const startIndex = (page - 1) * pageSize;
    const currentGroups = list.slice(startIndex, startIndex + pageSize);

    if (groupIndex > currentGroups.length)
      return api.sendMessage("💔✨ Hors limite…", event.threadID);

    try {
      const selected = currentGroups[groupIndex - 1];

      await api.addUserToGroup(event.senderID, selected.threadID);

      api.sendMessage(
        `💖✨ Tu as rejoint 『${selected.threadName}』 🌸`,
        event.threadID
      );

    } catch (e) {
      console.error(e);
      api.sendMessage("💔✨ Impossible de rejoindre…", event.threadID);
    }

    global.GoatBot.onReply.delete(event.messageID);
  }
};
