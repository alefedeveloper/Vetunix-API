import type { NovaConsulta } from "../domain/Consulta";
import type { RegraDePreco } from "./RegraDePreco";

export class CalculadoraDePreco {
  constructor(private readonly regras: readonly RegraDePreco[]) {}

  calcular(consulta: NovaConsulta): number {
    const regra = this.regras.find((regra) => regra.tipoAtendimento === consulta.tipoAtendimento);
    if (!regra) {
      throw new Error("Regra de preço não encontrada");
    }
    return regra.calcular(consulta);
  }
}
