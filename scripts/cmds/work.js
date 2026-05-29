module.exports = {
  config: {
    name: "work",
    version: "1.0",
    author: "Shade",
    countDown: 10,
    role: 0,
    description: "💼 Earn money by working",
    category: "economy"
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;

    const jobs = [
      { text: "worked as a 💻 hacker angel", min: 200, max: 800 },
      { text: "sold digital art 🎨", min: 150, max: 600 },
      { text: "helped a billionaire 🏦", min: 500, max: 1200 },
      { text: "delivered packages 📦", min: 100, max: 400 },
      { text: "streamed games 🎮", min: 120, max: 700 },
      { text: "found crypto profit 💎", min: 300, max: 1500 }
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    const user = await usersData.get(senderID);

    user.money += reward;

    await usersData.set(senderID, {
      money: user.money
    });

    return message.reply(
      `💼 𝗪𝗢𝗥𝗞 𝗥𝗘𝗦𝗨𝗟𝗧 💖\n━━━━━━━━━━━━━━\n` +
      `✨ ${job.text}\n` +
      `💰 Earned: $${reward}\n` +
      `━━━━━━━━━━━━━━\n` +
      `🏦 Balance updated successfully`
    );
  }
};
