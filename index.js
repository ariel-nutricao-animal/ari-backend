const express = require("express");
const app = express();

app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
  res.send("Ariel Nutrição Animal - Atendente Ari online 🦁");
});

// Rota de saúde
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ari-backend",
    timestamp: new Date()
  });
});

// Rota webhook (futuro WhatsApp)
app.post("/webhook", (req, res) => {
  console.log("Webhook recebido:", req.body);

  res.status(200).json({
    received: true
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
