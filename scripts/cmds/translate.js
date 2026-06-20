const axios = require('axios');
const defaultEmojiTranslate = "🌐✨";

module.exports = {
	config: {
		name: "translate",
		aliases: ["trans", "angeltrans"],
		version: "2.0",
		author: "NTKhang ✨ | Angel Kawaii & Fixed by Shade 💖",
		countDown: 5,
		role: 0,
		description: {
			en: "🌸 Translate text with Angel kawaii magic",
			vi: "🌸 Dịch văn bản phong cách dễ thương"
		},
		category: "utility",
		guide: {
			en:
				"🌸 Reply + {pn} <lang> → translate replied message\n" +
				"💖 {pn} <lang> <text> → translate normal text\n" +
				"🌐 reaction mode available",
			vi:
				"🌸 Reply + {pn} <ngôn ngữ> → dịch tin nhắn được trả lời\n" +
				"💖 {pn} <ngôn ngữ> <văn bản> → dịch văn bản thường"
		}
	},

	langs: {
		en: {
			translateTo: "🌸✨ Angel translate from %1 → %2",
			invalidArgument: "💔✨ Invalid command, choose on/off please",
			turnOnTransWhenReaction: `🌸💖 Auto translate ON ✨\nReact "${defaultEmojiTranslate}" to translate message`,
			turnOffTransWhenReaction: "💔 Auto translate OFF",
			inputEmoji: "🌸💫 React to set your magical emoji",
			emojiSet: "💖 Emoji set to %1 ✨"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, commandName }) {

		// 🌸 reaction settings
		if (["-r", "-react", "-reaction"].includes(args[0])) {
			if (args[1] == "set") {
				return message.reply("🌸💫 React to choose your magic emoji ✨", (err, info) =>
					global.GoatBot.onReaction.set(info.messageID, {
						type: "setEmoji",
						commandName,
						messageID: info.messageID,
						authorID: event.senderID
					})
				);
			}

			const isEnable = args[1] == "on" ? true : args[1] == "off" ? false : null;
			if (isEnable == null)
				return message.reply("💔✨ Invalid option");

			await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");

			return message.reply(
				isEnable
					? "🌸✨ Auto translate activated 💖"
					: "💔 Angel translate disabled"
			);
		}

		let content;
		let langCodeTrans;
		const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

		// 💖 CASE 1 : REPLY MODE (/translate fr)
		if (event.messageReply) {
			content = event.messageReply.body;
			// Si un argument est donné (ex: fr, en), c'est la langue cible, sinon langue du thread
			langCodeTrans = args[0] ? args[0].toLowerCase() : langOfThread;
		}

		// 🌸 CASE 2 : NORMAL MODE (/translate fr [ton message])
		else {
			if (args.length < 1) {
				return message.reply("🌸💔 Usage: /translate [lang] [text] ou Répondre à un message avec /translate [lang]");
			}
			
			// Le premier argument est la langue (ex: fr, en, es)
			langCodeTrans = args[0].toLowerCase();
			// Le reste correspond au texte à traduire
			content = args.slice(1).join(" ");

			// Sécurité si l'utilisateur oublie de mettre le code langue (/translate Bonjour)
			if (langCodeTrans.length > 3 || !content) {
				content = args.join(" ");
				langCodeTrans = langOfThread;
			}
		}

		if (!content)
			return message.reply("🌸💔 Please enter text to translate");

		translateAndSendMessage(content, langCodeTrans, message, getLang);
	},

	onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
		const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌐✨";

		if (event.reaction == emojiTrans) {
			const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
			const content = Reaction.body;

			Reaction.delete();

			translateAndSendMessage(content, langCodeTrans, message, getLang);
		}
	}
};

// 🌸 translate engine
async function translate(text, langCode) {
	try {
		const res = await axios.get(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`
		);

		return {
			text: res.data[0].map(i => i[0]).join(''),
			lang: res.data[2]
		};
	} catch (error) {
		throw new Error("Erreur avec l'API Google Translate");
	}
}

// 💖 send angel message
async function translateAndSendMessage(content, langCodeTrans, message, getLang) {
	try {
		const { text, lang } = await translate(content.trim(), langCodeTrans.trim());
		return message.reply(
			`🌸💖 ${text}\n\n✨ ${getLang("translateTo", lang, langCodeTrans)} 💫`
		);
	} catch (err) {
		return message.reply("💔 Impossible de traduire ce texte pour le moment.");
	}
}
