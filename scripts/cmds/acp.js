const moment = require("moment-timezone");

const OWNER_ID = "61573867120837";

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.3",
    author: "Christus + Shade fix",
    role: 2,
    description: "Gérer les demandes d'amis (accept/refuse)",
    category: "utility",
    guide: {
      en: "{pn} add <num> | del <num> | add all | del all"
    }
  },

  // 🔒 OWNER ONLY REPLY CONTROL
  onReply: async function ({ message, Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;

    // ❌ only owner can use
    if (event.senderID !== OWNER_ID) return;

    // ❌ only original author of menu can control it
    if (event.senderID !== author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    const action = args[0];

    clearTimeout(Reply.unsendTimeout);

    if (!listRequest || !Array.isArray(listRequest)) {
      return api.sendMessage("❌ Liste expirée ou invalide.", event.threadID);
    }

    let targetIDs = args.slice(1);

    if (targetIDs[0] === "all") {
      targetIDs = listRequest.map((_, i) => i + 1);
    }

    const success = [];
    const failed = [];

    for (const num of targetIDs) {
      const user = listRequest[parseInt(num) - 1];

      if (!user) {
        failed.push(`❌ Demande #${num} introuvable`);
        continue;
      }

      const isAdd = action === "add";

      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: isAdd
          ? "FriendingCometFriendRequestConfirmMutation"
          : "FriendingCometFriendRequestDeleteMutation",
        doc_id: isAdd
          ? "3147613905362928"
          : "4108254489275063",
        variables: JSON.stringify({
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            friend_requester_id: user.node.id,
            client_mutation_id: Math.random().toString()
          }
        })
      };

      try {
        const res = await api.httpPost(
          "https://www.facebook.com/api/graphql/",
          form
        );

        const data = JSON.parse(res);

        if (!data.errors) {
          success.push(
            `✅ ${isAdd ? "Accepté" : "Refusé"}: ${user.node.name}`
          );
        } else {
          failed.push(`❌ Échec: ${user.node.name}`);
        }
      } catch (e) {
        failed.push(`❌ Error: ${user.node.name}`);
      }
    }

    let msg = "";

    if (success.length) msg += success.join("\n") + "\n\n";
    if (failed.length) msg += failed.join("\n");

    api.sendMessage(msg || "❌ Rien traité", event.threadID, messageID);
  },

  // 📥 MENU
  onStart: async function ({ api, event, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name:
          "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const response = await api.httpPost(
        "https://www.facebook.com/api/graphql/",
        form
      );

      let data;
      try {
        data = JSON.parse(response);
      } catch {
        return api.sendMessage("❌ Erreur Facebook API", event.threadID);
      }

      const listRequest =
        data?.data?.viewer?.friending_possibilities?.edges || [];

      if (!listRequest.length) {
        return api.sendMessage("🌸 Aucune demande d'ami", event.threadID);
      }

      let msg = "╔═══ 💖 DEMANDES D'AMIS 💖 ═══╗\n\n";

      listRequest.forEach((u, i) => {
        msg += `💠 No. ${i + 1}\n`;
        msg += `👤 Nom: ${u.node.name}\n`;
        msg += `🆔 ID: ${u.node.id}\n`;
        msg += `🔗 Profil: ${
          u.node.url
            ? u.node.url.replace("www.facebook", "fb")
            : "Lien indisponible"
        }\n`;
        msg += "━━━━━━━━━━━━━━━━\n";
      });

      msg += "\n💡 Réponds avec:\n";
      msg += "✔ add <num> → accepter\n";
      msg += "❌ del <num> → refuser\n";
      msg += "🔥 add all → tout accepter\n";
      msg += "💔 del all → tout refuser\n\n";
      msg += "⏳ Auto delete 2 min";

      api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID,
          listRequest,
          messageID: info.messageID,
          unsendTimeout: setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 120000)
        });
      });
    } catch (e) {
      console.log(e);
      api.sendMessage("❌ Erreur chargement demandes", event.threadID);
    }
  }
};
