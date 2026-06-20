const axios = require("axios");

// Initialisation de la mémoire du jeu si elle n'existe pas
if (!global.narutoStormSessions) {
  global.narutoStormSessions = new Map();
}

// 📋 LISTE DES 58 PERSONNAGES DE NARUTO (avec taux de chakra de base fixe pour le coup de grâce)
const CHARACTERS = [
  { id: 1, name: "Naruto Uzumaki (Mode Baryon)", chakraBase: 100 },
  { id: 2, name: "Sasuke Uchiha (Rinnegan)", chakraBase: 95 },
  { id: 3, name: "Madara Uchiha (Rikudo)", chakraBase: 99 },
  { id: 4, name: "Hashirama Senju", chakraBase: 98 },
  { id: 5, name: "Minato Namikaze", chakraBase: 92 },
  { id: 6, name: "Itachi Uchiha", chakraBase: 88 },
  { id: 7, name: "Kakashi Hatake (Double Mangekyo)", chakraBase: 90 },
  { id: 8, name: "Obito Uchiha", chakraBase: 94 },
  { id: 9, name: "Jiraiya", chakraBase: 85 },
  { id: 10, name: "Tsunade", chakraBase: 87 },
  { id: 11, name: "Orochimaru", chakraBase: 89 },
  { id: 12, name: "Nagato (Pain)", chakraBase: 96 },
  { id: 13, name: "Konan", chakraBase: 80 },
  { id: 14, name: "Gaara", chakraBase: 91 },
  { id: 15, name: "Killer Bee", chakraBase: 93 },
  { id: 16, name: "Might Guy (8 Portes)", chakraBase: 97 },
  { id: 17, name: "Rock Lee", chakraBase: 78 },
  { id: 18, name: "Neji Hyuga", chakraBase: 82 },
  { id: 19, name: "Tenten", chakraBase: 65 },
  { id: 20, name: "Shikamaru Nara", chakraBase: 75 },
  { id: 21, name: "Choji Akimichi", chakraBase: 80 },
  { id: 22, name: "Ino Yamanaka", chakraBase: 72 },
  { id: 23, name: "Kiba Inuzuka", chakraBase: 74 },
  { id: 24, name: "Shino Aburame", chakraBase: 79 },
  { id: 25, name: "Hinata Hyuga", chakraBase: 81 },
  { id: 26, name: "Sakura Haruno", chakraBase: 86 },
  { id: 27, name: "Sai", chakraBase: 78 },
  { id: 28, name: "Yamato", chakraBase: 83 },
  { id: 29, name: "Danzo Shimura", chakraBase: 85 },
  { id: 30, name: "Sarutobi Hiruzen", chakraBase: 88 },
  { id: 31, name: "Tobirama Senju", chakraBase: 93 },
  { id: 32, name: "Kabuto Yakushi (Mode Ermite)", chakraBase: 91 },
  { id: 33, name: "Kimimaro", chakraBase: 80 },
  { id: 34, name: "Haku", chakraBase: 76 },
  { id: 35, name: "Zabuza Momochi", chakraBase: 82 },
  { id: 36, name: "Deidara", chakraBase: 84 },
  { id: 37, name: "Sasori", chakraBase: 86 },
  { id: 38, name: "Hidan", chakraBase: 80 },
  { id: 39, name: "Kakuzu", chakraBase: 89 },
  { id: 40, name: "Kisame Hoshigaki", chakraBase: 95 },
  { id: 41, name: "Suigetsu Hozuki", chakraBase: 77 },
  { id: 42, name: "Karin Uzumaki", chakraBase: 84 },
  { id: 43, name: "Jugo", chakraBase: 81 },
  { id: 44, name: "Kaguya Otsutsuki", chakraBase: 99 },
  { id: 45, name: "Hagoromo Otsutsuki", chakraBase: 99 },
  { id: 46, name: "Indra Otsutsuki", chakraBase: 96 },
  { id: 47, name: "Asura Otsutsuki", chakraBase: 97 },
  { id: 48, name: "Boruto Uzumaki (Momoshiki)", chakraBase: 90 },
  { id: 49, name: "Kawaki", chakraBase: 88 },
  { id: 50, name: "Sarada Uchiha", chakraBase: 80 },
  { id: 51, name: "Mitsuki (Mode Ermite)", chakraBase: 87 },
  { id: 52, name: "Shinki", chakraBase: 82 },
  { id: 53, name: "Darui", chakraBase: 85 },
  { id: 54, name: "Chojuro", chakraBase: 80 },
  { id: 55, name: "Kurotsuchi", chakraBase: 81 },
  { id: 56, name: "Asuma Sarutobi", chakraBase: 80 },
  { id: 57, name: "Kurenai Yuhi", chakraBase: 78 },
  { id: 58, name: "Konohamaru Sarutobi", chakraBase: 79 }
];

