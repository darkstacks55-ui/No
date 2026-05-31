const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

module.exports.config = {
  name: "imagedetail",
  aliases: ["imgdetail"],
  version: "✨ 1.1 angel kawaii",
  author: "Christus ✨ Shade Edit",
  countDown: 5,
  role: 0,
  description: "💖 Affiche les métadonnées d'une image avec style angel ✨",
  category: "🌸 image",
  guide: "{pn} reply à une image 📸"
};

module.exports.onStart = async ({ api, event }) => {
  const send = (text) =>
    api.sendMessage(`🌸✨ ${text}`, event.threadID, event.messageID);

  try {
    const attachment = event.messageReply?.attachments?.[0];

    if (!attachment || attachment.type !== "photo") {
      return send("📸 Réponds à une image pour que je puisse lire ses secrets 💖✨");
    }

    const imgUrl = attachment.url;

    const imgBuffer = await axios.get(imgUrl, {
      responseType: "arraybuffer"
    }).then(res => res.data);

    const tempPath = path.join(__dirname, `angel_${Date.now()}.jpg`);
    await fs.writeFile(tempPath, imgBuffer);

    const metadata = await sharp(imgBuffer).metadata();

    const ratioList = [
      { r: 1, l: "1:1" },
      { r: 4 / 3, l: "4:3" },
      { r: 3 / 2, l: "3:2" },
      { r: 16 / 9, l: "16:9" },
      { r: 9 / 16, l: "9:16" },
      { r: 21 / 9, l: "21:9" },
      { r: 3 / 4, l: "3:4" },
      { r: 2 / 3, l: "2:3" }
    ];

    let ratio = "N/A";
    let orientation = "🌸 Inconnu";

    if (metadata.width && metadata.height) {
      const ratioDecimal = metadata.width / metadata.height;

      let closest = ratioList[0];
      let diffMin = Math.abs(ratioDecimal - closest.r);

      for (const r of ratioList) {
        const diff = Math.abs(ratioDecimal - r.r);
        if (diff < diffMin) {
          diffMin = diff;
          closest = r;
        }
      }

      ratio = closest.l;

      if (metadata.width > metadata.height) orientation = "📺 Paysage";
      else if (metadata.width < metadata.height) orientation = "📱 Portrait";
      else orientation = "🔳 Carré";
    }

    const sizeKB = (imgBuffer.byteLength / 1024).toFixed(2);
    const sizeMB = (imgBuffer.byteLength / (1024 * 1024)).toFixed(2);

    const caption =
`╭───────────────✦
│ 💖 𝗜𝗠𝗔𝗚𝗘 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 𝗔𝗡𝗚𝗘𝗟 ✨
├────────────────
│ 🧾 Format : ${metadata.format || "N/A"}
│ 📏 Taille : ${metadata.width || 0} x ${metadata.height || 0}px
│ 📐 Ratio : ${ratio}
│ 🌈 Orientation : ${orientation}
│ 📦 Poids : ${sizeKB} KB (${sizeMB} MB)
│ 🧠 Bits : ${metadata.depth || "N/A"}
│ 🎨 Canaux : ${metadata.channels || "N/A"}
│ 🌈 Couleur : ${metadata.space || "N/A"}
│ 🪶 Alpha : ${metadata.hasAlpha ? "Oui 💖" : "Non"}
│ ⚡ Compression : ${metadata.compression || "N/A"}
│ 🔄 Orientation EXIF : ${metadata.orientation || "N/A"}
│ ✨ Progressif : ${metadata.isProgressive ? "Oui" : "Non"}
├────────────────
│ 💖 Angel system by Shade
╰───────────────✦`;

    await api.sendMessage(
      {
        body: caption,
        attachment: fs.createReadStream(tempPath)
      },
      event.threadID,
      async () => await fs.remove(tempPath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "💔✨ Oops… Angel system encountered an error.\n🌸 Please try again later.",
      event.threadID,
      event.messageID
    );
  }
};
