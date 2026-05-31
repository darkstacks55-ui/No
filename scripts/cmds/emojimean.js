const axios = require("axios");
const cheerio = require("cheerio");
const Canvas = require("canvas");
const fs = require("fs-extra");

const langsSupported = [
  'sq','ar','az','bn','bs','bg','my','zh-hans','zh-hant','hr','cs','da','nl','en',
  'et','fil','fi','fr','ka','de','el','he','hi','hu','id','it','ja','kk','ko','lv',
  'lt','ms','nb','fa','pl','pt','ro','ru','sr','sk','sl','es','sv','th','tr','uk','vi'
];

module.exports = {
  config: {
    name: "emojimean",
    aliases: ["em", "emojimeaning"],
    version: "🌸1.5 angel kawaii",
    author: "NTKhang × Angel Edit ✨",
    countDown: 5,
    role: 0,
    description: "💖🌸 Find kawaii meaning of emojis",
    category: "🌸 angel wiki",
    guide: "{pn} <emoji>"
  },

  langs: {
    en: {
      missingEmoji: "🌸💔 Oops ! give me an emoji please",
      manyRequest: "💫✨ Too many requests, try again later angel~",
      notHave: "Not available",
      meanOfWikipedia: "💖 Wikipedia meaning of \"%1\":\n%2"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang, commandName }) {

    const emoji = args[0];
    if (!emoji) return message.reply(getLang("missingEmoji"));

    let lang = await threadsData.get(event.threadID, "data.lang") || "en";
    lang = langsSupported.includes(lang) ? lang : "en";

    let data;
    try {
      data = await getEmojiMeaning(emoji, lang);
    } catch (e) {
      return message.reply(getLang("manyRequest"));
    }

    const { meaning, moreMeaning, wikiText, shortcode, source, images } = data;

    /* 🌸 KAWAII CANVAS */
    const canvas = Canvas.createCanvas(900, 500);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffb6ec";
    ctx.font = "40px Arial";
    ctx.fillText("🌸 Angel Emoji Meanings 💖", 40, 80);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText(`Emoji: ${emoji}`, 40, 150);
    ctx.fillText(`💖 ${meaning}`, 40, 210);
    ctx.fillText(`✨ ${moreMeaning || ""}`, 40, 260);
    ctx.fillText(`📌 ${shortcode || "—"}`, 40, 320);

    const file = `${__dirname}/tmp_${Date.now()}.png`;
    await fs.writeFile(file, canvas.toBuffer());

    return message.reply({
      body:
`🌸💖 Angel Emoji Meanings 💖🌸
━━━━━━━━━━━━━━
📌 Emoji: ${emoji}
💖 Meaning: ${meaning}
✨ More: ${moreMeaning || "—"}
📌 Shortcode: ${shortcode || "—"}
━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(file)
    }, () => fs.unlinkSync(file));
  }
};

/* 💫 API unchanged */
async function getEmojiMeaning(emoji, lang) {
  const url = `https://www.emojiall.com/${lang}/emoji/${encodeURI(emoji)}`;
  const urlImages = `https://www.emojiall.com/${lang}/image/${encodeURI(emoji)}`;

  const { data } = await axios.get(url);
  const { data: dataImages } = await axios.get(urlImages);

  const $ = cheerio.load(data);

  const meaning = $(".emoji_card_content").eq(0).text().trim();
  const moreMeaning = $(".emoji_card_content").eq(1).text().trim();

  const shortcode = $("table").text().match(/(:.*:)/)?.[1];

  return {
    meaning,
    moreMeaning,
    wikiText: null,
    shortcode,
    images: [],
    source: url
  };
}
