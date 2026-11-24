import { montarServidor } from "./montagem";

const porta = Number(process.env.PORT) || 3000;

montarServidor().listen(porta, () => {
  console.log(`API Vetunix disponível na porta ${porta}`);
});
