const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <h1>Ariel Nutrição Animal</h1>
    <h2>Atendente Ari online 🦁</h2>
    <p>Sistema em construção...</p>
  `);
});

app.post('/chat', (req, res) => {
  const { mensagem } = req.body;

  res.json({
    resposta: "Shalom! Sou o Ari, atendente da Ariel Nutrição Animal. Como posso ajudar você hoje?"
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
