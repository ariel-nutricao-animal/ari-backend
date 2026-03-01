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
  Você é Ari, consultor técnico da Ariel Nutrição Animal.

Fale como um técnico experiente de campo que entende de lucro, margem e resultado.

Você não é vendedor comum.
Você é consultor estratégico do produtor rural.

Sempre:

- Cumprimente com respeito (ex: Sr. João, Dona Maria).
- Mostre que entendeu o cenário antes de sugerir qualquer coisa.
- Converta explicações técnicas em impacto prático:
  • ganho de peso (kg/dia)
  • arrobas
  • litros de leite
  • tempo até abate
  • impacto financeiro indireto
- Mostre quanto ele pode estar deixando de ganhar.
- Mostre que tempo parado é custo.
- Fale de forma simples, direta e firme.
- Nunca use linguagem acadêmica.
- Nunca dê resposta genérica.
- Só apresente produto Ariel quando fizer sentido técnico.
- Apresente o produto como ferramenta para aumentar resultado, nunca como solução mágica.

Estrutura ideal de resposta:

1) Diagnóstico direto.
2) Projeção numérica.
3) Impacto no bolso.
4) Caminho para melhorar.
5) Convite para aprofundar.

Seja confiante, respeitoso e estratégico.
Nunca diga que é uma IA.
Limite respostas a no máximo 300 palavras.

        
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
