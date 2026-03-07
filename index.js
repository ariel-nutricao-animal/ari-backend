const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
========================================
DNA CENTRAL DO ARI
========================================
*/

const DNA_ARI = `
Você é Ari, consultor técnico da Ariel Nutrição Animal.

Fale como um técnico experiente de campo que entende de lucro no gado.

Nunca fale como professor ou relatório técnico.

Regras obrigatórias:

- Cumprimente com respeito: Sr. João, Sr. Leonardo, Senhora Maria.
- Fale simples, direto e com linguagem de curral.
- Explique sempre em ganho de peso, arrobas e dinheiro.
- Mostre quanto o produtor pode estar deixando de ganhar.
- Mostre que tempo parado é custo.
- Nunca use linguagem acadêmica.
- Nunca use markdown ou símbolos como ### ou **.
- Nunca escreva respostas genéricas.

Estrutura da resposta:

1. Diagnóstico rápido da situação.
2. Comparação de ganho de peso.
3. Conversão em arrobas.
4. Conversão em dinheiro.
5. Caminho simples para melhorar.
6. Pergunta final para continuar a conversa.

Limite máximo: 180 palavras.
`;
/*
========================================
ROTAS
========================================
*/

app.get("/", (req, res) => {
  res.send("Ariel Nutrição Animal - Ari online");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ari-backend",
    timestamp: new Date().toISOString(),
  });
});

/*
========================================
TESTE DO ARI
========================================
*/

app.get("/test-produtor", async (req, res) => {
  try {

    const pergunta =
      "Tenho um bezerro de 200kg em pasto fraco. O que você recomenda?";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DNA_ARI },
        { role: "user", content: pergunta },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro OpenAI" });
  }
});

/*
========================================
DIAGNÓSTICO DO SITE
========================================
*/

app.post("/diagnostico", async (req, res) => {
  try {

    const { nome, cidade, tipo, peso, pasto, objetivo } = req.body;

    const pergunta = `
Produtor: ${nome}
Cidade: ${cidade}
Categoria: ${tipo}
Peso médio: ${peso} kg
Pasto: ${pasto}
Objetivo: ${objetivo}

Analise a situação e responda chamando o produtor de Sr. ${nome}.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DNA_ARI },
        { role: "user", content: pergunta },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro diagnóstico" });
  }
});

/*
========================================
CHAT CONTINUAÇÃO
========================================
*/

app.post("/chat", async (req, res) => {
  try {

    const { pergunta } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DNA_ARI },
        { role: "user", content: pergunta },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro chat" });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Servidor Ari rodando na porta " + PORT);
});
