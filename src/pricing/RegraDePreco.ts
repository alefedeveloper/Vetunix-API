import type { NovaConsulta, TipoAtendimento } from "../domain/Consulta";

export interface RegraDePreco {
  tipoAtendimento: TipoAtendimento;
  calcular(consulta: NovaConsulta): number;
}
