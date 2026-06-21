const os = require("os");
const moment = require("moment-timezone");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "cpanel2",
    version: "4.9-angel",
    author: "Christus × Angel Fix",
    description: "💖 Tableau de bord système animé style Angel kawaii ✨",
    usage: "cpanel2",
    category: "system",
    role: 0
  },

  onStart: async function ({ api, event }) {
    try {
      if (!event?.threadID) return;

      const width = 1000;
      const height = 700;

      const encoder = new GIFEncoder(width, height);
      const fileName = `angel_cpanel_${Date.now()}.gif`;
      const filePath = path.join(__dirname, fileName);

      const stream = fs.createWriteStream(filePath);

      encoder.createReadStream().pipe(stream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(150);
      encoder.setQuality(10);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const formatUptime = (sec) => {
        const d = Math.floor(sec / 86400);
        const h = Math.floor((sec % 86400) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${d}j ${h}h ${m}m`;
      };

      const totalMem = os.totalmem() / 1024 / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024 / 1024;
      const usedMem = totalMem - freeMem;

      const stats = [
        ["💖 UPTIME BOT", formatUptime(process.uptime())],
        ["⚙️ CPU CORES", os.cpus().length.toString()],
        ["🧠 NODE", process.version],
        ["💾 RAM", (usedMem / totalMem * 100).toFixed(1) + "%"],
        ["📊 SYSTEM UPTIME", formatUptime(os.uptime())],
        ["🖥️ OS", os.platform()],
        ["⚡ LOAD", (os.loadavg()?.[0] || 0).toFixed(1)],
        ["💿 TOTAL RAM", totalMem.toFixed(1) + " GB"]
      ];

      const colors = ["#ff66cc", "#66ffcc", "#66aaff", "#ffcc66", "#cc66ff"];

      const drawHex = (x, y, label, value, alpha, color) => {
        const r = 95;

        ctx.globalAlpha = alpha;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = Math.PI / 3 * i;
          const px = x + r * Math.cos(angle);
          const py = y + r * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }

        ctx.closePath();

        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";

        ctx.font = "16px Arial";
        ctx.fillText(label, x, y - 10);

        ctx.font = "bold 20px Arial";
        ctx.fillText(value, x, y + 18);

        ctx.globalAlpha = 1;
      };

      const cx = width / 2;
      const cy = height / 2;
      const spacing = 180;

      const positions = [
        [cx, cy - spacing],
        [cx + spacing, cy - spacing / 2],
        [cx + spacing, cy + spacing / 2],
        [cx, cy + spacing],
        [cx - spacing, cy + spacing / 2],
        [cx - spacing, cy - spacing / 2],
        [cx, cy],
        [cx + spacing * 1.4, cy],
        [cx - spacing * 1.4, cy]
      ];

      for (let frame = 0; frame < 10; frame++) {
        ctx.fillStyle = "#0b0b1a";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ff99dd";
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("💖 ANGEL SYSTEM PANEL 💖", cx, 60);

        ctx.font = "14px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          moment().tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss"),
          width - 140,
          40
        );

        ctx.textAlign = "left";
        ctx.fillText(`🌸 OS: ${os.platform()}`, 30, 40);

        for (let i = 0; i < stats.length; i++) {
          const pulse = 0.5 + 0.5 * Math.sin((frame + i) / 2);
          drawHex(
            positions[i][0],
            positions[i][1],
            stats[i][0],
            stats[i][1],
            pulse,
            colors[i % colors.length]
          );
        }

        encoder.addFrame(ctx);
      }

      encoder.finish();

      stream.on("finish", () => {
        api.sendMessage(
          {
            body: "💖✨ 𝐀𝐍𝐆𝐄𝐋 𝐂𝐏𝐀𝐍𝐄𝐋 𝐆𝐈𝐅 ✨💖",
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => {
            try {
              fs.unlinkSync(filePath);
            } catch {}
          }
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("💔 Angel error... panel failed 😢", event.threadID);
    }
  }
};
