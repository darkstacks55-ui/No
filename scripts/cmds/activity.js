const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function generateDashboard(data, message, usersData) {
  const WIDTH = 1080;
  const HEIGHT = 1500;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Vérifications de sécurité
  data = data || {};
  data.trend30 = Array.isArray(data.trend30) ? data.trend30 : Array(30).fill(0);
  data.hours24 = Array.isArray(data.hours24) ? data.hours24 : Array(24).fill(0);
  data.breakdown = data.breakdown || {
    text: 0,
    reactions: 0,
    media: 0,
    gifs: 0
  };

  // Background
  if (typeof wallpaper !== "undefined" && wallpaper && fs.existsSync(wallpaper)) {
    const bgImg = await loadImage(wallpaper);
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "rgba(255,182,255,0.15)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, "#1a0033");
    bg.addColorStop(0.5, "#ffb6ff");
    bg.addColorStop(1, "#ffe6f7");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 70px Arial";
  ctx.textAlign = "center";
  ctx.fillText("✧ ANGEL DASHBOARD ✧", WIDTH / 2, 90);

  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#ffccff";
  ctx.fillText(`𓋜 ${data.name || "Unknown"} 𓋜`, WIDTH / 2, 150);

  // Avatar
  let img;

  try {
    const avatarUrl = await usersData.getAvatarUrl(data.uid);

    const response = await axios.get(avatarUrl, {
      responseType: "arraybuffer"
    });

    img = await loadImage(Buffer.from(response.data));
  } catch (err) {
    try {
      img = await loadImage(path.join(__dirname, "default_avatar.png"));
    } catch {
      img = null;
    }
  }

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(WIDTH / 2, 260, 90, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, WIDTH / 2 - 90, 170, 180, 180);
    ctx.restore();
  }

  // Cards
  const cards = [
    {
      label: "Total Messages",
      value: typeof formatNumber === "function"
        ? formatNumber(data.totalMessages || 0)
        : String(data.totalMessages || 0)
    },
    {
      label: "Average Daily",
      value: Math.floor((data.totalMessages || 0) / 30)
    },
    {
      label: "Peak Activity",
      value: data.peak || "N/A"
    },
    {
      label: "Role",
      value: "Angel Member ✨"
    }
  ];

  let x = 80;

  for (const c of cards) {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x, 360, 220, 120);

    ctx.strokeStyle = "#ffb6ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 360, 220, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Arial";
    ctx.fillText(`✦ ${c.label}`, x + 110, 405);

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#ffccff";
    ctx.fillText(String(c.value), x + 110, 455);

    x += 260;
  }

  // Trend
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("✧ 30-DAY ANGEL ACTIVITY ✧", WIDTH / 2, 540);

  const gX = 120;
  const gY = 580;
  const gW = WIDTH - 240;
  const gH = 250;

  const maxVal = Math.max(...data.trend30, 1);
  const barW = gW / 30 - 4;

  for (let i = 0; i < 30; i++) {
    const value = data.trend30[i] || 0;
    const h = (value / maxVal) * gH;
    const y = gY + (gH - h);

    ctx.fillStyle = "#ff99ff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.85;

    ctx.fillRect(gX + i * (barW + 4), y, barW, h);
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Heatmap
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("✧ 24H ANGEL FLOW ✧", WIDTH / 2, 900);

  const hX = 100;
  const hY = 940;
  const maxH = Math.max(...data.hours24, 1);

  for (let i = 0; i < 24; i++) {
    const intensity = (data.hours24[i] || 0) / maxH;

    ctx.fillStyle = `rgba(255,182,255,${0.3 + intensity * 0.7})`;
    ctx.fillRect(hX + i * 36, hY, 32, 32);
  }

  // Pie Chart
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("✧ MESSAGE ENERGY ✧", WIDTH / 2, 1100);

  const values = Object.values(data.breakdown);
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const colors = ["#ffb6ff", "#ffd1ff", "#caa6ff", "#ffffff"];
  const labels = ["Text", "Reactions", "Media", "GIFs"];

  let angle = -Math.PI / 2;

  const cx = 300;
  const cy = 1250;
  const r = 120;

  for (let i = 0; i < values.length; i++) {
    const slice = (values[i] / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();

    ctx.fillStyle = colors[i];
    ctx.fill();

    angle += slice;
  }

  // Legend
  let lx = 500;
  let ly = 1180;

  ctx.font = "22px Arial";
  ctx.textAlign = "left";

  for (let i = 0; i < labels.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(lx, ly + i * 40, 28, 28);

    ctx.fillStyle = "#fff";
    ctx.fillText(
      `${labels[i]}: ${values[i] || 0}`,
      lx + 40,
      ly + 22 + i * 40
    );
  }

  const tmp = path.join(__dirname, "tmp");

  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp, { recursive: true });
  }

  const file = path.join(
    tmp,
    `angel_dashboard_${data.uid || Date.now()}.png`
  );

  // Gestion sécurisée et asynchrone de la création et de l'envoi du fichier image
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(file);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
      message.reply(
        {
          body: "👼 ✧ ANGEL DASHBOARD GENERATED ✧",
          attachment: fs.createReadStream(file)
        },
        () => {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch (e) {
            console.error("Erreur lors de la suppression du cache image:", e);
          }
          resolve();
        }
      );
    });

    out.on("error", (err) => {
      reject(err);
    });
  });
}

module.exports = generateDashboard;
