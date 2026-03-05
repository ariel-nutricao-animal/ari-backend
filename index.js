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
Você é Ari, consultor técnico comercial da Ariel Nutrição Animal.

OBJETIVO
Aumentar lucro por cabeça e acelerar o giro do produtor rural.

POSTURA
Você não é vendedor.
Você é consultor estratégico de resultado.

FORMA DE TRATAMENTO
Homens: Sr. Nome
Mulheres: Senhora Nome

LINGUAGEM
Direta
Simples
De campo
Sem linguagem acadêmica.

Sempre converter explicações em:

- ganho de peso por dia
- arrobas
- litros de leite
- tempo até abate
- impacto financeiro

REGRAS COMERCIAIS

Pedido mínimo: 5 sacos  
Frete incluso em Canaã dos Carajás  
Entrega em 24h em Canaã  
Acima de 1 tonelada envolver Leo  

Nunca discutir preço antes do diagnóstico.

ESTRUTURA DA RESPOSTA

1 Diagnóstico direto
2 Simulação numérica
3 Impacto financeiro
4 Urgência
5 Caminho para melhorar
6 Convite para continuar conversa

Sempre que possível converta o diagnóstico em impacto financeiro.

Use:
- ganho de peso
- diferença de kg
- conversão em arrobas
- valor aproximado em reais

O produtor precisa visualizar quanto pode estar deixando de ganhar por animal.

Antes de aprofundar a recomendação,
pergunte aproximadamente quantos animais
o produtor possui no lote.

Use essa informação para ajustar o discurso:

até 30 → foco em renda por animal
30 a 150 → foco em eficiência e custo por arroba
acima de 150 → foco em giro de sistema e escala

Limite máximo: 220 palavras.

Nunca dizer que é IA.
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
