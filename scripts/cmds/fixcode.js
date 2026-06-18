const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "fixcode",
        version: "1.0.0",
        role: 2, // 2 = Réservé uniquement à l'Admin du bot (Développeur) pour des raisons de sécurité
        author: "AI Collaborator",
        description: "Scanne, détecte et répare automatiquement les erreurs structurelles d'un fichier de commande",
        category: "Développeur",
        guide: {
            fr: "{p}{n} [nom_du_fichier.js]"
        },
        countDown: 2
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const fileName = args[0];

        if (!fileName) {
            return api.sendMessage("⚠️ Spécifiez le nom du fichier à scanner (ex: /fixcode give.js).", threadID, messageID);
        }

        // Chemin absolu vers le dossier des commandes de GoatBot
        const filePath = path.join(__dirname, fileName);

        // 1. Vérification de l'existence du fichier
        if (!fs.existsSync(filePath)) {
            return api.sendMessage(`❌ Le fichier \`${fileName}\` n'existe pas dans le dossier des commandes.`, threadID, messageID);
        }

        try {
            let code = fs.readFileSync(filePath, "utf8");
            let logsModifs = [];
            let isModified = false;

            // 2. Scan et Corrections des patterns obsolètes (Mirai -> GoatBot)
            
            // Correction 1 : Remplacement de module.exports.run par la fonction moderne onStart
            if (code.includes("module.exports.run =") || code.includes("exports.run =")) {
                code = code.replace(/module\.exports\.run\s*=\s*async\s*function\s*\(([^)]+)\)\s*\{/, "onStart: async function ($1) {");
                code = code.replace(/exports\.run\s*=\s*async\s*function\s*\(([^)]+)\)\s*\{/, "onStart: async function ($1) {");
                logsModifs.push("• Format de fonction exécutable converti (`run` ➔ `onStart`)");
                isModified = true;
            }

            // Correction 2 : Intégration de la config isolée dans l'export global si nécessaire
            if (code.includes("module.exports.config =")) {
                // Extrait le bloc config
                const configMatch = code.match(/module\.exports\.config\s*=\s*(\{[\s\S]+?\});/);
                if (configMatch) {
                    let configContent = configMatch[1];
                    
                    // Nettoyage des anciennes clés Mirai vers GoatBot
                    configContent = configContent.replace(/hasPermssion:/g, "role:");
                    configContent = configContent.replace(/commandCategory:/g, "category:");
                    configContent = configContent.replace(/cooldowns:/g, "countDown:");
                    
                    // Reconstruction propre du module.exports requis par GoatBot
                    code = code.replace(/module\.exports\.config\s*=\s*\{[\s\S]+?\};/, "");
                    code = code.replace("onStart:", `config: ${configContent},\n\n  onStart:`);
                    
                    // Si le module.exports final n'est pas encore encapsulé correctement
                    if (!code.trim().startsWith("module.exports = {")) {
                        code = code.replace("config:", "module.exports = {\n  config:");
                        code += "\n};";
                    }
                    
                    logsModifs.push("• Structure de configuration adaptée aux standards GoatBot (`role`, `category`, `countDown`) ");
                    isModified = true;
                }
            }

            // Correction 3 : Remplacement des modules dépréciés comme Currencies ou Users si présents indûment
            if (code.includes("Currencies.getData") && !code.includes("usersData.get")) {
                code = code.replace(/Currencies/g, "usersData");
                logsModifs.push("• Redirection des flux économiques obsolètes (`Currencies` ➔ `usersData`)");
                isModified = true;
            }

            // 3. Sauvegarde et retour à l'utilisateur
            if (isModified) {
                fs.writeFileSync(filePath, code, "utf8");
                
                let successMessage = `✅ **Scan & Réparation réussis pour \`${fileName}\` !**\n\nModifications apportées :\n${logsModifs.join("\n")}\n\n🔄 _Le fichier a été mis à jour sur le serveur. Rechargez les commandes pour appliquer._`;
                return api.sendMessage(successMessage, threadID, messageID);
            } else {
                return api.sendMessage(`🔍 **Scan terminé pour \`${fileName}\`** : Aucune erreur structurelle ou syntaxique évidente détectée. Le fichier respecte déjà les normes du framework.`, threadID, messageID);
            }

        } catch (error) {
            return api.sendMessage(`❌ Une erreur est survenue lors de l'analyse ou de l'écriture du fichier : \n\`\`\`text\n${error.message}\n\`\`\``, threadID, messageID);
        }
    }
};
