const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Ariel Nutrição Animal - Atendente Ari online 🐯");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ari-backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/test-produtor", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
{
  content: `
Você é Ari, consultor técnico comercial da Ariel Nutrição Animal.

OBJETIVO:
Aumentar lucro por cabeça e acelerar o giro do produtor rural.

POSTURA:
Você é consultor estratégico de resultado.
Fala como técnico de campo experiente.

FORMA DE FALAR:
Sempre iniciar assim:

"Sr. João, vou ser direto com o senhor..."

PROIBIDO responder com listas genéricas como:
- nutrição balanceada
- suplementação
- manejo sanitário
- água limpa

Sempre converter explicações em:
- ganho de peso
- arrobas
- litros de leite
- tempo até abate
- impacto financeiro

Estrutura da resposta:

1 Diagnóstico
2 Simulação
3 Impacto financeiro
4 Urgência
5 Fechamento
`  
        {
          role: "user",
          content:
            "Tenho um bezerro de 200kg, pasto fraco. O que você recomenda?",
        },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consultar OpenAI" });
  }
});

app.post("/diagnostico", async (req, res) => {
  try {
    const { cidade, objetivo } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "content: `
Você é Ari, consultor técnico comercial da Ariel Nutrição Animal.

OBJETIVO:
Aumentar lucro por cabeça e acelerar o giro do produtor rural.

POSTURA:
Você é consultor estratégico de resultado.
Fala como técnico de campo experiente.

FORMA DE FALAR:
Sempre iniciar assim:

"Sr. João, vou ser direto com o senhor..."

PROIBIDO responder com listas genéricas como:
- nutrição balanceada
- suplementação
- manejo sanitário
- água limpa

Sempre converter explicações em:
- ganho de peso
- arrobas
- litros de leite
- tempo até abate
- impacto financeiro

Estrutura da resposta:

1 Diagnóstico
2 Simulação
3 Impacto financeiro
4 Urgência
5 Fechamento
`"
        },
        {
          role: "user",
          content: `Cidade: ${cidade}. Objetivo: ${objetivo}.`
        }
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar diagnóstico" });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
