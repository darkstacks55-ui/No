const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "box",
    version: "2.1.0",
    role: 0,
    author: "Shade & AI",
    description: "Gestion du groupe interactive par réponses successives (Reply)",
    category: "utility",
    guide: {
      fr: "{p}{n} (Envoyez la commande seule, puis répondez aux messages du bot)"
    },
    countDown: 2
  },

  // 1. ÉTAPE 1 : Affichage du panel principal
  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const info = await api.getThreadInfo(threadID);
      const name = info.threadName || "Sans nom";
      const emoji = info.emoji || "💬";
      const members = info.participantIDs.length;
      const admins = info.adminIDs ? info.adminIDs.map(a => a.id || a) : [];
      const botID = api.getCurrentUserID();
      const botIsAdmin = admins.includes(botID);

      const menuText = `╭─────── BOX ───────
│ 📦 Groupe : ${name}
│ 😀 Emoji : ${emoji}
│ 👥 Membres : ${members}
│ 👑 Admins : ${admins.length}
│ 🤖 Bot admin : ${botIsAdmin ? "Oui" : "Non"}
├──────────────
│ ⚙️ Répondez (reply) à ce message avec un chiffre :
│
│ 1️⃣ ➔ Changer le nom du groupe
│ 2️⃣ ➔ Changer la photo du groupe
│ 3️⃣ ➔ Changer l'emoji
│ 4️⃣ ➔ Changer votre pseudo
│ 5️⃣ ➔ Activer/Désactiver l'approbation
│ 6️⃣ ➔ Afficher l'UID du groupe
│ 7️⃣ ➔ Liste des membres (UIDs)
│ 8️⃣ ➔ Infos détaillées
╰────────────────`;

      return api.sendMessage(menuText, threadID, (err, infoMessage) => {
        if (err) return;
        
        global.GoatBot.onReply.set(infoMessage.messageID, {
          commandName: this.config.name,
          messageID: infoMessage.messageID,
          author: event.senderID,
          step: 1
        });
      }, messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Une erreur est survenue lors de l'ouverture du panel.", threadID, messageID);
    }
  },

  // 2. ÉTAPES SUIVANTES : Gestion des réponses (onReply)
  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID, body, messageReply } = event;
    
    if (senderID !== Reply.author) return;

    try {
      const info = await api.getThreadInfo(threadID);
      const admins = info.adminIDs ? info.adminIDs.map(a => a.id || a) : [];
      const botID = api.getCurrentUserID();
      const botIsAdmin = admins.includes(botID);

      // --- LOGIQUE DE L'ÉTAPE 1 : Choix du menu ---
      if (Reply.step === 1) {
        const choice = body.trim();

        switch (choice) {
          case "1":
            return api.sendMessage("✍️ Répondez à ce message avec le **nouveau nom** du groupe :", threadID, (err, infoMsg) => {
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "name" });
            }, messageID);

          case "2":
            return api.sendMessage("🖼️ Répondez à ce message en y **joignant une image** pour changer la photo :", threadID, (err, infoMsg) => {
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "photo" });
            }, messageID);

          case "3":
            return api.sendMessage("🔥 Répondez à ce message avec l'**unique emoji** que vous voulez définir :", threadID, (err, infoMsg) => {
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "emoji" });
            }, messageID);

          case "4":
            return api.sendMessage("👤 Répondez à ce message avec votre **nouveau pseudo** pour ce groupe :", threadID, (err, infoMsg) => {
              global.GoatBot.onReply.set(infoMsg.messageID, { commandName: this.config.name, author: senderID, step: 2, action: "nickname" });
            }, messageID);

          case "5":
            if (!botIsAdmin) return api.sendMessage("❌ Opération refusée : Nommez d'abord le bot administrateur du groupe.", threadID, messageID);
            const newMode = !info.approvalMode;
            await api.setApprovalMode(newMode, threadID);
            api.unsendMessage(Reply.messageID);
            return api.sendMessage(`🔒 Mode Approbation : ${newMode ? "ACTIVÉ (Fermé) 🔒" : "DÉSACTIVÉ (Ouvert) 🔓"}`, threadID, messageID);

          case "6":
            api.unsendMessage(Reply.messageID);
            return api.sendMessage(`🆔 UID de ce groupe : ${threadID}`, threadID, messageID);

          case "7":
            api.unsendMessage(Reply.messageID);
            let list = "👥 Liste des UIDs des membres :\n\n";
            info.participantIDs.forEach(id => { list += `• ${id}\n`; });
            return api.sendMessage(list, threadID, messageID);

          case "8":
            api.unsendMessage(Reply.messageID);
            return api.sendMessage(`📊 [ INFOS ]\n\nNom : ${info.threadName || "Sans nom"}\nID : ${threadID}\nMembres : ${info.participantIDs.length}`, threadID, messageID);

          default:
            return api.sendMessage("⚠️ Chiffre invalide. Veuillez répondre avec un nombre entre 1 et 8.", threadID, messageID);
        }
      }

      // --- LOGIQUE DE L'ÉTAPE 2 : Application des changements ---
      if (Reply.step === 2) {
        const input = body.trim();

        // Action 1 : Modification du nom
        if (Reply.action === "name") {
          if (!input) return api.sendMessage("❌ Nom invalide.", threadID, messageID);
          if (!botIsAdmin) return api.sendMessage("❌ Impossible de changer le nom : Le bot doit être Administrateur du groupe.", threadID, messageID);
          
          await api.setTitle(input, threadID);
          api.unsendMessage(Reply.messageID);
          return api.sendMessage(`✅ Le nom du groupe a été modifié en : "${input}"`, threadID, messageID);
        }

        // Action 2 : Modification de la photo
        if (Reply.action === "photo") {
          const imgUrl = event.attachments?.[0]?.url || messageReply?.attachments?.[0]?.url;
          if (!imgUrl) return api.sendMessage("❌ Vous devez ajouter ou répondre à une image pour effectuer ce changement !", threadID, messageID);
          if (!botIsAdmin) return api.sendMessage("❌ Impossible de changer la photo : Le bot doit être Administrateur du groupe.", threadID, messageID);

          api.unsendMessage(Reply.messageID);
          const tempPath = path.join(__dirname, "cache", `box_avatar_${threadID}.png`);
          
          // Création du dossier cache si manquant
          if (!fs.existsSync(path.join(__dirname, "cache"))) {
            fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
          }

          // Téléchargement local temporaire pour contourner les blocages d'URL Facebook
          const response = await axios({ url: imgUrl, responseType: "stream" });
          const writer = fs.createWriteStream(tempPath);
          response.data.pipe(writer);

          writer.on("finish", async () => {
            try {
              await api.changeGroupImage(fs.createReadStream(tempPath), threadID);
              if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
              return api.sendMessage("✅ La photo du groupe a été mise à jour avec succès !", threadID, messageID);
            } catch (err) {
              if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
              return api.sendMessage("❌ Échec du changement de photo. Assurez-vous que je sois bien Admin.", threadID, messageID);
            }
          });
          return;
        }

        // Action 3 : Modification de l'emoji
        if (Reply.action === "emoji") {
          if (!input) return api.sendMessage("❌ Emoji invalide.", threadID, messageID);
          await api.changeThreadEmoji(input, threadID);
          api.unsendMessage(Reply.messageID);
          return api.sendMessage(`✅ L'emoji du groupe a été changé pour : ${input}`, threadID, messageID);
        }

        // Action 4 : Modification du pseudo
        if (Reply.action === "nickname") {
          if (!input) return api.sendMessage("❌ Pseudo invalide.", threadID, messageID);
          await api.changeNickname(input, senderID, threadID);
          api.unsendMessage(Reply.messageID);
          return api.sendMessage(`✅ Votre pseudo a été configuré sur : "${input}"`, threadID, messageID);
        }
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Échec de l'opération. Veuillez vérifier mes permissions (Avez-vous nommé le bot Administrateur ?).", threadID, messageID);
    }
  }
};
