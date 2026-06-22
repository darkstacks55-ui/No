module.exports = {
  config: {
    name: "set",
    version: "2.2.0",
    author: "Shade & AI",
    shortDescription: "Gestion des données admin avec support Reply",
    longDescription: "Définir l'argent, l'expérience ou des variables personnalisées d'un utilisateur par tag, reply ou sur soi-même.",
    category: "settings",
    guide: {
      fr: "En réponse ou sur soi-même :\n{p}set money [montant]\nPar tag :\n{p}set money [montant] [@utilisateur]"
    },
    role: 2 // Niveau Admin requis par le système
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      // Liste des UID des Admins suprêmes autorisés
      const ADMIN_UIDS = ["61573867120837"];
      
      if (!ADMIN_UIDS.includes(event.senderID.toString())) {
        return api.sendMessage("⛔ Accès refusé : privilèges admin requis", event.threadID);
      }

      const action = args[0]?.toLowerCase();
      if (!action) {
        return api.sendMessage("❌ Action manquante. Options : money, exp, custom", event.threadID);
      }

      // --- LOGIQUE DE DÉTECTION DE LA CIBLE (Reply > Tag > Soi-même) ---
      let targetID = event.senderID;
      
      if (event.type === "message_reply" && event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
      
      // Récupération sécurisée des données actuelles pour éviter de les écraser
      let userData = await usersData.get(targetID);
      if (!userData) userData = {};
      if (!userData.data) userData.data = {};

      const name = (await usersData.getName?.(targetID)) || "Utilisateur";

      switch (action) {
        case 'money': {
          const amount = parseFloat(args[1]);
          if (isNaN(amount)) return api.sendMessage("❌ Montant invalide", event.threadID);
          
          // Sauvegarde en préservant le reste de l'objet
          await usersData.set(targetID, {
            ...userData,
            money: amount
          });
          return api.sendMessage(`💰 Argent défini à ${amount.toLocaleString()} $ pour ${name}`, event.threadID);
        }

        case 'exp': {
          const amount = parseInt(args[1]);
          if (isNaN(amount)) return api.sendMessage("❌ Montant invalide", event.threadID);
          
          await usersData.set(targetID, {
            ...userData,
            exp: amount
          });
          return api.sendMessage(`🌟 Expérience définie à ${amount.toLocaleString()} pour ${name}`, event.threadID);
        }

        case 'custom': {
          const variable = args[1];
          const value = args[2];
          if (!variable || value === undefined) {
            return api.sendMessage("❌ Utilisation : {p}set custom [variable] [valeur]", event.threadID);
          }
          
          // Modifie ou ajoute la variable dans l'objet "data" de l'utilisateur
          userData.data[variable] = value;

          await usersData.set(targetID, {
            ...userData,
            data: userData.data
          });
          return api.sendMessage(`🔧 Variable "${variable}" définie à "${value}" pour ${name}`, event.threadID);
        }

        default:
          return api.sendMessage("❌ Action invalide. Options disponibles : money, exp, custom", event.threadID);
      }

    } catch (error) {
      console.error("Erreur Admin Set :", error);
      return api.sendMessage("⚠️ Commande échouée : " + error.message, event.threadID);
    }
  }
};
