import { criarApp } from "./app";
import { montarFacade } from "./montagem";

const porta = Number(process.env.PORT) || 3000;
criarApp(montarFacade()).listen(porta, () => {
  console.log(`API Vetunix disponível na porta ${porta}`);
});