module.exports = {
  config: {
    name: "naruto-storm",
    aliases: ["narutostorm", "ns"],
    version: "1.0",
    author: "Shade × ChatGPT",
    role: 0,
    category: "game",
    shortDescription: "Jeu de combat épique au tour par tour Naruto Storm"
  },

  onStart: async function ({ message, event }) {
    const { threadID } = event;

    if (global.narutoStormSessions.has(threadID)) {
      return message.reply("⚠️ Une partie ou une inscription est déjà en cours dans ce groupe. Terminez-la d'abord !");
    }

    // Création de la session initiale
    global.narutoStormSessions.set(threadID, {
      step: "WAITING_START",
      p1: null,
      p2: null,
      p1Char: null,
      p2Char: null,
      gameState: null
    });

    // Image horizontale style couverture Naruto
    const bannerUrl = "https://i.imgur.com/vHwW67K.jpeg"; 

    try {
      const stream = await global.utils.getStreamFromURL(bannerUrl);
      return message.reply({
        body: "🥷 ═══ 𝗡𝗔𝗥𝗨𝗧𝗢 𝗦𝗧𝗢𝗥𝗠 ═══ 🥷\n\nPréparez-vous au combat ultime de Ninjas !\n\n👉 **Répondez (reply) à ce message en écrivant \"start\" pour lancer les inscriptions !**",
        attachment: stream
      });
    } catch (err) {
      return message.reply("🥷 **NARUTO STORM**\n\n👉 **Répondez (reply) à ce message en écrivant \"start\" pour lancer les inscriptions !**");
    }
  },

  onChat: async function ({ message, event, usersData }) {
    const { threadID, senderID, body, messageReply } = event;
    if (!body || !global.narutoStormSessions.has(threadID)) return;

    const session = global.narutoStormSessions.get(threadID);
    const input = body.trim();

    // --------------------------------------------------------
    // ÉTAPE 1 : START (Attente du mot clé "start" en réponse)
    // --------------------------------------------------------
    if (session.step === "WAITING_START" && messageReply && input.toLowerCase() === "start") {
      session.step = "WAITING_P1";
      return message.reply("📢 **INSCRIPTIONS OUVERTES !**\n\nJoueur 1, répondez à ce message en écrivant **p1** pour prendre votre place.");
    }

    // --------------------------------------------------------
    // ÉTAPE 2 : Inscription du Joueur 1
    // --------------------------------------------------------
    if (session.step === "WAITING_P1" && input.toLowerCase() === "p1") {
      session.p1 = senderID;
      session.step = "WAITING_P2";
      return message.reply("✅ Joueur 1 enregistré ! 🥷\n\nMaintenant, une autre personne doit répondre à ce message en tapant **p2** pour s'inscrire !");
    }

    // --------------------------------------------------------
    // ÉTAPE 3 : Inscription du Joueur 2
    // --------------------------------------------------------
    if (session.step === "WAITING_P2" && input.toLowerCase() === "p2") {
      if (senderID === session.p1) {
        return message.reply("❌ Vous êtes déjà le Joueur 1 ! Quelqu'un d'autre doit rejoindre la partie.");
      }
      session.p2 = senderID;
      session.step = "P1_SELECTING";

      // Envoi de la liste des 58 personnages
      let charListMsg = "📜 ═══ 𝗦𝗘𝗟𝗘𝗖𝗧𝗜𝗢𝗡 𝗗𝗨 𝗡𝗜𝗡𝗝𝗔 ═══ 📜\n\nVoici la liste des combattants disponibles et leur taux de chakra :\n\n";
      CHARACTERS.forEach(c => {
        charListMsg += `${c.id}. ${c.name} (Chakra Base : ${c.chakraBase})\n`;
      });

      const p1Data = await usersData.get(session.p1);
      const p1Name = p1Data ? p1Data.name : "Joueur 1";

      charListMsg += `\n👤 @${p1Name} (Joueur 1), répondez (reply) avec le **numéro** de votre choix !`;
      
      return message.reply({ body: charListMsg, mentions: [{ tag: `@${p1Name}`, id: session.p1 }] });
    }

    // --------------------------------------------------------
    // ÉTAPE 4 : Sélection du personnage par le Joueur 1
    // --------------------------------------------------------
    if (session.step === "P1_SELECTING" && senderID === session.p1) {
      const choice = parseInt(input);
      const selected = CHARACTERS.find(c => c.id === choice);
      if (!selected) return message.reply("⚠️ Veuillez entrer un numéro de personnage valide (1 à 58).");

      session.p1Char = selected;
      session.step = "P2_SELECTING";

      const p2Data = await usersData.get(session.p2);
      const p2Name = p2Data ? p2Data.name : "Joueur 2";

      return message.reply({
        body: `✅ Joueur 1 a choisi : **${selected.name}** !\n\n👤 @${p2Name} (Joueur 2), c'est votre tour ! Répondez avec le numéro de votre personnage.`,
        mentions: [{ tag: `@${p2Name}`, id: session.p2 }]
      });
    }

    // --------------------------------------------------------
    // ÉTAPE 5 : Sélection du personnage par le Joueur 2
    // --------------------------------------------------------
    if (session.step === "P2_SELECTING" && senderID === session.p2) {
      const choice = parseInt(input);
      const selected = CHARACTERS.find(c => c.id === choice);
      if (!selected) return message.reply("⚠️ Veuillez entrer un numéro de personnage valide (1 à 58).");

      if (selected.id === session.p1Char.id) {
        return message.reply("❌ Personnage déjà choisi par le Joueur 1 ! Veuillez prendre un autre Ninja.");
      }

      session.p2Char = selected;
      session.step = "FIGHTING";

      // Initialisation de l'arène de combat
      session.gameState = {
        turn: session.p1, // P1 commence toujours
        p1HP: 100,
        p1Chakra: 100,
        p2HP: 100,
        p2Chakra: 100,
        p1Protect: false,
        p2Protect: false
      };

      return sendFightStatus(message, session, usersData, "⚔️ Le combat légendaire commence ! ⚔️");
    }

    // --------------------------------------------------------
    // ÉTAPE 6 : LOGIQUE DU COMBAT AU TOUR PAR TOUR
    // --------------------------------------------------------
    if (session.step === "FIGHTING") {
      // Sécurité : n'accepter que le joueur dont c'est le tour
      if (senderID !== session.gameState.turn) {
        if (senderID === session.p1 || senderID === session.p2) {
          return message.reply("⏳ Ce n'est pas encore votre tour, attendez votre adversaire !");
        }
        return; // Ignorer les spectateurs
      }

      const action = input.toUpperCase();
      if (!["A", "B", "C", "D", "E"].includes(action)) return; // Ignorer les textes randoms durant le combat

      let state = session.gameState;
      let isP1 = (senderID === session.p1);
      
      let userChar = isP1 ? session.p1Char : session.p2Char;
      let targetChar = isP1 ? session.p2Char : session.p1Char;

      let userChakra = isP1 ? state.p1Chakra : state.p2Chakra;
      let targetHP = isP1 ? state.p2HP : state.p1HP;
      let targetProtected = isP1 ? state.p2Protect : state.p1Protect;

      let actionReport = "";

      // Réinitialisation de la protection de l'utilisateur au début de son tour
      if (isP1) state.p1Protect = false; else state.p2Protect = false;

      // --- CHOIX A : ATTAQUE BASIQUE ---
      if (action === "A") {
        if (userChakra < 15) {
          actionReport = `💨 **${userChar.name}** tente une attaque basique mais n'a plus assez de chakra ! L'attaque rate lamentablement !`;
        } else {
          let damage = targetProtected ? 5 : 10;
          userChakra -= 15;
          targetHP -= damage;
          actionReport = `💥 **${userChar.name}** lance une attaque basique ! \n↳ Effet : -${damage} HP chez l'adversaire | -15 Chakra chez vous.${targetProtected ? " (Défense adverse activée)" : ""}`;
        }
      }

      // --- CHOIX B : TECHNIQUE SECRÈTE ---
      else if (action === "B") {
        if (userChakra < 25) {
          actionReport = `💨 **${userChar.name}** tente sa Technique Secrète mais manque de chakra ! Le Jutsu échoue !`;
        } else {
          let damage = targetProtected ? 12 : 25;
          userChakra -= 25;
          targetHP -= damage;
          actionReport = `🔥 **${userChar.name}** déchaîne sa **TECHNIQUE SECRÈTE** ! \n↳ Effet : -${damage} HP chez l'adversaire | -25 Chakra chez vous.${targetProtected ? " (Défense adverse activée)" : ""}`;
        }
      }

      // --- CHOIX C : PROTECTION ---
      else if (action === "C") {
        if (isP1) state.p1Protect = true; else state.p2Protect = true;
        actionReport = `🛡️ **${userChar.name}** se met en position de garde ! Les dégâts de la prochaine attaque ennemie seront réduits de moitié !`;
      }

      // --- CHOIX D : RECHARGE CHAKRA ---
      else if (action === "D") {
        userChakra = Math.min(100, userChakra + 35);
        actionReport = `🛐 **${userChar.name}** malaxe son chakra et concentre son énergie !\n↳ Effet : +35% de Chakra accumulé.`;
      }

      // --- CHOIX E : COUP DE GRÂCE ---
      else if (action === "E") {
        if (userChakra < 50) {
          actionReport = `💨 **${userChar.name}** tente un Coup de Grâce mais est trop épuisé (-50 Chakra requis) ! L'action échoue !`;
        } else {
          userChakra -= 50;
          // Taux de réussite : 60% de base, monte à 80% si le chakra de base du personnage >= 90
          let successChance = (userChar.chakraBase >= 90) ? 0.80 : 0.60;
          
          if (Math.random() <= successChance) {
            let damage = targetProtected ? 18 : 35;
            targetHP -= damage;
            actionReport = `⚡ **COUP DE GRÂCE RÉUSSI !!!** **${userChar.name}** porte un coup fatal dévastateur !\n↳ Effet : -${damage} HP chez l'adversaire !`;
          } else {
            actionReport = `❌ **COUP DE GRÂCE ÉCHOUÉ !** **${userChar.name}** a raté son assaut lourd, l'adversaire a esquivé à temps !`;
          }
        }
      }

      // Application des modifications des statistiques
      if (isP1) {
        state.p1Chakra = userChakra;
        state.p2HP = targetHP;
      } else {
        state.p2Chakra = userChakra;
        state.p1HP = targetHP;
      }

      // Vérification des conditions de victoire
      if (state.p1HP <= 0 || state.p2HP <= 0) {
        let winnerID = state.p1HP <= 0 ? session.p2 : session.p1;
        let winnerChar = state.p1HP <= 0 ? session.p2Char : session.p1Char;
        
        const winnerData = await usersData.get(winnerID);
        const currentMoney = winnerData.money || 0;
        
        // 💰 RECOMPENSE REUSE : AJOUT DE LA SOMME ENORME DANS LE PORTEFEUILLE
        const reward = 1000000000000; 
        winnerData.money = currentMoney + reward;
        await usersData.set(winnerID, winnerData);

        const winnerName = winnerData ? winnerData.name : "Ninja Vainqueur";
        
        global.narutoStormSessions.delete(threadID); // Fin de la session
        return message.reply(`🏆 ════ 𝗙𝗜𝗡 𝗗𝗨 𝗖𝗢𝗠𝗕𝗔𝗧 ════ 🏆\n\n💀 **${state.p1HP <= 0 ? session.p1Char.name : session.p2Char.name}** est K.O. !\n\n🎉 Félicitations à @${winnerName} qui remporte le combat avec **${winnerChar.name}** !\n💵 Récompense légendaire : **+1 000 000 000 000$** ont été versés dans votre portefeuille !`, { mentions: [{ tag: `@${winnerName}`, id: winnerID }] });
      }

      // Changement de tour
      state.turn = isP1 ? session.p2 : session.p1;
      return sendFightStatus(message, session, usersData, actionReport);
    }
  }
};

