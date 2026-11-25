import { criarApp } from "./app";
import { montarFacade } from "./montagem";
import { TipoAtendimento } from "./domain/TipoAtendimento";

const porta = Number(process.env.PORT) || 3000;
const facade = montarFacade();

if (process.argv.includes("--demonstracao")) {
  const dados = {
    tutor: "Ana",
    telefone: "31999990000",
    dataHora: new Date(Date.now() + 48 * 3_600_000)
  };
  const exemplos = [
    { pet: "Thor", tipo: TipoAtendimento.CONSULTA, planoPetMais: false },
    { pet: "Luna", tipo: TipoAtendimento.VACINA, planoPetMais: true },
    { pet: "Nina", tipo: TipoAtendimento.BANHO_TOSA, planoPetMais: false }
  ];
  for (const exemplo of exemplos) {
    const { id, tipo, valor } = facade.agendar({ ...dados, ...exemplo });
    console.log(`Agendamento ${id}: ${tipo} — R$ ${valor.toFixed(2)}`);
  }
}

criarApp(facade).listen(porta, () => {
  console.log(`API Vetunix disponível na porta ${porta}`);
});
