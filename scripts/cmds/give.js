const { createCanvas, loadImage, registerFont } = require("canvas");  
const path = require("path");  
const fs = require("fs");  
  
module.exports.config = {  
  name: "give",  
  version: "1.0.0",  
  hasPermssion: 0,  
  author: "Shade",  
  description: "Donne de l'argent à quelqu'un avec avatars",  
  commandCategory: "économie",  
  usages: "[@tag] [montant]",  
  cooldowns: 3  
};  
  
module.exports.run = async function ({ api, event, args, Currencies, Users }) {  
  const { threadID, messageID, senderID, mentions } = event;  
  
  if (!mentions || Object.keys(mentions).length === 0)  
    return api.sendMessage("Tag la personne à qui tu veux donner 🫶", threadID, messageID);  
  
  const targetID = Object.keys(mentions)[0];  
  const amount = parseInt(args[1]);  
  if (!amount || amount <= 0) return api.sendMessage("Montant invalide", threadID, messageID);  
  
  const senderMoney = (await Currencies.getData(senderID)).money;  
  if (senderMoney < amount) return api.sendMessage("T'as pas assez de thunes", threadID, messageID);  
  
  await Currencies.decreaseMoney(senderID, amount);  
  await Currencies.increaseMoney(targetID, amount);  
  
  const senderName = await Users.getNameUser(senderID);  
  const targetName = await Users.getNameUser(targetID);  
  
  // === CANVAS AVEC AVATARS ===  
  const canvas = createCanvas(700, 300);  
  const ctx = canvas.getContext("2d");  
  
  ctx.fillStyle = "#0f0f0f";  
  ctx.fillRect(0, 0, 700, 300);  
  
  // fetch avatars  
  const senderAvatar = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);  
  const targetAvatar = await loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);  
  
  // draw avatars en rond  
  function drawCircleImg(img, x, y, r) {  
    ctx.save();  
    ctx.beginPath();  
    ctx.arc(x, y, r, 0, Math.PI * 2);  
    ctx.closePath();  
    ctx.clip();  
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2);  
    ctx.restore();  
  }  
  
  drawCircleImg(senderAvatar, 150, 150, 60);  
  drawCircleImg(targetAvatar, 550, 150, 60);  
  
  // flèche + montant  
  ctx.strokeStyle = "#00ff88";  
  ctx.lineWidth = 4;  
  ctx.beginPath();  
  ctx.moveTo(240, 150);  
  ctx.lineTo(460, 150);  
  ctx.stroke();  
  
  ctx.fillStyle = "#00ff88";  
  ctx.font = "bold 35px Arial";  
  ctx.fillText(`${amount.toLocaleString()} $`, 300, 160);  
  
  ctx.fillStyle = "#fff";  
  ctx.font = "bold 38px Arial";  
  ctx.fillText("DON", 320, 80);  
  
  ctx.fillStyle = "#ccc";  
  ctx.font = "22px Arial";  
  ctx.fillText(`${senderName} → ${targetName}`, 230, 260);  
  
  const pathSave = path.join(__dirname, "cache", `give_${senderID}_${targetID}.png`);  
  const stream = fs.createWriteStream(pathSave);  
  canvas.createPNGStream().pipe(stream);  
  
  stream.on("finish", () => {  
    api.sendMessage({  
      body: `${senderName} a donné ${amount.toLocaleString()}$ à ${targetName} 💸`,  
      attachment: fs.createReadStream(pathSave)  
    }, threadID, () => fs.unlinkSync(pathSave), messageID);  
  });  
};
