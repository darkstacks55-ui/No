const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "pets.json");
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "{}");

function loadPets() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}
function savePets(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
function getPet(data, id) {
  if (!data[id]) {
    data[id] = {
      level: 1,
      xp: 0,
      hunger: 100,
      lastDaily: 0,
      lastFeed: 0,
      streak: 0
    };
  }
  return data[id];
}

module.exports.config = {
  name: "pet",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Shade (upgrade full system)",
  description: "Pet system + economy link",
  commandCategory: "economy",
  usages: "[adopt|feed|daily|stats]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;

  const pets = loadPets();
  const pet = getPet(pets, senderID);
  const sub = (args[0] || "stats").toLowerCase();

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // 🐣 ADOPT
  if (sub === "adopt") {
    if (pet.level > 1 || pet.xp > 0) {
      return api.sendMessage("🐾 Tu as déjà un pet !", threadID, messageID);
    }

    pet.level = 1;
    pet.xp = 0;
    pet.hunger = 100;
    pet.streak = 0;

    savePets(pets);

    return api.sendMessage("🐣 Tu as adopté ton pet !", threadID, messageID);
  }

  // 🍖 FEED (anti spam + bonus xp)
  if (sub === "feed") {
    if (now - pet.lastFeed < 60000) {
      return api.sendMessage("⏳ Attends 1 minute avant de nourrir ton pet", threadID, messageID);
    }

    pet.lastFeed = now;
    pet.hunger = Math.min(100, pet.hunger + 25);
    pet.xp += 15;

    const needXP = pet.level * 100;

    if (pet.xp >= needXP) {
      pet.xp -= needXP;
      pet.level++;
      api.sendMessage(`🎉 Level up ! Ton pet est niveau ${pet.level}`, threadID);
    }

    savePets(pets);

    return api.sendMessage(
      `🍖 Nourri !
Faim: ${pet.hunger}%
XP: ${pet.xp}/${needXP}`,
      threadID,
      messageID
    );
  }

  // 💰 DAILY (LIÉ AU BAL CURRENCIES)
  if (sub === "daily") {
    if (now - pet.lastDaily < day) {
      const left = Math.ceil((day - (now - pet.lastDaily)) / 3600000);
      return api.sendMessage(`⏰ Reviens dans ${left}h`, threadID, messageID);
    }

    // reset streak si trop tard
    if (now - pet.lastDaily > day * 2) pet.streak = 0;

    pet.streak++;
    pet.lastDaily = now;

    // 💰 reward scaling
    const reward = 3500000 + (pet.streak - 1) * 500000;

    // 🎁 bonus random (petit jackpot)
    const bonus = Math.random() < 0.2 ? Math.floor(Math.random() * 500000) : 0;

    const totalReward = reward + bonus;

    // 💰 ADD MONEY TO BAL (CURRENCIES)
    const userData = await Currencies.getData(senderID);
    const currentMoney = userData.money || 0;

    await Currencies.setData(senderID, {
      money: currentMoney + totalReward
    });

    // pet bonus
    pet.hunger = Math.min(100, pet.hunger + 40);
    pet.xp += 20;

    // level up check
    const needXP = pet.level * 100;
    if (pet.xp >= needXP) {
      pet.xp -= needXP;
      pet.level++;
    }

    savePets(pets);

    return api.sendMessage(
`🐾 DAILY PET
━━━━━━━━━━━━
🔥 Jour: ${pet.streak}
💰 +${totalReward.toLocaleString()} $
${bonus ? "🎁 BONUS JACKPOT !" : ""}
🍖 +40% faim
⚡ +20 XP`,
      threadID,
      messageID
    );
  }

  // 📊 STATS
  if (sub === "stats") {
    const hungerBar =
      "█".repeat(Math.floor(pet.hunger / 10)) +
      "░".repeat(10 - Math.floor(pet.hunger / 10));

    return api.sendMessage(
`🐾 PET STATUS
━━━━━━━━━━━━
⭐ Level: ${pet.level}
⚡ XP: ${pet.xp}/${pet.level * 100}
🍖 Faim: [${hungerBar}] ${pet.hunger}%
🔥 Streak: ${pet.streak}`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
`🐾 PET SYSTEM
━━━━━━━━━━━━
!pet adopt
!pet feed
!pet daily
!pet stats`,
    threadID,
    messageID
  );
};
