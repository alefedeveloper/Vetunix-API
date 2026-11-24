import type { RegraDePreco } from "./RegraDePreco";

export const regraConsulta: RegraDePreco = {
  tipoAtendimento: "CONSULTA",
  calcular: () => 120
};

export const regraVacina: RegraDePreco = {
  tipoAtendimento: "VACINA",
  calcular: () => 80
};

export const regraCirurgia: RegraDePreco = {
  tipoAtendimento: "CIRURGIA",
  calcular: () => 540
};
