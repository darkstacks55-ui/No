module.exports = {
	config: {
		name: "kick",
		version: "1.4",
		author: "Shade ✨ Angel Edit",
		role: 2,
		category: "admin",
		description: {
			en: "🌸 Angel kick avec système de confirmation"
		}
	},

	langs: {
		en: {
			onlyOwner: "🌸 Désolé… seul mon créateur peut utiliser cette commande.",
			needAdmin: "🌸 J’ai besoin des droits admin pour faire ça…",
			noTarget: "🌸 Tag ou réponds à une personne s’il te plaît…",
			confirm: "🌸 Es-tu sûr de vouloir retirer %1 ?\n\nRéponds OUI ou NON 💫",
			cancel: "🌸 Action annulée 💖",
			success: "🌸 %1 a été retiré doucement du groupe 💫"
		}
	},

	onStart: async function ({ message, event, api, getLang }) {
		const OWNER_UID = "61573867120837";

		// 🔒 OWNER ONLY
		if (event.senderID !== OWNER_UID)
			return message.reply(getLang("onlyOwner"));

		// 🤖 CHECK ADMIN BOT
		const threadInfo = await api.getThreadInfo(event.threadID);
		const botID = api.getCurrentUserID();

		if (!threadInfo.adminIDs.some(a => a.id === botID))
			return message.reply(getLang("needAdmin"));

		// 👤 TARGET
		let targetID =
			Object.keys(event.mentions || {})[0] ||
			event.messageReply?.senderID;

		if (!targetID)
			return message.reply(getLang("noTarget"));

		const name = event.mentions?.[targetID] || "cette personne";

		// ⏳ réaction chargement
		api.setMessageReaction("⏳", event.messageID, () => {}, true);

		// 💖 demande confirmation
		return message.reply(getLang("confirm", name), (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName: "kick",
				author: event.senderID,
				targetID
			});
		});
	},

	onReply: async function ({ event, api, message, Reply, getLang }) {
		if (event.senderID !== Reply.author) return;

		const answer = event.body.toLowerCase();

		if (answer !== "oui" && answer !== "non") {
			return message.reply("🌸 Réponds uniquement par OUI ou NON 💫");
		}

		// ❌ cancel
		if (answer === "non") {
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			return message.reply(getLang("cancel"));
		}

		// ✅ confirm kick
		try {
			api.setMessageReaction("⏳", event.messageID, () => {}, true);

			await api.removeUserFromGroup(
				Reply.targetID,
				event.threadID
			);

			api.setMessageReaction("✅", event.messageID, () => {}, true);

			return message.reply(
				getLang("success", Reply.targetID)
			);

		} catch (e) {
			return message.reply("🌸 Oups… impossible de retirer cette personne.");
		}
	}
};
