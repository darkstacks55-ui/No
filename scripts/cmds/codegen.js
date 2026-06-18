const axios = require('axios');

module.exports = {
  config: {
    name: "codegen",
    version: "1.1.1",
    author: "Shade",
    countDown: 5,
    role: 2, // Réservé aux administrateurs (Owner) du bot
    shortDescription: { en: "Génère le code d'une commande via OpenAI" },
    category: "utility",
    guide: { en: "codegen [description]" }
  },

  onStart: async function ({ message, args }) {
    const description = args.join(" ").trim();
    const botPrefix = global.GoatBot?.config?.prefix || ".";

    if (!description) {
      return message.reply(
`🤖 **AI Code Generator**

Décrivez la commande que vous souhaitez créer pour que l'IA génère le code de base.

💡 **Exemples d'utilisation :**
• \`${botPrefix}codegen crée une commande pile ou face\`
• \`${botPrefix}codegen une commande kick utilisateur\`
• \`${botPrefix}codegen afficher l'uptime du bot\`

📂 *Sauvegardez ensuite le code dans scripts/cmds/[nom].js*`
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return message.reply("❌ Erreur : La variable `OPENAI_API_KEY` n'est pas configurée dans votre fichier d'environnement (.env).");
    }

    await message.reply("🤖 Analyse de la demande et génération du code JavaScript...");

    try {
      const prompt = `
You are an expert JavaScript developer for a Facebook Messenger bot running on GoatBot framework.

Create a minimal, clean and fully working command file based on this user request: "${description}"

Strict Format Rules to follow:
- Output ONLY valid JavaScript code. Do not include markdown code blocks (\`\`\`), markdown text, or explanations.
- Use EXACTLY this modern object-export structure:
module.exports = {
  config: {
    name: "shortname",
    version: "1.0.0",
    author: "AI Generator",
    countDown: 5,
    role: 0,
    shortDescription: { en: "description here" },
    category: "other",
    guide: { en: "usage here" }
  },
  onStart: async function ({ api, event, args, message }) {
    // secure logic here
  }
};
- Ensure basic error handling inside the onStart function using try/catch blocks.
- The command name must be strictly lowercase.
`;

      const res = await axios.post(
        "[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.3, 
          max_tokens: 1500
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      let code = res.data?.choices?.[0]?.message?.content || "";

      // Nettoyage de sécurité corrigé (sans l'indicateur /e erroné)
      code = code
        .replace(/^```javascript/i, "")
        .replace(/^```js/i, "")
        .replace(/^```/i, "")
        .replace(/```$/m, "")
        .trim();

      if (!code || !code.includes("module.exports") || !code.includes("onStart")) {
        return message.reply("❌ L'IA n'a pas réussi à générer une structure de code valide. Veuillez reformuler votre description.");
      }

      return message.reply(
`✅ **Code généré avec succès !**

\`\`\`javascript
${code}
\`\`\`

💡 **Installation :**
1. Copiez ce code.
2. Créez un fichier dans \`scripts/cmds/[nom].js\`.
3. Relancez votre bot ou utilisez la commande de rechargement.`
      );

    } catch (err) {
      console.error("CODEGEN ERROR:", err?.response?.data || err.message);
      
      const errorDetails = err?.response?.data?.error?.message || err.message;
      return message.reply(`❌ Erreur API OpenAI : ${errorDetails}\nVérifiez la validité de votre clé ou vos crédits.`);
    }
  }
};
