const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "setcat",
    aliases: ["setcategory", "movecmd"],
    version: "1.0.0",
    role: 2, // 2 = Uniquement le développeur principal
    author: "AI Collaborator",
    description: "Modifie dynamiquement la catégorie d'une commande dans son fichier source",
    category: "owner",
    guide: {
      fr: "{p}{n} [nom_fichier.js] > [Nouvelle Catégorie]"
    },
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // Joindre tous les arguments pour pouvoir gérer les espaces
    const input = args.join(" ");

    // Vérifier la présence du séparateur ">"
    if (!input.includes(">")) {
      return api.sendMessage("⚠️ Format incorrect.\n💡 Exemple d'utilisation :\n`!setcategory ai.js > Ia`", threadID, messageID);
    }

    // Séparation du nom du fichier et de la nouvelle catégorie
    const parts = input.split(">");
    const fileName = parts[0].trim();
    const newCategory = parts[1].trim();

    if (!fileName || !newCategory) {
      return api.sendMessage("⚠️ Le nom du fichier ou la catégorie ne peut pas être vide.", threadID, messageID);
    }

    // Définir le chemin vers le dossier des commandes (à adapter selon la structure de votre bot)
    // Par défaut dans GoatBot, les commandes sont dans le dossier actuel ou un sous-dossier 'commands'
    let filePath = path.join(__dirname, fileName);

    // Si le fichier n'est pas trouvé directement, on cherche dans le sous-dossier parent au cas où
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, "..", "commands", fileName);
    }

    // Si le fichier n'existe toujours pas
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ Le fichier \`${fileName}\` est introuvable. Vérifiez l'orthographe (n'oubliez pas le \`.js\`).`, threadID, messageID);
    }

    try {
      // Lecture du contenu du fichier
      let fileContent = fs.readFileSync(filePath, "utf8");

      // Expression régulière pour cibler la ligne category: "..." ou category: '...'
      const categoryRegex = /(category\s*:\s*["'])([^"']*)(["'])/;

      if (!categoryRegex.test(fileContent)) {
        return api.sendMessage(`❌ Impossible de trouver la propriété \`category\` dans le fichier \`${fileName}\`.`, threadID, messageID);
      }

      // Remplacement de l'ancienne catégorie par la nouvelle
      const updatedContent = fileContent.replace(categoryRegex, `$1${newCategory}$3`);

      // Écriture des modifications dans le fichier
      fs.writeFileSync(filePath, updatedContent, "utf8");

      // Message de succès incitant à recharger les commandes pour appliquer les changements
      return api.sendMessage(`✅ **Modification effectuée !**\n📄 Fichier : \`${fileName}\`\n📁 Nouvelle catégorie : \`${newCategory}\`\n\n🔄 Faites \`!load\` ou redémarrez le bot pour actualiser le menu help.`, threadID, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Une erreur est survenue lors de la modification du fichier.", threadID, messageID);
    }
  }
};
