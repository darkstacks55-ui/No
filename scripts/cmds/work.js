/**
 * @author Shade + Edit Fun
 * @title Advanced Work System
 * @name work
 * @class work
 * @version 2.0.0
 * @description Gagne de l'argent avec des jobs insolites et des événements aléatoires !
 * @usage work
 */

module.exports = {
  config: {
    name: "work",
    version: "2.0.0",
    author: "Shade + Edit",
    countDown: 10,
    role: 0,
    description: "💼 Earn money by working with random events",
    category: "economy"
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;

    // Liste de jobs fun et originaux
    const jobs = [
      { text: "tu as hacké le frigo connecté d'un milliardaire 💻🤖", min: 200, max: 800 },
      { text: "tu as vendu des captures d'écran de tes victoires sur Valorant en NFT 🎨🎮", min: 150, max: 600 },
      { text: "tu as servi de garde du corps à un canard influenceur ultra riche 🦆💰", min: 500, max: 1300 },
      { text: "tu as livré des pizzas en urgence pendant une apocalypse zombie virtuelle 📦🦁", min: 100, max: 450 },
      { text: "tu as streamé pendant 24h en faisant semblant d'être un PNJ de GTA 📺🤡", min: 120, max: 750 },
      { text: "tu as retrouvé les clés de la clé USB Crypto perdue d'un pote 💎🔑", min: 300, max: 1600 },
      { text: "tu as été payé pour tester des lits de luxe toute la journée 🛌✨", min: 250, max: 900 },
      { text: "tu as vendu l'eau de ton bain à des fans chelous sur internet 🧼💦", min: 400, max: 1100 }
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    let reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    // Récupération sécurisée pour ne pas écraser les autres données (exp, data, etc.)
    let user = await usersData.get(senderID);
    if (!user) user = {};
    if (user.money === undefined) user.money = 0;

    // 🎲 SYSTÈME D'ÉVÉNEMENTS ALÉATOIRES (FUN)
    let eventText = "Travail standard accompli avec succès. 👍";
    const randEvent = Math.random();

    if (randEvent < 0.10) { 
      // 🔥 RÉUSSITE CRITIQUE (10% de chance)
      reward *= 2;
      eventText = "🔥 **RÉUSSITE CRITIQUE !** Ton patron t'adore, tu as reçu une prime de 100% ! 🚀";
    } else if (randEvent < 0.20) { 
      // 💣 ÉCHEC CUISSANT (10% de chance)
      reward = Math.floor(reward * 0.15);
      eventText = "💣 **ÉCHEC CUISANT...** Tu as fait une gaffe monumentale, tu as été payé des miettes ! 😭";
    } else if (randEvent < 0.30) {
      // 🌟 BONUS DE POURBOIRE (10% de chance)
      const tip = 150;
      reward += tip;
      eventText = `🌟 **Pourboire !** Un client généreux t'a laissé +$${tip} en cachette ! 👀`;
    }

    // Ajout de la récompense
    user.money += reward;

    // Sauvegarde propre
    await usersData.set(senderID, {
      money: user.money,
      exp: user.exp || 0,
      data: user.data || {}
    });

    return message.reply(
      `💼 𝗪𝗢𝗥𝗞 𝗥𝗘𝗦𝗨𝗟𝗧 💖\n━━━━━━━━━━━━━━\n` +
      `✨ En faisant ton job : ${job.text}\n\n` +
      `📢 **Événement :** ${eventText}\n` +
      `💰 **Salaire reçu :** +$${reward.toLocaleString()}\n` +
      `━━━━━━━━━━━━━━\n` +
      `🏦 Ton portefeuille contient désormais : $${user.money.toLocaleString()}`
    );
  }
};
