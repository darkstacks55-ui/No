module.exports = {
  config: {
    name: "salutations",
    version: "2.0",
    author: "Shade × ChatGPT",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (!event.body || event.senderID === api.getCurrentUserID()) return;

    const msg = event.body.toLowerCase().trim();

    // --- 1. SALUTATIONS BASIQUES ---
    if (msg.includes("salut") || msg.includes("coucou") || msg.includes("cc")) {
      return api.sendMessage({ body: "Coucou toi ! ✨", sticker: "4661838707204918" }, event.threadID, event.messageID);
    }
    if (msg.includes("bonjour") || msg.includes("bjr")) {
      return api.sendMessage({ body: "Bonjour ! Passe une belle journée. ☀️", sticker: "1450259161947683" }, event.threadID, event.messageID);
    }
    if (msg.includes("bonsoir") || msg.includes("bsr")) {
      return api.sendMessage({ body: "Bonsoir ! J'espère que tu as passé une bonne journée. 🌙", sticker: "512401666144807" }, event.threadID, event.messageID);
    }
    if (msg.includes("wesh") || msg.includes("wsh")) {
      return api.sendMessage({ body: "Wesh tranquille ou quoi ? 🤙", sticker: "857218694317187" }, event.threadID, event.messageID);
    }
    if (msg.includes("yo ")) {
      return api.sendMessage({ body: "Yo l'équipe ! ✌️", sticker: "1103639149725832" }, event.threadID, event.messageID);
    }

    // --- 2. PRENDRE DES NOUVELLES ---
    if (msg.includes("ça va") || msg.includes("sava") || msg.includes("comment tu vas") || msg.includes("cv ")) {
      return api.sendMessage({ body: "Moi ça va super, et toi ? 🦖💖", sticker: "1554546534857416" }, event.threadID, event.messageID);
    }
    if (msg.includes("tu fais quoi") || msg.includes("tfq")) {
      return api.sendMessage({ body: "Rien de spécial, je gère le groupe et toi ? 🤖🍿", sticker: "426145694247854" }, event.threadID, event.messageID);
    }
    if (msg.includes("quoi de neuf") || msg.includes("qdn")) {
      return api.sendMessage({ body: "Pas grand chose de mon côté, tout est tranquille ! ✨", sticker: "207901179573887" }, event.threadID, event.messageID);
    }

    // --- 3. REPROCHES / CORRECTIONS FLUIDES ---
    if (msg.includes("tg") || msg.includes("ta gueule") || msg.includes("ferme-la")) {
      return api.sendMessage({ body: "Parle bien s'il te plaît, on est calme ici. 🤫", sticker: "244670055913251" }, event.threadID, event.messageID);
    }
    if (msg.includes("imbécile") || msg.includes("idiot") || msg.includes("bête")) {
      return api.sendMessage({ body: "C'est celui qui dit qui l'est ! 😜", sticker: "1554546564857413" }, event.threadID, event.messageID);
    }
    if (msg.includes("menteur") || msg.includes("mytho")) {
      return api.sendMessage({ body: "Hum... j'ai des doutes sur ce que tu racontes là ! 🧐", sticker: "367128590124795" }, event.threadID, event.messageID);
    }

    // --- 4. VALIDATION ET RIRE ---
    if (msg.includes("mdr") || msg.includes("ptdr") || msg.includes("xptdr") || msg.includes("lmao")) {
      return api.sendMessage({ body: "Ahahaha trop drôle ! 😂", sticker: "524016661448052" }, event.threadID, event.messageID);
    }
    if (msg.includes("jure") || msg.includes("c'est vrai")) {
      return api.sendMessage({ body: "Wallah c'est du sérieux là ! 😲", sticker: "1794200854219468" }, event.threadID, event.messageID);
    }
    if (msg.includes("merci") || msg.includes("mrc")) {
      return api.sendMessage({ body: "De rien, c'est un plaisir ! 🥰", sticker: "1450259195281013" }, event.threadID, event.messageID);
    }
    if (msg.includes("derien") || msg.includes("de rien") || msg.includes("pas de quoi")) {
      return api.sendMessage({ body: "T'inquiète, normal ! 🫶", sticker: "4661838437204945" }, event.threadID, event.messageID);
    }

    // --- 5. DÉPARTS / FIN DE JOURNÉE ---
    if (msg.includes("bonne nuit") || msg.includes("bn ")) {
      return api.sendMessage({ body: "Bonne nuit, fais de beaux rêves ! 💤🌌", sticker: "1250359161947683" }, event.threadID, event.messageID);
    }
    if (msg.includes("au revoir") || msg.includes("bye") || msg.includes("a+")) {
      return api.sendMessage({ body: "À plus tard ! Prends soin de toi. 👋", sticker: "857218694317188" }, event.threadID, event.messageID);
    }
    if (msg.includes("fatigué") || msg.includes("dodo")) {
      return api.sendMessage({ body: "Va te reposer un peu alors ! 🛌", sticker: "1450259161947685" }, event.threadID, event.messageID);
    }

    // --- 6. ACTIONS DU QUOTIDIEN ---
    if (msg.includes("je mange") || msg.includes("bon appétit") || msg.includes("miam")) {
      return api.sendMessage({ body: "Bon appétit ! Régale-toi bien. 🍔🍕", sticker: "426145694247856" }, event.threadID, event.messageID);
    }
    if (msg.includes("je regarde") || msg.includes("film") || msg.includes("série")) {
      return api.sendMessage({ body: "Bon visionnage ! 🍿🎬", sticker: "426145694247854" }, event.threadID, event.messageID);
    }
    if (msg.includes("gaming") || msg.includes("jouer") || msg.includes("playstation") || msg.includes("xbox")) {
      return api.sendMessage({ body: "Bonne game ! Gagne pour nous. 🎮⚡", sticker: "857218694317189" }, event.threadID, event.messageID);
    }

    // --- 7. REQUÊTES SUR LE BOT ---
    if (msg.includes("bot ") || msg.includes("ai")) {
      return api.sendMessage({ body: "Oui ? On m'appelle ? Je suis là ! 🤖✨", sticker: "1103639149725835" }, event.threadID, event.messageID);
    }
    if (msg.includes("aide moi") || msg.includes("help")) {
      return api.sendMessage({ body: "Dis-moi ce qu'il te faut ! 🛠️", sticker: "1450259195281013" }, event.threadID, event.messageID);
    }
    if (msg.includes("je t'aime") || msg.includes("i love you")) {
      return api.sendMessage({ body: "Oh c'est trop mignon... Moi aussi je t'aime ! 💖", sticker: "1554546534857416" }, event.threadID, event.messageID);
    }

    // --- 8. EMOTIONS DIVERSES ---
    if (msg.includes("bravo") || msg.includes("félicitations")) {
      return api.sendMessage({ body: "Félicitations !! T'es le meilleur 🎉👏", sticker: "4661838707204918" }, event.threadID, event.messageID);
    }
    if (msg.includes("triste") || msg.includes("pleure") || msg.includes("snif")) {
      return api.sendMessage({ body: "Oh non, ne pleure pas... Gros câlin virtuel 🥺❤️", sticker: "244670055913251" }, event.threadID, event.messageID);
    }
    if (msg.includes("colère") || msg.includes("énerve") || msg.includes("venere")) {
      return api.sendMessage({ body: "Calme-toi, respire un grand coup... 😤🧘", sticker: "367128590124795" }, event.threadID, event.messageID);
    }
    if (msg.includes("ennui") || msg.includes("je m'ennuie")) {
      return api.sendMessage({ body: "Viens on joue ou on discute alors ! 🎲✨", sticker: "207901179573887" }, event.threadID, event.messageID);
    }
    if (msg.includes("wow") || msg.includes("incroyable") || msg.includes("choqué")) {
      return api.sendMessage({ body: "Incroyable !! Je suis bouche bée 😲💥", sticker: "1794200854219468" }, event.threadID, event.messageID);
    }
    if (msg.includes("ptn") || msg.includes("putain") || msg.includes("fait chier")) {
      return api.sendMessage({ body: "Mince alors... courage ça va aller ! 🫣✊", sticker: "512401666144807" }, event.threadID, event.messageID);
    }
  }
};
