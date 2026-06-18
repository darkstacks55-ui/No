const OWNER_ID = "61573867120837";

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "3.2 angel stable fix",
    author: "Shade × Gemini ✨",
    role: 2,
    description: "🌸 Gestion des demandes d’amis Facebook",
    category: "owner",
    guide: {
      en: "Répondez avec : add <num> | del <num> | add all | del all"
    }
  },

  onStart: async function ({ api, event, commandName }) {
    const { threadID, messageID, senderID } = event;

    if (senderID !== OWNER_ID) {
      return api.sendMessage("🌸⛔ Cette commande est réservée à mon Owner.", threadID, messageID);
    }

    try {
      // Requête GraphQL pour récupérer la liste des invitations reçues
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303", // ID de récupération global des invitations
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);

      let data = {};
      try {
        data = typeof response === "string" ? JSON.parse(response) : response;
      } catch (parseErr) {
        data = response;
      }

      const listRequest = data?.data?.viewer?.friending_possibilities?.edges || [];

      if (!listRequest.length) {
        try { api.setMessageReaction("💔", messageID, () => {}, true); } catch(e){}
        return api.sendMessage("🌸 Aucune demande d'ami en attente 💖", threadID, messageID);
      }

      let msg = "╔═══ 💖 𝗔𝗡𝗚𝗘𝗟 𝗥𝗘𝗤𝗨𝗘𝗦𝗧𝗦 💖 ═══╗\n\n";

      listRequest.forEach((u, i) => {
        msg += `💠 ${i + 1}. ${u.node?.name || "Utilisateur Facebook"}\n`;
        msg += `🆔 ${u.node?.id}\n`;
        msg += `🔗 https://www.facebook.com/${u.node?.id}\n`;
        msg += "━━━━━━━━━━━━━━━\n";
      });

      msg += "\n🌸 **Pour interagir, répondez à ce message avec :**\n• `add <num>` (ex: add 1)\n• `del <num>` (ex: del 1)\n• `add all` ou `del all`";

      const sent = await api.sendMessage(msg, threadID, messageID);

      // Enregistrement dans GoatBot
      global.GoatBot?.onReply?.set(sent.messageID, {
        commandName,
        author: senderID,
        listRequest,
        messageID: sent.messageID,
        unsendTimeout: setTimeout(() => {
          try { api.unsendMessage(sent.messageID); } catch(e) {}
        }, 120000) // Le menu s'efface automatiquement après 2 minutes
      });

      try { api.setMessageReaction("💖", messageID, () => {}, true); } catch(e){}

    } catch (e) {
      console.error(e);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(err){}
      return api.sendMessage("❌ Erreur lors du chargement des demandes 💔", threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body } = event;
    const { author, listRequest, messageID: replyMsgID } = Reply || {};

    if (senderID !== OWNER_ID || senderID !== author) return;

    const args = (body || "").trim().toLowerCase().split(/\s+/);
    const action = args[0];

    if (action !== "add" && action !== "del") {
      return api.sendMessage("⚠️ Action invalide. Utilisez `add` ou `del`.", threadID, messageID);
    }

    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch(e){}
      clearTimeout(Reply?.unsendTimeout);

      if (!Array.isArray(listRequest) || listRequest.length === 0) {
        return api.sendMessage("❌ Liste expirée ou introuvable 💔", threadID, messageID);
      }

      let targets = args.slice(1);
      if (targets[0] === "all") {
        targets = listRequest.map((_, i) => i + 1);
      }

      const success = [];
      const failed = [];

      for (const num of targets) {
        const n = parseInt(num, 10);
        if (isNaN(n) || n < 1 || n > listRequest.length) {
          failed.push(`❌ #${num} Position invalide`);
          continue;
        }

        const user = listRequest[n - 1];
        if (!user?.node?.id) {
          failed.push(`❌ #${num} Données utilisateur corrompues`);
          continue;
        }

        const isAdd = action === "add";

        // Déclaration des nouveaux doc_id mis à jour pour Facebook Web Desktop
        const form = {
          av: api.getCurrentUserID(),
          fb_api_caller_class: "RelayModern",
          fb_api_req_friendly_name: isAdd 
            ? "FriendingCometFriendRequestConfirmMutation" 
            : "FriendingCometFriendRequestDeleteMutation",
          doc_id: isAdd ? "5482329325178351" : "5512596485458023", // Mises à jour des doc_id
          variables: JSON.stringify({
            input: {
              source: "friends_tab",
              actor_id: api.getCurrentUserID(),
              friend_requester_id: user.node.id,
              client_mutation_id: Math.floor(Math.random() * 1000000).toString()
            }
          })
        };

        try {
          const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
          
          let resData = {};
          try {
            resData = typeof res === "string" ? JSON.parse(res) : res;
          } catch(e) {
            resData = res;
          }

          // Vérification adaptative de la validation de la mutation
          const hasError = resData?.errors || resData?.data?.friend_request_confirm?.error || resData?.data?.friend_request_delete?.error;

          if (!hasError) {
            success.push(`✨ ${isAdd ? "Accepté" : "Refusé"} → **${user.node.name || user.node.id}**`);
          } else {
            failed.push(`❌ Échec → **${user.node.name || user.node.id}**`);
          }
        } catch (err) {
          console.error("Mutation Error:", err);
          failed.push(`❌ Erreur réseau → **${user.node.name || user.node.id}**`);
        }
      }

      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e){}

      let msg = "🌸💖 𝗔𝗡𝗚𝗘𝗟 𝗔𝗖𝗖𝗘𝗣𝗧 𝗥𝗘𝗦𝗨𝗟𝗧 💖🌸\n\n";
      if (success.length) msg += `✅ **Succès :**\n${success.join("\n")}\n\n`;
      if (failed.length) msg += `⚠️ **Échecs :**\n${failed.join("\n")}`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (globalErr) {
      console.error("Global Reply Error:", globalErr);
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch(e){}
      return api.sendMessage("❌ Une erreur interne est survenue lors du traitement 💔", threadID, messageID);
    }
  }
};