// Fonction formatée d'envoi du statut de combat en cours
async function sendFightStatus(message, session, usersData, roundReport) {
  const state = session.gameState;
  
  const p1Data = await usersData.get(session.p1);
  const p2Data = await usersData.get(session.p2);
  
  const p1Name = p1Data ? p1Data.name : "Joueur 1";
  const p2Name = p2Data ? p2Data.name : "Joueur 2";
  
  const currentTurnID = state.turn;
  const currentTurnName = (currentTurnID === session.p1) ? p1Name : p2Name;
  const currentTurnChar = (currentTurnID === session.p1) ? session.p1Char.name : session.p2Char.name;

  let panelMsg = `⚡ ═══ 𝗡𝗔𝗥𝗨𝗧𝗢 𝗦𝗧𝗢𝗥𝗠 : 𝗔𝗥𝗘𝗡𝗘 ═══ ⚡\n\n`;
  panelMsg += `📢 **Dernière action :**\n${roundReport}\n\n`;
  panelMsg += `🟥 **[P1] ${session.p1Char.name}** (@${p1Name}) :\n↳ ❤️ HP : ${Math.max(0, state.p1HP)}% | 🌀 Chakra : ${state.p1Chakra}%\n\n`;
  panelMsg += `🟦 **[P2] ${session.p2Char.name}** (@${p2Name}) :\n↳ ❤️ HP : ${Math.max(0, state.p2HP)}% | 🌀 Chakra : ${state.p2Chakra}%\n\n`;
  panelMsg += `⚔️ ══════════════════════ ⚔️\n`;
  panelMsg += `👉 À ton tour de jouer @${currentTurnName} (${currentTurnChar}) !\n`;
  panelMsg += `Réponds (reply) avec une lettre :\n\n`;
  panelMsg += `🅰️ **A** : Attaque basique (-10 HP adverse / -15 Chakra)\n`;
  panelMsg += `🅱️ **B** : Technique Secrète (-25 HP adverse / -25 Chakra)\n`;
  panelMsg += `🛡️ **C** : Protection (Divise par 2 les prochains dégâts subis)\n`;
  panelMsg += `🛐 **D** : Recharger le Chakra (+35% Chakra)\n`;
  panelMsg += `⚡ **E** : Coup de grâce (-35 HP adverse / -50 Chakra | 60%-80% chance)`;

  return message.reply({
    body: panelMsg,
    mentions: [
      { tag: `@${p1Name}`, id: session.p1 },
      { tag: `@${p2Name}`, id: session.p2 },
      { tag: `@${currentTurnName}`, id: currentTurnID }
    ]
  });
}
