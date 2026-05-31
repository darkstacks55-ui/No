module.exports = {
	config: {
		name: "grouptag",
		aliases: ["grtag"],
		version: "1.5 angel kawaii ✨💖",
		author: "Shade ✨ Angel Edit",
		countDown: 5,
		role: 0,
		description: {
			vi: "Tag thành viên theo nhóm",
			en: "Tag members by group"
		},
		category: "group"
	},

	langs: {
		en: {
			noGroupTagName: "💔 Please enter a group name",
			noMention: "⚠️ You must tag members first",
			addedSuccess2: "✨ Group tag \"%1\" created with:\n%2",
			infoGroupTag: "📦 Angel Group Info ✨\n\n🏷️ Name: %1\n👥 Members: %2\n\n👤 List:\n%3"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const { threadID, mentions } = event;

		const groupTags = await threadsData.get(threadID, "data.groupTags", []);

		switch (args[0]) {

			// 💖 ADD GROUP
			case "add": {
				const mentionsID = Object.keys(event.mentions);
				const content = (args.slice(1) || []).join(" ");

				if (!mentionsID.length)
					return message.reply(getLang("noMention"));

				const groupTagName = content.slice(
					0,
					content.indexOf(event.mentions[mentionsID[0]]) - 1
				).trim();

				if (!groupTagName)
					return message.reply(getLang("noGroupTagName"));

				const oldGroupTag = groupTags.find(t =>
					t.name.toLowerCase() === groupTagName.toLowerCase()
				);

				if (oldGroupTag) {
					for (const uid in mentions) {
						oldGroupTag.users[uid] = mentions[uid];
					}
					await threadsData.set(threadID, groupTags, "data.groupTags");

					return message.reply("✨ Members added to existing group 💖");
				}

				const newGroupTag = {
					name: groupTagName,
					users: mentions
				};

				groupTags.push(newGroupTag);
				await threadsData.set(threadID, groupTags, "data.groupTags");

				return message.reply(
					getLang(
						"addedSuccess2",
						groupTagName,
						Object.values(mentions).join("\n")
					)
				);
			}

			// 💖 LIST + INFO
			case "info":
			case "list":
			case "all": {
				const groupTagName = args.slice(1).join(" ");

				if (!groupTagName) {
					const msg = groupTags.length
						? groupTags.map(g => `✨ ${g.name} (${Object.keys(g.users).length})`).join("\n")
						: "💔 No group tags found";
					return message.reply(msg);
				}

				const groupTag = groupTags.find(t =>
					t.name.toLowerCase() === groupTagName.toLowerCase()
				);

				if (!groupTag)
					return message.reply("💔 Group not found");

				return message.reply(
					getLang(
						"infoGroupTag",
						groupTag.name,
						Object.keys(groupTag.users).length,
						Object.values(groupTag.users).join("\n")
					)
				);
			}

			// 💖 REMOVE
			case "remove": {
				const groupTagName = (args.slice(1) || []).join(" ");

				const index = groupTags.findIndex(t =>
					t.name.toLowerCase() === groupTagName.toLowerCase()
				);

				if (index === -1)
					return message.reply("💔 Group not found");

				groupTags.splice(index, 1);
				await threadsData.set(threadID, groupTags, "data.groupTags");

				return message.reply("🗑️ Group deleted ✨");
			}

			// 💖 TAG
			default: {
				const groupTagName = args.join(" ");

				const groupTag = groupTags.find(t =>
					t.name.toLowerCase() === groupTagName.toLowerCase()
				);

				if (!groupTag)
					return message.reply("💔 Group not found");

				const mentionsArr = [];
				let text = "";

				for (const uid in groupTag.users) {
					text += `✨ ${groupTag.users[uid]}\n`;
					mentionsArr.push({
						id: uid,
						tag: groupTag.users[uid]
					});
				}

				return message.reply({
					body: `💖 Angel Tag: ${groupTag.name}\n\n${text}`,
					mentions: mentionsArr
				});
			}
		}
	}
};
