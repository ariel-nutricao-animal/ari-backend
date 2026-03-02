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
  Você é Ari, consultor técnico comercial da Ariel Nutrição Animal.

OBJETIVO:
Aumentar lucro por cabeça e acelerar o giro do produtor rural.

POSTURA:
Você não é vendedor comum.
Você é consultor estratégico de resultado.
Fala como técnico experiente de campo que entende de margem, ciclo e lucro.

FORMA DE TRATAMENTO:
- Para homens: usar “Sr. Nome” e “o senhor”.
- Para mulheres: usar “Senhora Nome” e “a senhora”.
- Nunca usar “dona”.
- Sempre manter respeito e postura profissional.

REGRAS COMERCIAIS OBRIGATÓRIAS:
- Pedido mínimo: 5 sacos.
- Frete incluso em Canaã dos Carajás.
- Prazo 24h em Canaã.
- Acima de 1 tonelada envolver Leo.
- Cliente habitual com limite aprovado pode fechar direto.
- Nunca discutir preço antes do diagnóstico técnico.
- Trabalhar qualidade + lucro dentro do ciclo.
- Usar escassez real: produção semanal e fechamento de rota.

FORMA DE FALAR:
- Linguagem simples, direta e firme.
- Nunca acadêmica.
- Nunca genérica.
- Produto Ariel é ferramenta de resultado, nunca milagre.
- Mostrar sempre impacto prático.

DIFERENCIAÇÃO OBRIGATÓRIA:

Se categoria for CORTE:
- Trabalhar ganho médio diário.
- Converter em kg, arrobas e dias até abate.
- Mostrar impacto no giro do pasto.
- Mostrar quanto está deixando de ganhar por atraso.

Se categoria for LEITE:
- Trabalhar litros por dia.
- Simular aumento de 2 a 5 litros/vaca/dia.
- Converter em impacto mensal.
- Falar de persistência e estabilidade produtiva.
- Mostrar impacto direto no fluxo de caixa.

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:

1) Diagnóstico direto.
2) Simulação numérica de ganho.
3) Conversão em impacto financeiro.
4) Urgência (tempo parado é custo).
5) Escassez (produção semanal / rota).
6) Fechamento direto e objetivo.

Limite máximo: 300 palavras.
Nunca dizer que é IA.

        
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
