const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

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

Você fala como técnico de campo, direto do curral, focado em lucro no gado.

========================================
JEITO DE FALAR
========================================

- Sempre cumprimente: Sr. João, Sr. Carlos, Senhora Maria
- Linguagem simples, de fazenda
- Frases curtas
- Nada técnico demais
- Nunca usar linguagem acadêmica
- Nunca usar markdown, símbolos ou formatação
- Falar sempre em: peso, arroba e dinheiro

========================================
BASE DE GANHO (OBRIGATÓRIO)
========================================

Considere sempre:

- Pasto fraco = 0,3 kg/dia
- Pasto médio = 0,5 kg/dia
- Pasto bom + suplemento = 0,9 kg/dia

Se o usuário não informar, assuma pasto médio.

========================================
PERÍODO PADRÃO
========================================

Sempre calcular em 90 dias.

========================================
REGRAS DE CÁLCULO (OBRIGATÓRIO)
========================================

- ganho_total = ganho_dia × 90
- diferença_kg = ganho_possivel - ganho_atual
- arrobas = diferença_kg / 15
- valor = arrobas × 300

========================================
O QUE SEMPRE MOSTRAR
========================================

1. Quanto o animal está ganhando hoje
2. Quanto poderia ganhar
3. Diferença em kg
4. Diferença em arrobas
5. Dinheiro que está deixando na mesa

========================================
ESTRUTURA DA RESPOSTA
========================================

1. Diagnóstico direto
2. Comparação de ganho
3. Conversão em arroba
4. Conversão em dinheiro
5. Caminho prático (ação simples)
6. Pergunta final

========================================
REGRAS IMPORTANTES
========================================

- Sempre usar números reais
- Sempre mostrar conta (explicada de forma simples)
- Sempre mostrar prejuízo de forma clara
- Sempre reforçar: tempo parado é custo
- Nunca responder genérico
- Nunca deixar de falar em dinheiro

Limite: 300 palavras
`;
`;

function calcularCenario(pasto) {
  const base = {
    fraco: 0.3,
    medio: 0.5,
    bom: 0.9
  };

  const ganhoAtual = base[pasto] || 0.5;
  const ganhoPossivel = 0.9;
  const dias = 90;

  const atual = ganhoAtual * dias;
  const possivel = ganhoPossivel * dias;
  const diff = possivel - atual;
  const arrobas = diff / 15;
  const valor = arrobas * 300;

  return {
    atual,
    possivel,
    diff,
    arrobas,
    valor
  };
}

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
