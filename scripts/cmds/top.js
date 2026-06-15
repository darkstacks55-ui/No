const { createCanvas, loadImage } = require("canvas");  
const path = require("path");  
const fs = require("fs");  
  
module.exports.config = {  
  name: "top",  
  version: "1.0.0",  
  hasPermssion: 0,  
  author: "Shade",  
  description: "Top 10 des plus riches avec avatars",  
  commandCategory: "économie",  
  usages: "[page]",  
  cooldowns: 5  
};  
  
module.exports.run = async function ({ api, event, args, Currencies, Users, Threads }) {  
  const { threadID, messageID, senderID } = event;  
  const page = parseInt(args[0]) || 1;  
  const perPage = 5;  
  const start = (page - 1) * perPage;  
  
  // récupère tout le monde du thread  
  let data = await Currencies.getAll();  
  data = data.sort((a, b) => b.money - a.money).slice(start, start + perPage);  
  
  if (data.length === 0) return api.sendMessage("Y'a personne sur cette page", threadID, messageID);  
  
  const canvas = createCanvas(700, 600);  
  const ctx = canvas.getContext("2d");  
  
  // fond  
  ctx.fillStyle = "#0f0f0f";  
  ctx.fillRect(0, 0, 700, 600);  
  
  // titre  
  ctx.fillStyle = "#ffd700";  
  ctx.font = "bold 42px Arial";  
  ctx.fillText(`TOP RICHE - Page ${page}`, 200, 60);  
  
  // pour chaque user  
  for (let i = 0; i < data.length; i++) {  
    const u = data[i];  
    const y = 140 + i * 100;  
    const rank = start + i + 1;  
  
    const name = await Users.getNameUser(u.userID);  
    const avatar = await loadImage(`https://graph.facebook.com/${u.userID}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);  
  
    // cercle avatar  
    ctx.save();  
    ctx.beginPath();  
    ctx.arc(90, y, 40, 0, Math.PI * 2);  
    ctx.clip();  
    ctx.drawImage(avatar, 50, y - 40, 80, 80);  
    ctx.restore();  
  
    // rang  
    ctx.fillStyle = rank === 1? "#ffd700" : "#fff";  
    ctx.font = "bold 35px Arial";  
    ctx.fillText(`#${rank}`, 160, y + 5);  
  
    // nom  
    ctx.font = "28px Arial";  
    ctx.fillText(name.length > 18? name.slice(0, 18) + "..." : name, 230, y + 5);  
  
    // money  
    ctx.fillStyle = "#00ff88";  
    ctx.font = "bold 26px Arial";  
    ctx.fillText(`${u.money.toLocaleString()} $`, 230, y + 40);  
  }  
  
  // footer  
  ctx.fillStyle = "#888";  
  ctx.font = "20px Arial";  
  ctx.fillText("Reply 1-10 pour changer de page", 220, 570);  
  
  const pathSave = path.join(__dirname, "cache", `top_${threadID}_${page}.png`);  
  const stream = fs.createWriteStream(pathSave);  
  canvas.createPNGStream().pipe(stream);  
  
  stream.on("finish", () => {  
    api.sendMessage({  
      body: `Top ${start + 1}-${start + data.length} du groupe 💰\nReply 1-10 pour naviguer`,  
      attachment: fs.createReadStream(pathSave)  
    }, threadID, (err, info) => {  
      fs.unlinkSync(pathSave);  
      global.client.handleReply.push({  
        name: this.config.name,  
        messageID: info.messageID,  
        author: senderID  
      });  
    }, messageID);  
  });  
};  
  
module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {  
  const { body, senderID, threadID, messageID } = event;  
  if (senderID!== handleReply.author) return;  
  
  const page = parseInt(body);  
  if (isNaN(page) || page < 1 || page > 10)  
    return api.sendMessage("Page 1 à 10 seulement", threadID, messageID);  
  
  // relance la commande avec la nouvelle page  
  return this.run({ api, event: {...event, args: [page.toString()] }, Currencies, Users });  
};
