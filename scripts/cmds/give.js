/**
 * @author Shade & AI
 * @title Transfert d'argent Canvas
 * @name give
 * @class give
 * @version 1.1.0
 * @description Donne de l'argent de portefeuille à un autre utilisateur avec un rendu visuel.
 * @usage give [@tag/reply] [montant]
 */

const { createCanvas, loadImage } = require("canvas");  
const path = require("path");  
const fs = require("fs");  
  
module.exports = {
  config: {  
    name: "give",  
    version: "1.1.0",  
    role: 0, 
    author: "Shade & AI",  
    description: "Donne de l'argent via tag ou réponse (reply) avec génération d'image Canvas",  
    category: "economy",  
    guide: {
      fr: "{p}{n} [@tag] [montant] ou en répondant à un message : {p}{n} [montant]"
    },  
    countDown: 3  
  },

  onStart: async function ({ api, event, args, usersData, Users }) {  
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;  
    
    let targetID = null;
    let amount = null;

    // 1. Détection de la cible et extraction propre du montant numérique
    if (type === "message_reply" && messageReply) {
      targetID = messageReply.senderID;
      // Cherche le premier nombre valide présent dans les arguments
      const foundNumber = args.find(arg => !isNaN(parseInt(arg)));
      amount = foundNumber ? parseInt(foundNumber) : null;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      // Pour un tag, on prend généralement l'argument qui suit le tag textuel
      const filterArgs = args.filter(arg => !arg.includes("@"));
      const foundNumber = filterArgs.find(arg => !isNaN(parseInt(arg)));
      amount = foundNumber ? parseInt(foundNumber) : null;
    }

    // Validation des données d'entrée
    if (!targetID) {
      return api.sendMessage("❌ Tag la personne ou réponds à son message pour lui donner de l'argent 🫶", threadID, messageID);  
    }

    if (targetID === senderID) {
      return api.sendMessage("❌ L'auto-donation est bloquée par la banque centrale.", threadID, messageID);
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ Montant invalide.\nExemple : /give @nom 500\nEn réponse : /give 500", threadID, messageID);  
    }
    
    // 2. Récupération et structuration des profils financiers
    let senderData = await usersData.get(senderID) || {};
    let targetData = await usersData.get(targetID) || {};

    if (senderData.money === undefined) senderData.money = 0;
    if (targetData.money === undefined) targetData.money = 0;

    if (senderData.money < amount) {
      return api.sendMessage(`❌ Fonds insuffisants dans ton portefeuille. (Solde actuel : ${senderData.money.toLocaleString()} $)`, threadID, messageID);  
    }
    
    // 3. Débit / Crédit et mise à jour de la base de données
    senderData.money -= amount;
    targetData.money += amount;
    
    await usersData.set(senderID, { money: senderData.money, data: senderData.data || {}, exp: senderData.exp || 0 });
    await usersData.set(targetID, { money: targetData.money, data: targetData.data || {}, exp: targetData.exp || 0 });
    
    // Récupération des pseudos
    const senderName = (await Users.getNameUser(senderID)) || "Donateur Anonyme";
    const targetName = (await Users.getNameUser(targetID)) || "Bénéficiaire";
    
    // Initialisation sécurisée du dossier cache
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // === GÉNÉRATION DE L'INTERFACE CANVAS ===  
    const canvas = createCanvas(700, 300);  
    const ctx = canvas.getContext("2d");  
    
    // Fond sombre
    ctx.fillStyle = "#0f0f0f";  
    ctx.fillRect(0, 0, 700, 300);  
    
    const senderAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=256&height=256`;
    const targetAvatarUrl = `https://graph.facebook.com/${targetID}/picture?width=256&height=256`;

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
      // Fallback si l'API Facebook Graph ne renvoie pas l'image immédiatement
      ctx.fillStyle = "#262626";
      ctx.beginPath(); ctx.arc(150, 150, 60, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(550, 150, 60, 0, Math.PI * 2); ctx.fill();
    }
    
    // Ligne de liaison graphique  
    ctx.strokeStyle = "#00ff88";  
    ctx.lineWidth = 4;  
    ctx.beginPath();  
    ctx.moveTo(240, 150);  
    ctx.lineTo(460, 150);  
    ctx.stroke();  
    
    // Montant de la transaction  
    ctx.fillStyle = "#00ff88";  
    ctx.font = "bold 35px Arial";  
    ctx.textAlign = "center";
    ctx.fillText(`${amount.toLocaleString()} $`, 350, 160);  
    
    // Titre de l'opération  
    ctx.fillStyle = "#fff";  
    ctx.font = "bold 38px Arial";  
    ctx.fillText("DONATION", 350, 70);  
    
    // Libellé des acteurs impliqués  
    ctx.fillStyle = "#aaaaaa";  
    ctx.font = "20px Arial";  
    ctx.fillText(`${senderName.substring(0, 15)} → ${targetName.substring(0, 15)}`, 350, 250);  
    
    // Sauvegarde et envoi du fichier
    const pathSave = path.join(cacheDir, `give_${senderID}_${targetID}.png`);  
    fs.writeFileSync(pathSave, canvas.toBuffer("image/png"));

    return api.sendMessage({  
      body: `💸 **${senderName}** a envoyé **${amount.toLocaleString()}$** à **${targetName}** !`,  
      attachment: fs.createReadStream(pathSave)  
    }, threadID, () => {
      try { if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave); } catch (err) {}
    }, messageID);  
  }
};
