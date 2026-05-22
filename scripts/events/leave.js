const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.1",
		author: "Shade",
		category: "events"
	},

	langs: {
		vi: {
			session1: "𝘀𝗮́𝗻𝗴",
			session2: "𝘁𝗿𝘂̛𝗮",
			session3: "𝗰𝗵𝗶𝗲̂̀𝘂",
			session4: "𝘁𝗼̂́𝗶",
			leaveType1: "𝘁𝘂̛̣ 𝗿𝗼̛̀𝗶",
			leaveType2: "𝗯𝗶̣ 𝗸𝗶𝗰𝗸",
			defaultLeaveMessage:
`∧＿∧
( ｡•́︿•̀｡ ) 💔
/っ💌

➜ {userName}
đã {type} khỏi nhóm...`
		},

		en: {
			session1: "𝗺𝗼𝗿𝗻𝗶𝗻𝗴",
			session2: "𝗻𝗼𝗼𝗻",
			session3: "𝗮𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻",
			session4: "𝗲𝘃𝗲𝗻𝗶𝗻𝗴",

			leaveType1: "𝗹𝗲𝗳𝘁",
			leaveType2: "𝘄𝗮𝘀 𝗸𝗶𝗰𝗸𝗲𝗱 𝗳𝗿𝗼𝗺",

			defaultLeaveMessage:
`∧＿∧
( ｡•́︿•̀｡ ) 💔
/っ💌

╭━━━〔 🌸 𝗚𝗼𝗼𝗱𝗯𝘆𝗲 🌸 〕━━━╮
➜ {userName}
➜ {type} 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽

⌚ 𝗧𝗶𝗺𝗲: {time}
🌙 𝗦𝗲𝘀𝘀𝗶𝗼𝗻: {session}
🏡 𝗚𝗿𝗼𝘂𝗽: {threadName}
╰━━━━━━━━━━━━━━━━━━╯

(｡•́︿•̀｡)
𝗔𝗻𝗴𝗲𝗹 𝘄𝗶𝗹𝗹 𝗺𝗶𝘀𝘀 𝘆𝗼𝘂...`
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {

		if (event.logMessageType == "log:unsubscribe")
			return async function () {

				const { threadID } = event;

				const threadData = await threadsData.get(threadID);

				if (!threadData.settings.sendLeaveMessage)
					return;

				const { leftParticipantFbId } = event.logMessageData;

				// bot ignore
				if (leftParticipantFbId == api.getCurrentUserID())
					return;

				const hours = getTime("HH");

				const threadName = threadData.threadName;

				const userName = await usersData.getName(leftParticipantFbId);

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

				const form = {
					mentions: leaveMessage.match(/\{userNameTag\}/g)
						? [{
								tag: userName,
								id: leftParticipantFbId
						  }]
						: null
				};

				leaveMessage = leaveMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName)

					.replace(
						/\{type\}/g,
						leftParticipantFbId == event.author
							? getLang("leaveType1")
							: getLang("leaveType2")
					)

					.replace(/\{threadName\}|\{boxName\}/g, threadName)

					.replace(/\{time\}/g, hours)

					.replace(
						/\{session\}/g,
						hours <= 10
							? getLang("session1")
							: hours <= 12
							? getLang("session2")
							: hours <= 18
							? getLang("session3")
							: getLang("session4")
					);

				form.body = leaveMessage;

				if (leaveMessage.includes("{userNameTag}")) {

					form.mentions = [{
						id: leftParticipantFbId,
						tag: userName
					}];

				}

				if (threadData.data.leaveAttachment) {

					const files = threadData.data.leaveAttachment;

					const attachments = files.reduce((acc, file) => {

						acc.push(
							drive.getFile(file, "stream")
						);

						return acc;

					}, []);

					form.attachment = (
						await Promise.allSettled(attachments)
					)

					.filter(({ status }) => status == "fulfilled")

					.map(({ value }) => value);

				}

				message.send(form);

			};
	}
};
