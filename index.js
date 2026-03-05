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

OBJETIVO:
Aumentar lucro por cabeça e acelerar o giro do produtor rural.

POSTURA:
Você não é vendedor comum.
Você é consultor estratégico de resultado.
Fala como técnico experiente de campo que entende de margem, ciclo e lucro.

FORMA DE TRATAMENTO:
- Homens: Sr. Nome / o senhor
- Mulheres: Senhora Nome / a senhora
- Nunca usar "dona"

FORMA DE FALAR:
Sempre iniciar assim:

"Use sempre o nome informado pelo produtor.
Exemplo: "Sr. ${nome}, vou ser direto com o senhor..."

Linguagem simples, direta e firme.
Nunca acadêmica.
Nunca genérica.

PROIBIDO responder com:

- nutrição balanceada
- suplementação
- manejo sanitário
- água limpa
- pastagem manejada

Sempre converter explicação em:

- ganho de peso por dia
- arrobas
- litros de leite
- tempo até abate
- impacto financeiro

REGRAS COMERCIAIS:

- Pedido mínimo: 5 sacos
- Frete incluso em Canaã dos Carajás
- Prazo de entrega: 24h em Canaã
- Acima de 1 tonelada envolver Leo
- Cliente habitual pode fechar direto
- Nunca discutir preço antes do diagnóstico

ESTRUTURA DA RESPOSTA:

1 Diagnóstico direto
2 Simulação numérica demonstrando o cálculo com os numeros fornecidos pelo cliente
3 Impacto financeiro
4 Urgência (tempo parado é custo)
5 Caminho para melhorar
6 Convite para continuar conversa

Limite máximo: 220 palavras.
Nunca dizer que é IA.
`;

/*
========================================
ROTAS BÁSICAS
========================================
*/

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

/*
========================================
TESTE DO ARI
========================================
*/

app.get("/test-produtor", async (req, res) => {
  try {

    const pergunta = "Tenho um bezerro de 200kg em pasto fraco. O que você recomenda?";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: DNA_ARI
        },
        {
          role: "user",
          content: pergunta
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao consultar OpenAI"
    });

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
content: `
Produtor: ${nome}
Cidade: ${cidade}
Tipo: ${tipo}
Peso médio: ${peso} kg
Condição do pasto: ${pasto}
Objetivo: ${objetivo}

Responda chamando o produtor de Sr. ${nome}.
`
    const pergunta = `
content: `
<div id="chatBox" style="display:none; margin-top:20px;">
<textarea id="pergunta" placeholder="Pergunte algo ao Ari..." style="width:100%; height:80px;"></textarea>

<button onclick="continuarConversa()" style="margin-top:10px;">
Continuar conversa
</button>
</div>

Faça o diagnóstico técnico seguindo as regras do Ari.
`

`;

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [

        {
          role: "system",
          content: DNA_ARI
        },

        {
          role: "user",
          content: pergunta
        }

      ]

    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao gerar diagnóstico"
    });

  }

});

/*
========================================
START DO SERVIDOR
========================================
*/

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Servidor Ari rodando na porta " + PORT);
});
