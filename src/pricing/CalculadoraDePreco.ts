import type { NovaConsulta } from "../domain/Consulta";
import type { RegraDePreco } from "./RegraDePreco";

export interface Precificador {
  calcular(consulta: NovaConsulta): number;
}

export class CalculadoraDePreco implements Precificador {
  constructor(private readonly regras: readonly RegraDePreco[]) {}

  calcular(consulta: NovaConsulta): number {
    const regra = this.regras.find((regra) => regra.tipoAtendimento === consulta.tipo);
    if (!regra) {
      throw new Error("Regra de preço não encontrada");
    }
    return regra.calcular(consulta);
  }
}
