const express = require("express");
const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const HISTORY_FILE = path.join(__dirname, "chat_history.json");

app.use(express.json());
app.use(express.static("public"));

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

app.post("/chat", async (req, res) => {
  const { pesan } = req.body;
  const history = loadHistory();

  history.push({ role: "user", content: pesan });

  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: history,
    });

    const response = result.choices[0].message.content;
    history.push({ role: "assistant", content: response });
    saveHistory(history);

    res.json({ reply: response });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/clear", (req, res) => {
  if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
  res.json({ message: "Riwayat dihapus!" });
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});