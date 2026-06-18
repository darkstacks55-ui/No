const { createCanvas, loadImage } = require("canvas");  
const path = require("path");  
const fs = require("fs");  
  
module.exports = {
  config: {  
    name: "give",  
    version: "1.0.3",  
    role: 0, 
    author: "Shade & AI",  
    description: "Donne de l'argent via tag ou réponse (reply) avec génération d'image",  
    category: "économie",  
    guide: {
      fr: "{p}{n} [@tag] [montant] ou en répondant à un message : {p}{n} [montant]"
    },  
    countDown: 3  
  },

  onStart: async function ({ api, event, args, usersData, Users }) {  
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;  
    
    let targetID = null;
    let amount = null;

    // 1. Détection de la cible et du montant (soit par Reply, soit par Tag)
    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      amount = parseInt(args[1]);
    }

    // Si aucune cible n'est trouvée
    if (!targetID) {
      return api.sendMessage("❌ Tag la personne ou répond à son message pour lui donner 🫶", threadID, messageID);  
    }

    // Auto-don interdit
    if (targetID === senderID) {
      return api.sendMessage("❌ Vous ne pouvez pas vous donner de l'argent à vous-même.", threadID, messageID);
    }

    // Vérification du montant
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ Montant invalide. Exemple: /give @nom 500 ou en répondant à un message: /give 500", threadID, messageID);  
    }
    
    // 2. Récupération et vérification de l'argent via usersData (Standard GoatBot)
    const senderData = await usersData.get(senderID);
    const targetData = await usersData.get(targetID);

    if (!senderData) return api.sendMessage("❌ Impossible de charger vos données financières.", threadID, messageID);
    if (!targetData) return api.sendMessage("❌ Impossible de charger les données financières de la cible.", threadID, messageID);

    // Initialisation de la propriété money si elle n'existe pas
    if (senderData.money === undefined) senderData.money = 0;
    if (targetData.money === undefined) targetData.money = 0;

    if (senderData.money < amount) {
      return api.sendMessage(`❌ T'as pas assez de thunes (Solde actuel : ${senderData.money} $)`, threadID, messageID);  
    }
    
    // 3. Transfert d'argent et sauvegarde
    senderData.money -= amount;
    targetData.money += amount;
    
    await usersData.set(senderID, senderData);
    await usersData.set(targetID, targetData);
    
    const senderName = await Users.getNameUser(senderID);
    const targetName = await Users.getNameUser(targetID);
    
    // Dossier cache
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // === CANVAS AVEC AVATARS ===  
    const canvas = createCanvas(700, 300);  
    const ctx = canvas.getContext("2d");  
    
    ctx.fillStyle = "#0f0f0f";  
    ctx.fillRect(0, 0, 700, 300);  
    
    const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const targetAvatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    try {
      const senderAvatar = await loadImage(senderAvatarUrl);  
      const targetAvatar = await loadImage(targetAvatarUrl);  
      
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
    } catch (e) {
      ctx.fillStyle = "#333";
      ctx.beginPath(); ctx.arc(150, 150, 60, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(550, 150, 60, 0, Math.PI*2); ctx.fill();
    }
    
    // Flèche + montant  
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
    
    const pathSave = path.join(cacheDir, `give_${senderID}_${targetID}.png`);  
    const stream = fs.createWriteStream(pathSave);  
    canvas.createPNGStream().pipe(stream);  
    
    stream.on("finish", () => {  
      api.sendMessage({  
        body: `${senderName} a donné ${amount.toLocaleString()}$ à ${targetName} 💸`,  
        attachment: fs.createReadStream(pathSave)  
      }, threadID, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      }, messageID);  
    });  
  }
};
