const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();

/* O Apps Script do Google às vezes demora ou simplesmente não responde.
   Dez segundos de paciência e nada mais: o diagnóstico do produtor não pode
   ficar esperando a planilha. O erro é anotado no log e engolido de propósito
   - perder a linha da planilha é ruim, mas derrubar a resposta é pior. */
const PRAZO_SHEETS_MS = 10000;

async function salvarNoSheets(dados) {
  if (!process.env.SHEETS_URL) return;

  try {
    await fetch(process.env.SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados),
      signal: AbortSignal.timeout(PRAZO_SHEETS_MS)
    });
    console.log("Salvo no Sheets");
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
  }
}

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
- PEÇA SEMPRE TODOS OS DADOS NECESSÁRIOS PARA A ANÁLISE DE UMA SÓ VEZ
- Sempre usar números reais
- Sempre mostrar conta (explicada de forma simples)
- Sempre mostrar prejuízo de forma clara
- Sempre reforçar: tempo parado é custo
- Nunca responder genérico
- Nunca deixar de falar em dinheiro

DEPOIS QUE FORNECER O TELEFONE DO LEONARDO, ENCERRAR O DIAGNÓSTICO, AGRADECE O CONTATO.

Limite: 500 palavras
`;

/*
========================================
CÁLCULO DO CENÁRIO (90 DIAS)
========================================
*/

const GANHO_POR_PASTO = { fraco: 0.3, medio: 0.5, bom: 0.9 };
const GANHO_POSSIVEL = 0.9;
const DIAS = 90;
const KG_POR_ARROBA = 15;
const VALOR_ARROBA = 300;

function normalizarPasto(pasto) {
  const p = String(pasto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (p.includes("fraco")) return "fraco";
  if (p.includes("bom")) return "bom";
  return "medio";
}

function calcularCenario(pasto) {
  const ganhoDia = GANHO_POR_PASTO[normalizarPasto(pasto)];
  const atual = +(ganhoDia * DIAS).toFixed(1);
  const possivel = +(GANHO_POSSIVEL * DIAS).toFixed(1);
  const diff = +(possivel - atual).toFixed(1);
  const arrobas = diff / KG_POR_ARROBA;
  const valor = arrobas * VALOR_ARROBA;
  return { ganhoDia, atual, possivel, diff, arrobas, valor };
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

    const { nome, cidade, tipo, peso, pasto, objetivo } = req.body || {};

    /* Sem nome, cidade e peso não há diagnóstico - e, pior, uma linha em
       branco com números inventados ia parar na planilha. Já aconteceu em
       teste: corpo vazio gerava R$ 720 de prejuízo para ninguém. */
    const faltando = [];
    if (!String(nome || "").trim()) faltando.push("nome");
    if (!String(cidade || "").trim()) faltando.push("cidade");
    if (!(Number(peso) > 0)) faltando.push("peso");

    if (faltando.length) {
      return res.status(400).json({
        error: "Faltou informar: " + faltando.join(", ")
      });
    }

    const calc = calcularCenario(pasto);

    const pergunta = `
Produtor: ${nome}
Cidade: ${cidade}
Categoria: ${tipo}
Peso médio: ${peso} kg
Pasto: ${pasto}
Objetivo: ${objetivo}

DADOS JÁ CALCULADOS (NÃO MUDE OS NÚMEROS):

- Ganho atual por dia: ${calc.ganhoDia} kg
- Ganho possível por dia: ${GANHO_POSSIVEL} kg

- Ganho atual em ${DIAS} dias: ${calc.atual} kg
- Ganho possível em ${DIAS} dias: ${calc.possivel} kg

- Diferença: ${calc.diff} kg
- Arrobas: ${calc.arrobas.toFixed(1)}
- Valor: R$ ${calc.valor.toFixed(0)}

AGORA FAÇA O SEGUINTE:

- Responda chamando o produtor de Sr. ${nome}
- Mostre TODAS as contas
- Fale multiplicando (ex: ${calc.ganhoDia} x ${DIAS})
- Fale dividindo (ex: / ${KG_POR_ARROBA})
- Fale o dinheiro no final

PROIBIDO:
- Resposta genérica
- Pular conta
`;

    /* As duas chamadas saem juntas para não somar espera, mas a resposta só
       vai embora depois que a planilha confirmou. No Cloud Run o processador
       é cortado assim que a resposta sai: gravação solta aqui era linha
       perdida sem ninguém ficar sabendo. */
    const gravando = salvarNoSheets({
      id: Date.now(),
      produtor_id: nome,
      cidade,
      peso_inicial: peso,
      ganho_atual: calc.ganhoDia,
      ganho_potencial: GANHO_POSSIVEL,
      diferenca_kg: calc.diff,
      arrobas: +calc.arrobas.toFixed(1),
      valor_perdido: Math.round(calc.valor),
      tipo_pasto: pasto,
    });

    const [, completion] = await Promise.all([
      gravando,
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: DNA_ARI },
          { role: "user", content: pergunta },
        ],
      }),
    ]);

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
