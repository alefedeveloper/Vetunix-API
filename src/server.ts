import aplicacao from "./app";

const porta = Number(process.env.PORT) || 3000;

aplicacao.listen(porta, () => {
  console.log(`API Vetunix disponível na porta ${porta}`);
});
