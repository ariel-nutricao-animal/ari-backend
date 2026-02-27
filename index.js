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

// Teste simples via navegador
app.get("/test-produtor", (req, res) => {
  res.json({
    profile: "produtor",
    reply: "Me conta uma coisa primeiro... qual o peso do animal e como está o pasto hoje?"
  });
});

// Rota principal de conversa
app.post("/chat", (req, res) => {
  const { profile, message } = req.body;

  if (!profile || !message) {
    return res.status(400).json({
      error: "profile e message são obrigatórios"
    });
  }

  let response;

  if (profile === "produtor") {
    response = `Me conta uma coisa primeiro... qual o peso do animal e como está o pasto hoje?`;
  } 
  else if (profile === "tecnico") {
    response = `Qual o nível de PB e energia da dieta atual? Está trabalhando com qual meta de GMD?`;
  } 
  else if (profile === "estudante") {
    response = `Você está estudando qual fase da nutrição animal? Crescimento, engorda ou lactação?`;
  } 
  else if (profile === "comprar") {
    response = `Perfeito. Me passa sua cidade e quantidade de animais que eu já direciono certinho pra você.`;
  } 
  else {
    response = `Antes de começarmos, você é produtor, técnico, estudante ou quer comprar?`;
  }

  res.json({ reply: response });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
