# ari-backend

Backend do Ari, atendente/consultor técnico da Ariel Nutrição Animal. API Express que chama a OpenAI com o prompt `DNA_ARI`.

## Stack
- Node.js (CommonJS), Express, `openai`, `cors`
- Tudo em `index.js` (sem build, sem testes ainda)

## Comandos
- `npm install` — instala dependências
- `npm start` — sobe o servidor (porta `PORT`, padrão 8080)
- `npm run check` — verifica sintaxe do `index.js`

## Variáveis de ambiente
- `OPENAI_API_KEY` — obrigatória
- `PORT` — opcional
- `SHEETS_URL` — opcional; URL do Google Apps Script que salva os diagnósticos na planilha

## Rotas
- `GET /` e `GET /health` — status
- `GET /test-produtor` — teste fixo do Ari
- `POST /diagnostico` — body: `nome, cidade, tipo, peso, pasto, objetivo`
- `POST /chat` — body: `pergunta`

## Convenções
- Textos, prompts e mensagens em português, linguagem de fazenda
- Respostas do Ari sem markdown (regra do `DNA_ARI`)
- Cálculos: período de 90 dias, arroba = 15 kg, arroba = R$ 300
- Ganho/dia: pasto fraco 0,3 / médio 0,5 / bom + suplemento 0,9 kg
- Rodar `npm run check` antes de commitar
