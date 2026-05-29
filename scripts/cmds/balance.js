const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 💖 Format argent
const formatMoney = (amount) => {
  if (isNaN(amount)) return "0$";
  amount = Number(amount);
  const scales = [
    { value: 1e15, suffix: 'Q' },
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];
  const scale = scales.find(s => amount >= s.value);
  if (scale) return `${(amount / scale.value).toFixed(1)}${scale.suffix}$`;
  return `${amount.toLocaleString()}$`;
};

// 🌸 Avatar safe FIX
const fetchAvatar = async (userID) => {
  try {
    const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return await loadImage(Buffer.from(res.data));
  } catch {
    const c = createCanvas(100, 100);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffb6ff";
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♡", 50, 50);
    return c;
  }
};

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "$", "cash"],
    version: "🌸 6.1 ANGEL FIX",
    author: "Shade x Angel",
    countDown: 3,
    role: 0,
    description: "💖 Angel balance card FIXED",
    category: "economy",
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply } = event;

    // 💸 TRANSFER FIX
    if (args[0]?.toLowerCase() === "t") {
      const targetID = Object.keys(mentions)[0] || messageReply?.senderID;
      const amount = parseInt(args.find(a => !isNaN(a)));

      if (!targetID || !amount)
        return message.reply("🌸 Utilisation : bal t @user montant");

      const sender = await usersData.get(senderID);
      const receiver = await usersData.get(targetID);

      if (!sender || !receiver)
        return message.reply("💔 Utilisateur introuvable");

      const tax = Math.ceil(amount * 0.05);
      const total = amount + tax;

      const senderMoney = sender.money || 0;
      const receiverMoney = receiver.money || 0;

      if (senderMoney < total)
        return message.reply("💸 Pas assez d'argent mon ange...");

      await usersData.set(senderID, {
        ...sender,
        money: senderMoney - total
      });

      await usersData.set(targetID, {
        ...receiver,
        money: receiverMoney + amount
      });

      return message.reply(
        `🌸 ✦ Transfert Angel réussi ✦ 🌸\n\n` +
        `💌 Vers : ${receiver.name || "User"}\n` +
        `💰 Montant : ${formatMoney(amount)}\n` +
        `🍥 Taxe : ${formatMoney(tax)}\n` +
        `💎 Total : ${formatMoney(total)}`
      );
    }

    // 💖 BALANCE CARD FIX
    const targetID =
      Object.keys(mentions)[0] ||
      messageReply?.senderID ||
      senderID;

    const userData = await usersData.get(targetID);
    if (!userData)
      return message.reply("💔 Utilisateur introuvable");

    const name = userData.name || "Unknown";
    const money = userData.money || 0;

    const avatar = await fetchAvatar(targetID);

    const canvas = createCanvas(720, 380);
    const ctx = canvas.getContext("2d");

    // 🌈 Background
    const grad = ctx.createLinearGradient(0, 0, 720, 380);
    grad.addColorStop(0, "#ffb6ff");
    grad.addColorStop(0.5, "#cdb4ff");
    grad.addColorStop(1, "#bde0fe");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 380);

    // 💖 Card
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(30, 30, 660, 320);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 660, 320);

    // 🌸 Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 190, 55, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 65, 135, 110, 110);
    ctx.restore();

    // 💎 Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🌸 Angel Balance Card 🌸", 360, 70);

    // 👤 Name
    ctx.textAlign = "left";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`💖 ${name}`, 220, 170);

    // 🆔 ID
    ctx.font = "20px Arial";
    ctx.fillText(`🆔 ${targetID}`, 220, 210);

    // 💰 Money
    ctx.font = "bold 42px Arial";
    ctx.fillText(`💎 ${formatMoney(money)}`, 220, 280);

    // 💾 save safe
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const file = path.join(tmpDir, `angel_balance_${targetID}.png`);
    fs.writeFileSync(file, canvas.toBuffer("image/png"));

    return message.reply({
      body: "🌸💖 Angel Balance Card 💖🌸",
      attachment: fs.createReadStream(file)
    }, () => fs.unlinkSync(file));
  }
};
