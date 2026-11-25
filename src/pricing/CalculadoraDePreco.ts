import type { TipoAtendimento } from "../domain/TipoAtendimento";
import { DescontoPlanoPet } from "./DescontoPlanoPet";
import type { RegraDePreco } from "./RegraDePreco";

export class CalculadoraDePreco {
  constructor(private readonly regras: readonly RegraDePreco[]) {}

  calcular(tipo: TipoAtendimento, planoPetMais = false): number {
    const regra = this.regras.find((regra) => regra.tipo === tipo);
    if (!regra) {
      throw new Error(`Tipo de atendimento não suportado: ${tipo}`);
    }
    return planoPetMais ? new DescontoPlanoPet(regra).calcular() : regra.calcular();
  }
}
