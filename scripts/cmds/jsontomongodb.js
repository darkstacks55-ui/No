const fs = require("fs-extra");

const OWNER_UID = "61573867120837"; // 💖 ton UID déjà intégré

module.exports = {
	config: {
		name: "jsontomongodb",
		aliases: ["jsontomongo"],
		version: "🌸 2.0 angel kawaii",
		author: "Shade ✨ Angel Edit",
		countDown: 5,
		role: 3,
		description: {
			en: "💖 Synchronise les données JSON vers MongoDB (owner only)"
		},
		category: "owner",
		guide: {
			en: "🌸 {pn} <thread | user | dashboard | global | all>"
		}
	},

	langs: {
		en: {
			unauthorized: "💔✨ Tu n’as pas la permission d’utiliser cette commande !",
			invalidDatabase: "❌ MongoDB n’est pas activé dans la config 💔",
			missingFile: "❌ Fichier manquant : %1",
			formatInvalid: "❌ Format invalide 💔",
			successThread: "🌸✨ Threads synchronisés avec succès !",
			successUser: "💖✨ Users synchronisés avec succès !",
			successDashboard: "🌸✨ Dashboard synchronisé !",
			successGlobal: "💖✨ Global data synchronisée !",
			error: "💔✨ Erreur : %1 | %2"
		}
	},

	onStart: async function ({ args, message, threadModel, userModel, dashBoardModel, globalModel, getLang, event }) {

		// 💖 LOCK ULTRA OWNER
		if (event.senderID !== OWNER_UID)
			return message.reply(getLang("unauthorized"));

		if (global.GoatBot.config.database.type !== "mongodb")
			return message.reply(getLang("invalidDatabase"));

		switch (args[0]) {
			case "thread":
				return syncThreadData(message, threadModel, getLang);

			case "user":
				return syncUserData(message, userModel, getLang);

			case "dashboard":
				return syncDashBoardData(message, dashBoardModel, getLang);

			case "global":
				return syncGlobalData(message, globalModel, getLang);

			case "all":
				await syncThreadData(message, threadModel, getLang);
				await syncUserData(message, userModel, getLang);
				await syncDashBoardData(message, dashBoardModel, getLang);
				await syncGlobalData(message, globalModel, getLang);
				return;

			default:
				return message.SyntaxError();
		}
	}
};
