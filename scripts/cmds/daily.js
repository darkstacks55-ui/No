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

		// 🔥 SYSTÈME DE SÉRIE (STREAK)
		const yesterday = moment.tz("Asia/Ho_Chi_Minh").subtract(1, "days").format("DD/MM/YYYY");

		if (user.data.daily.last === yesterday) {
			user.data.daily.streak += 1;
		} else {
			user.data.daily.streak = 1;
		}

		// 📈 CALCUL DES RÉCOMPENSES DE BASE
		const baseCoin = 100;
		const baseExp = 10;

		const multiplier = 1 + (user.data.daily.streak * 0.2);

		let coin = Math.floor(baseCoin * multiplier);
		let exp = Math.floor(baseExp * multiplier);

		// 🎰 SYSTÈME DE BONUS ALÉATOIRES (RNG)
		let bonusText = "Aucun";
		const rand = Math.random();

		if (rand < 0.05) {
			coin *= 5;
			bonusText = "💎 JACKPOT x5";
			message.reply(getLang("jackpot"));
		} else if (rand < 0.15) {
			coin *= 2;
			bonusText = "🔥 x2 Bonus";
		} else if (rand < 0.25) {
			exp *= 2;
			bonusText = "✨ XP Boost";
		}

		// 💣 FACTEUR DE RISQUE (Petite malchance)
		if (Math.random() < 0.03) {
			coin = Math.floor(coin * 0.5);
			bonusText = "💣 Malchance (-50%)";
		}

		// Mettre à jour les valeurs de l'utilisateur
		user.money += coin;
		user.exp += exp;

		// Liaison avec le module bancaire interne
		user.data.bank.wallet = user.money;
		user.data.daily.last = dateTime;

		// Sauvegarde définitive des données modifiées
		await usersData.set(senderID, {
			money: user.money,
			exp: user.exp,
			data: user.data
		});

		// Envoi de la facture finale de transaction
		return message.reply(
			`💖 DAILY SYSTEM PRO\n━━━━━━━━━━━━━━\n` +
			`💰 +${coin.toLocaleString()} coins\n` +
			`✨ +${exp.toLocaleString()} XP\n` +
			`🔥 Streak: x${user.data.daily.streak}\n` +
			`🎁 Bonus: ${bonusText}\n` +
			`🏦 Bank Wallet: $${user.money.toLocaleString()}\n` +
			`━━━━━━━━━━━━━━`
		);
	}
};
