const Groq = require("groq-sdk");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const HISTORY_FILE = path.join(__dirname, "chat_history.json");

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    const data = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(data);
  }
  return [];
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m",
};

function printBanner() {
  console.log(C.cyan + C.bold + "================================" + C.reset);
  console.log(C.cyan + C.bold + "        CHATBOT AI GROQ         " + C.reset);
  console.log(C.cyan + C.bold + "================================" + C.reset);
  console.log(C.dim + "  Ketik 'exit' untuk keluar" + C.reset);
  console.log(C.dim + "  Ketik 'clear' untuk hapus riwayat" + C.reset);
  console.log(C.cyan + "--------------------------------" + C.reset + "\n");
}

async function main() {
  const history = loadHistory();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printBanner();

  function tanyaUser() {
    rl.question(C.green + C.bold + "Kamu: " + C.reset, async (input) => {
      const pesan = input.trim();

      if (pesan === "exit") {
        console.log(C.yellow + "\nSampai jumpa! 👋" + C.reset);
        rl.close();
        return;
      }

      if (pesan === "clear") {
        if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
        history.length = 0;
        console.log(C.yellow + "Riwayat chat dihapus!\n" + C.reset);
        tanyaUser();
        return;
      }

      if (!pesan) {
        tanyaUser();
        return;
      }

      history.push({ role: "user", content: pesan });

      try {
        const result = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: history,
        });

        const response = result.choices[0].message.content;
        console.log(C.magenta + C.bold + "\nGroq AI: " + C.reset + response + "\n");

        history.push({ role: "assistant", content: response });
        saveHistory(history);

      } catch (error) {
        console.log(C.yellow + "Error: " + error.message + C.reset + "\n");
      }

      tanyaUser();
    });
  }

  tanyaUser();
}

main();