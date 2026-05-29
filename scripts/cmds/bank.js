module.exports = {
  config: {
    name: "bank",
    aliases: ["balbank"],
    version: "1.0",
    author: "Shade ✕ Angel",
    countDown: 5,
    role: 0,
    description: {
      en: "Angel Banking System"
    },
    category: "economy"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions } = event;

    let userData = await usersData.get(senderID);

    if (!userData.data)
      userData.data = {};

    if (!userData.data.bank) {
      userData.data.bank = {
        wallet: userData.money || 0,
        bank: 0,
        savings: 0,
        vault: 0,
        loan: 0,
        streak: 1,
        premium: false,
        gambling: 0,
        trading: 1,
        investing: 2,
        business: 2,
        achievements: 2,
        lastDaily: 0,
        lastWork: 0,
        history: []
      };

      await usersData.set(senderID, userData.data, "data");
    }

    const bankData = userData.data.bank;

    const formatMoney = (amount) => {
      return Number(amount).toLocaleString();
    };

    const addHistory = async (text) => {
      bankData.history.unshift(text);

      if (bankData.history.length > 10)
        bankData.history.pop();

      await usersData.set(senderID, userData.data, "data");
    };

    const action = (args[0] || "").toLowerCase();

    switch (action) {

      // ================= HELP =================

      case "help": {
        return message.reply(`🏦 ❲ 𝗕𝗮𝗻𝗸𝗶𝗻𝗴 𝗦𝘆𝘀𝘁𝗲𝗺 ❳ 🏦
━━━━━━━━━━━━━━━
🏦 𝗕𝗔𝗡𝗞𝗜𝗡𝗚 𝗦𝗬𝗦𝗧𝗘𝗠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 𝗕𝗔𝗦𝗜𝗖 𝗕𝗔𝗡𝗞𝗜𝗡𝗚
• bank balance — Financial dashboard
• bank deposit <amount>
• bank withdraw <amount>
• bank transfer @user <amount>
• bank loan <amount>
• bank repay <amount>
• bank history
• bank daily
• bank work

📈 𝗜𝗡𝗩𝗘𝗦𝗧𝗠𝗘𝗡𝗧𝗦
• bank stocks
• bank crypto
• bank market

🎰 𝗚𝗔𝗠𝗘𝗦
• bank gamble <amount>
• bank slots <amount>

⭐ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠
• bank premium
• bank leaderboard
━━━━━━━━ ✕ ━━━━━━━━`);
      }

      // ================= DASHBOARD =================

      case "":
      case "balance":
      case "bal": {

        const totalLiquid =
          bankData.wallet +
          bankData.bank +
          bankData.savings +
          bankData.vault;

        const totalAssets =
          5000000 +
          50000000 +
          100000000;

        const netWorth = totalLiquid + totalAssets;

        return message.reply(
`🏦 ❲ 𝗕𝗮𝗻𝗸𝗶𝗻𝗴 𝗦𝘆𝘀𝘁𝗲𝗺 ❳ 🏦
━━━━━━━━━━━━━━━
💳 𝗙𝗜𝗡𝗔𝗡𝗖𝗜𝗔𝗟 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗 👑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 𝗕𝗶𝗹𝗹𝗶𝗼𝗻𝗮𝗶𝗿𝗲 · Level 1 · ${bankData.premium ? "Premium" : "Free"}

💰 𝗟𝗜𝗤𝗨𝗜𝗗 𝗔𝗦𝗦𝗘𝗧𝗦
💵 Wallet: $${formatMoney(bankData.wallet)}
🏦 Bank: $${formatMoney(bankData.bank)}
🏛️ Savings: $${formatMoney(bankData.savings)}
🔐 Vault: $${formatMoney(bankData.vault)}
└ Total Liquid: $${formatMoney(totalLiquid)}

📊 𝗔𝗦𝗦𝗘𝗧 𝗣𝗢𝗥𝗧𝗙𝗢𝗟𝗜𝗢
📈 Investments: $21,640
🏠 Real Estate: $5,000,000
🏢 Businesses: $50,000,000
🚗 Vehicles: $3,300,000
💎 Luxury: $100,000,000
└ Total Assets: $${formatMoney(totalAssets)}

🏆 𝗪𝗘𝗔𝗟𝗧𝗛 𝗦𝗨𝗠𝗠𝗔𝗥𝗬
💎 Net Worth: $${formatMoney(netWorth)}
🟢 Credit: 750/850
🎯 Max Loan: $750,000
⚡ Multiplier: ${bankData.premium ? "2x" : "1x"}

📈 𝗦𝗧𝗔𝗧𝗦
🔥 Streak: ${bankData.streak} days
🏆 Achievements: ${bankData.achievements}
💸 Active Loan: ${bankData.loan > 0 ? "$" + formatMoney(bankData.loan) : "None ✅"}
🎰 Gambling: ${bankData.gambling}
📊 Trading: ${bankData.trading}
🏢 Business: ${bankData.business}
📈 Investing: ${bankData.investing}
━━━━━━━ ✕ ━━━━━━`
        );
      }

      // ================= DEPOSIT =================

      case "deposit": {
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0)
          return message.reply("❌ Invalid amount");

        if (bankData.wallet < amount)
          return message.reply("❌ Not enough wallet money");

        bankData.wallet -= amount;
        bankData.bank += amount;

        await usersData.set(senderID, userData.data, "data");

        await addHistory(`➕ Deposited $${formatMoney(amount)}`);

        return message.reply(`✅ Deposited $${formatMoney(amount)} to your bank.`);
      }

      // ================= WITHDRAW =================

      case "withdraw": {
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0)
          return message.reply("❌ Invalid amount");

        if (bankData.bank < amount)
          return message.reply("❌ Not enough bank balance");

        bankData.bank -= amount;
        bankData.wallet += amount;

        await usersData.set(senderID, userData.data, "data");

        await addHistory(`➖ Withdraw $${formatMoney(amount)}`);

        return message.reply(`✅ Withdrawn $${formatMoney(amount)} from your bank.`);
      }

      // ================= TRANSFER =================

      case "transfer": {
        const targetID = Object.keys(mentions)[0];
        const amount = parseInt(args[2]);

        if (!targetID)
          return message.reply("❌ Mention a user");

        if (!amount || amount <= 0)
          return message.reply("❌ Invalid amount");

        if (bankData.bank < amount)
          return message.reply("❌ Not enough money in bank");

        let targetData = await usersData.get(targetID);

        if (!targetData.data)
          targetData.data = {};

        if (!targetData.data.bank) {
          targetData.data.bank = {
            wallet: targetData.money || 0,
            bank: 0,
            savings: 0,
            vault: 0,
            loan: 0,
            streak: 1,
            premium: false,
            gambling: 0,
            trading: 1,
            investing: 1,
            business: 1,
            achievements: 1,
            lastDaily: 0,
            lastWork: 0,
            history: []
          };
        }

        bankData.bank -= amount;
        targetData.data.bank.bank += amount;

        await usersData.set(senderID, userData.data, "data");
        await usersData.set(targetID, targetData.data, "data");

        return message.reply(`💸 Sent $${formatMoney(amount)} successfully.`);
      }

      // ================= DAILY =================

      case "daily": {
        const now = Date.now();

        if (now - bankData.lastDaily < 86400000) {
          const left = Math.floor((86400000 - (now - bankData.lastDaily)) / 3600000);
          return message.reply(`⏳ Come back in ${left}h`);
        }

        const reward = 5000;

        bankData.wallet += reward;
        bankData.lastDaily = now;

        await usersData.set(senderID, userData.data, "data");

        await addHistory(`🎁 Daily reward $${formatMoney(reward)}`);

        return message.reply(`🎁 You received $${formatMoney(reward)}`);
      }

      // ================= WORK =================

      case "work": {
        const now = Date.now();

        if (now - bankData.lastWork < 14400000) {
          const left = Math.floor((14400000 - (now - bankData.lastWork)) / 3600000);
          return message.reply(`⏳ Work cooldown: ${left}h`);
        }

        const reward = Math.floor(Math.random() * 9000) + 1000;

        bankData.wallet += reward;
        bankData.lastWork = now;

        await usersData.set(senderID, userData.data, "data");

        await addHistory(`💼 Worked and earned $${formatMoney(reward)}`);

        return message.reply(`💼 You worked and earned $${formatMoney(reward)}`);
      }

      // ================= LOAN =================

      case "loan": {
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0)
          return message.reply("❌ Invalid amount");

        if (bankData.loan > 0)
          return message.reply("❌ Repay your current loan first");

        const total = Math.floor(amount * 1.1);

        bankData.bank += amount;
        bankData.loan = total;

        await usersData.set(senderID, userData.data, "data");

        return message.reply(
`🏦 Loan approved
💰 Received: $${formatMoney(amount)}
📈 Repay: $${formatMoney(total)}`
        );
      }

      // ================= REPAY =================

      case "repay": {
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0)
          return message.reply("❌ Invalid amount");

        if (bankData.loan <= 0)
          return message.reply("✅ No active loan");

        if (bankData.bank < amount)
          return message.reply("❌ Not enough bank money");

        bankData.bank -= amount;
        bankData.loan -= amount;

        if (bankData.loan < 0)
          bankData.loan = 0;

        await usersData.set(senderID, userData.data, "data");

        return message.reply(`✅ Loan repaid: $${formatMoney(amount)}`);
      }

      // ================= HISTORY =================

      case "history": {
        if (bankData.history.length <= 0)
          return message.reply("📜 No transaction history.");

        return message.reply(
`📜 BANK HISTORY
━━━━━━━━━━━━━━
${bankData.history.join("\n")}`
        );
      }

      default:
        return message.reply("❌ Unknown banking command\nUse: bank help");
    }
  }
};
