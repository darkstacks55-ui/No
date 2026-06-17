const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$", "cash"],
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Meta AI",
    description: "Balance style carte bancaire",
    commandCategory: "economy",
    usages: "/bal",
    cooldowns: 2
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;

    // 🔥 FIX ECONOMY (remplace Currencies)
    let userData = await usersData.get(senderID);

    if (!userData) {
      userData = {
        money: 1000
      };
      await usersData.set(senderID, userData);
    }

    const money = userData.money || 0;

    // pseudo name safe
    const name = senderID;

    // ranking (safe)
    const allData = await usersData.getAll();

    const sorted = Object.entries(allData || {})
      .map(([id, data]) => ({
        id,
        money: data?.money || 0
      }))
      .sort((a, b) => b.money - a.money);

    const rank = sorted.findIndex(u => u.id === senderID) + 1;

    const width = 850, height = 540;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#1a1e27";
    ctx.fillRect(100, 140, 650, 400);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 48px Arial";
    ctx.fillText(`${money.toLocaleString()} $`, 160, 350);

    ctx.font = "24px Arial";
    ctx.fillText(name.toUpperCase(), 160, 420);

    ctx.fillStyle = rank <= 3 ? "#f5c542" : "#22c55e";
    ctx.fillRect(560, 410, 140, 40);

    ctx.fillStyle = "#0b0e14";
    ctx.font = "bold 22px Arial";
    ctx.fillText(`RANK #${rank}`, 590, 435);

    const avatar = await loadImage(
      `https://graph.facebook.com/${senderID}/picture?width=256&height=256`
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(700, 320, 35, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 665, 285, 70, 70);
    ctx.restore();

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const pathSave = path.join(cacheDir, `bal_${senderID}.png`);

    fs.writeFileSync(pathSave, canvas.toBuffer("image/png"));

    return api.sendMessage(
      { attachment: fs.createReadStream(pathSave) },
      threadID,
      () => fs.unlinkSync(pathSave),
      messageID
    );
  }
};
