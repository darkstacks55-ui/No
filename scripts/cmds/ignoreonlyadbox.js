const OWNER_UID = "61573867120837";

module.exports = {
	config: {
		name: "ignoreonlyadbox",
		aliases: ["ignoreadboxonly", "ignoreadminboxonly", "ignbox"],
		version: "✨ 2.0 angel kawaii",
		author: "Shade ✨ Angel Edit",
		countDown: 5,
		role: 0,
		shortDescription: "🌸 Ignore commands per group (adminOnly bypass)",
		category: "security",
		description: {
			en: "Manage commands that bypass adminOnly mode per group 💫"
		},
		guide: {
			en:
				"🌸 {pn} add <command>\n" +
				"❌ {pn} del <command>\n" +
				"📜 {pn} list"
		}
	},

	langs: {
		en: {
			denied: "❌✨ Access denied... only owner can use this 💔",
			missingAdd: "🌸✨ Please enter a command to add 💔",
			missingDel: "💔✨ Please enter a command to remove",
			notFound: "❌✨ Command \"%1\" not found",
			already: "💖✨ \"%1\" is already in the angel list",
			added: "🌸✨ Command \"%1\" is now allowed in this group 💖",
			notIn: "💔✨ \"%1\" is not in the list",
			removed: "🧹✨ Command \"%1\" removed from angel list 💖",
			list: "🌸✨ IGNORE LIST (this group):\n\n%1",
			empty: "🌸✨ Empty list 💔"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {

		// 💖 OWNER LOCK
		if (event.senderID !== OWNER_UID) {
			return message.reply(getLang("denied"));
		}

		try {
			const threadID = event.threadID;

			// 💾 SAFE LOAD
			let ignoreList = await threadsData.get(
				threadID,
				"data.ignoreCommanToOnlyAdminBox",
				[]
			);

			const action = args[0];

			// ➕ ADD
			if (action === "add") {

				if (!args[1])
					return message.reply(getLang("missingAdd"));

				const cmd = args[1].toLowerCase();
				const command = global.GoatBot.commands.get(cmd);

				if (!command)
					return message.reply(getLang("notFound", cmd));

				if (ignoreList.includes(cmd))
					return message.reply(getLang("already", cmd));

				ignoreList.push(cmd);

				await threadsData.set(
					threadID,
					ignoreList,
					"data.ignoreCommanToOnlyAdminBox"
				);

				return message.reply(getLang("added", cmd));
			}

			// ❌ REMOVE
			if (action === "del" || action === "remove" || action === "rm") {

				if (!args[1])
					return message.reply(getLang("missingDel"));

				const cmd = args[1].toLowerCase();
				const command = global.GoatBot.commands.get(cmd);

				if (!command)
					return message.reply(getLang("notFound", cmd));

				if (!ignoreList.includes(cmd))
					return message.reply(getLang("notIn", cmd));

				ignoreList.splice(ignoreList.indexOf(cmd), 1);

				await threadsData.set(
					threadID,
					ignoreList,
					"data.ignoreCommanToOnlyAdminBox"
				);

				return message.reply(getLang("removed", cmd));
			}

			// 📜 LIST
			if (action === "list") {

				if (!ignoreList || ignoreList.length === 0)
					return message.reply(getLang("empty"));

				return message.reply(
					getLang(
						"list",
						ignoreList.map(c => "✨ " + c).join("\n")
					)
				);
			}

			return message.SyntaxError();

		} catch (e) {
			console.error(e);
			return message.reply("💔✨ Angel system error...");
		}
	}
};
