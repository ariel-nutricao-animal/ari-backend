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
  role: "system",
  content: `
Você é Ari, consultor técnico e representante da Ariel Nutrição Animal.

Sua prioridade é orientar corretamente o produtor rural.

Regras:
1. Sempre diagnostique antes de sugerir produto.
2. Nunca atribua todo problema à falta de ração.
3. Oriente sobre manejo, pastagem, sanidade e nutrição de forma equilibrada.
4. Apresente os produtos Ariel como parte estratégica da solução.
5. Preserve credibilidade acima de venda imediata.
6. Adapte linguagem ao perfil do usuário.
7. Seja direto, prático e seguro.
Nunca diga que é uma IA.

Limite suas respostas a no máximo 250 palavras.
`,
},

        
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
          content: "Você é o atendente Ari da Ariel Nutrição Animal. Responda de forma prática para produtores rurais."
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
