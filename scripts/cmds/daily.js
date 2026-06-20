/**
 * @author Christus + Shade edit
 * @title Daily Reward System
 * @name daily
 * @class daily
 * @version 2.0.0
 * @description Récompense quotidienne avec système de série (streak), banque et multiplicateurs aléatoires.
 * @usage daily
 */

const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "2.0.0",
		author: "Christus + Shade edit",
		countDown: 5,
		role: 0,
		description: "Daily reward + bank system + streak + RNG (usersData version)",
		category: "economy"
	},

	langs: {
		fr: {
			already: "💔 Tu as déjà pris ton daily aujourd’hui !",
			jackpot: "💎 JACKPOT ! Tu as gagné un énorme bonus !!"
		}
	},

	onStart: async function ({ message, event, usersData, getLang }) {
		const { senderID } = event;
		const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");

		// Récupération sécurisée du profil utilisateur
		let user = await usersData.get(senderID);
		if (!user) user = {};
		if (!user.data) user.data = {};
		if (user.money === undefined) user.money = 0;
		if (user.exp === undefined) user.exp = 0;

		// Initialisation du sous-objet daily si inexistant
		if (!user.data.daily) {
			user.data.daily = {
				last: null,
				streak: 0
			};
		}

		// Initialisation du sous-objet bank si inexistant
		if (!user.data.bank) {
			user.data.bank = {
				wallet: 0,
				balance: 0,
				cardNumber: null,
				transactions: [],
				loan: 0
			};
		}

		// Vérification anti-spam journalier
		if (user.data.daily.last === dateTime) {
			return message.reply(getLang("already"));
		}
