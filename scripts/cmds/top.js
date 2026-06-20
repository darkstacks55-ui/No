const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");

module.exports.config = {
	name: "top",
	version: "1.1.1",
	hasPermssion: 0,
	author: "Shade",
	description: "Top 10 des plus riches par page (10 pages max)",
	commandCategory: "economy",
	usages: "[page]",
	cooldowns: 5
};

module.exports.run = async function ({ api, event, args, usersData }) {
	try {
		const { threadID, messageID, senderID } = event;
		let page = parseInt(args[0]) || 1;
		
		// Limitation stricte entre la page 1 et 10
		if (page < 1) page = 1;
		if (page > 10) page = 10;

		const perPage = 10;
		const start = (page - 1) * perPage;

		// 📦 Récupération des données
		let data = await usersData.getAll?.();

		if (!data) return api.sendMessage("❌ usersData.getAll non disponible", threadID, messageID);

		// Filtrage, tri et découpage compatible GoatBot (u.money ou u.data.money)
		data = data
			.map(u => {
				if (!u) return null;
				
				// Détermination de la source d'argent (Priorité u.money -> u.data.money -> 0)
				let userMoney = 0;
				if (u.money !== undefined) {
					userMoney = u.money;
				} else if (u.data && u.data.money !== undefined) {
					userMoney = u.data.money;
				}

				return {
					userID: u.userID,
					money: userMoney
				};
			})
			.filter(Boolean)
			.sort((a, b) => b.money - a.money)
			.slice(start, start + perPage);

		if (data.length === 0)
			return api.sendMessage(`Y'a personne sur la page ${page}`, threadID, messageID);

		// 🎨 Dimensions du Canvas (1120px de hauteur pour 10 joueurs)
		const canvas = createCanvas(700, 1120);
		const ctx = canvas.getContext("2d");

		// BACKGROUND
		ctx.fillStyle = "#0f0f0f";
		ctx.fillRect(0, 0, 700, 1120);

		// 🏆 TITLE
		ctx.fillStyle = "#ffd700";
		ctx.font = "bold 42px Arial";
		ctx.fillText(`TOP RICHE - Page ${page}/10`, 160, 60);

		// 👥 USERS LOOP
		for (let i = 0; i < data.length; i++) {
			const u = data[i];
			const y = 140 + i * 92;
			const rank = start + i + 1;

			const name = (await usersData.getName?.(u.userID)) || "Unknown";

			let avatar;
			try {
				avatar = await loadImage(
					`https://graph.facebook.com/${u.userID}/picture?width=256&height=256`
				);
			} catch (e) {
				avatar = null;
			}

			// 🖼️ AVATAR
			if (avatar) {
				ctx.save();
				ctx.beginPath();
				ctx.arc(90, y, 35, 0, Math.PI * 2);
				ctx.clip();
				ctx.drawImage(avatar, 55, y - 35, 70, 70);
				ctx.restore();
			}

			// 🥇 RANK
			ctx.fillStyle = rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : "#ffffff";
			ctx.font = "bold 32px Arial";
			ctx.fillText(`#${rank}`, 160, y + 5);

			// 👤 NAME
			ctx.fillStyle = "#ffffff";
			ctx.font = "26px Arial";
			ctx.fillText(
				name.length > 18 ? name.slice(0, 18) + "..." : name,
				230,
				y - 5
			);

			// 💰 MONEY
			ctx.fillStyle = "#00ff88";
			ctx.font = "bold 24px Arial";
			ctx.fillText(`${(u.money || 0).toLocaleString()} $`, 230, y + 25);
		}

		// 📌 FOOTER
		ctx.fillStyle = "#888";
		ctx.font = "20px Arial";
		ctx.fillText("Réponds avec un chiffre entre 1 et 10 pour changer de page", 120, 1090);

		const pathSave = path.join(__dirname, "cache", `top_${threadID}_${page}.png`);
		const stream = fs.createWriteStream(pathSave);

		canvas.createPNGStream().pipe(stream);

		stream.on("finish", () => {
			api.sendMessage(
				{
					body: `🏆 Top ${start + 1}-${start + data.length} des plus riches 💰\nChaque page affiche 10 joueurs.`,
					attachment: fs.createReadStream(pathSave)
				},
				threadID,
				(err, info) => {
					if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
					if (err) return;
					
					global.client.handleReply.push({
						name: this.config.name,
						messageID: info.messageID,
						author: senderID
					});
				},
				messageID
			);
		});
	} catch (err) {
		console.error("TOP ERROR:", err);
		return api.sendMessage("❌ Erreur dans la commande top", event.threadID, event.messageID);
	}
};

module.exports.handleReply = async function ({ api, event, handleReply, usersData }) {
	try {
		const { body, senderID, threadID, messageID } = event;

		if (senderID !== handleReply.author) return;

		const page = parseInt(body);
		if (isNaN(page) || page < 1 || page > 10)
			return api.sendMessage("Veuillez choisir une page entre 1 et 10.", threadID, messageID);

		return this.run({
			api,
			event: { ...event, args: [page.toString()] },
			usersData
		});
	} catch (err) {
		console.error("TOP handleReply ERROR:", err);
	}
};
