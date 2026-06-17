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

  onStart: async function ({ api, event, Currencies, Users }) {
    const { threadID, messageID, senderID } = event;

    const userData = await Currencies.getData(senderID);
    const money = userData.money || 0;
    const name = await Users.getNameUser(senderID);

    const allData = await Currencies.getAll();
    const sorted = allData.sort((a, b) => b.money - a.money);
    const rank = sorted.findIndex(u => u.userID === senderID) + 1;

    const width = 850, height = 540;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#1a1e27";
    ctx.roundRect(100, 140, 650, 400, 24);
    ctx.fill();

    ctx.strokeStyle = "#2d313b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#d4af37";
    ctx.roundRect(160, 190, 80, 60, 8);
    ctx.fill();

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 48px Arial";
    ctx.fillText("•••• •••• ••••", 160, 310);

    ctx.font = "bold 56px Arial";
    ctx.fillText(`${money.toLocaleString()} $`, 160, 370);

    ctx.fillStyle = "#9ca3af";
    ctx.font = "24px Arial";
    ctx.fillText(name.toUpperCase(), 160, 450);

    ctx.fillStyle = rank <= 3 ? "#f5c542" : "#22c55e";
    ctx.roundRect(560, 410, 140, 40, 12);
    ctx.fill();

    ctx.fillStyle = "#0b0e14";
    ctx.font = "bold 22px Arial";
    ctx.fillText(`RANK #${rank}`, 590, 435);

    ctx.font = "bold 42px Arial";
    ctx.fillText("💳", 660, 200);

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
