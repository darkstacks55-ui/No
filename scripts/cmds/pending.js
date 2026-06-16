const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

// 🎨 IMAGE
function createPendingImage(list) {
  const canvas = createCanvas(900, 500);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, 900, 500);

  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 860, 460);

  ctx.fillStyle = "#00ffcc";
  ctx.font = "bold 40px Arial";
  ctx.fillText("📋 PENDING LIST", 260, 80);

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Total: ${list.length}`, 50, 130);

  let y = 180;
  list.slice(0, 6).forEach((g, i) => {
    ctx.fillText(`${i + 1}. ${g.name}`, 60, y);
    ctx.fillText(`ID: ${g.id}`, 60, y + 20);
    y += 60;
  });

  const file = path.join(cacheDir, `pending_${Date.now()}.png`);
  fs.writeFileSync(file, canvas.toBuffer());
  return file;
}

// 📦 CONFIG
module.exports.config = {
  name: "pending",
  version: "1.0",
  role: 2,
  author: "Shade",
  category: "owner"
};

// 📋 AFFICHER LISTE
module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const groups = global.pendingThreads || [];

  if (!groups.length)
    return api.sendMessage("📋 Aucun groupe en attente.", threadID, messageID);

  const img = createPendingImage(groups);

  const msg =
`📋 » PENDING SYSTEM «
━━━━━━━━━━━━
g1 g2 → approve
c1 c2 → cancel
━━━━━━━━━━━━`;

  api.sendMessage(
    { body: msg, attachment: fs.createReadStream(img) },
    threadID,
    (err, info) => {
      global.pendingReply = {
        messageID: info.messageID,
        groups
      };
    }
  );
};
