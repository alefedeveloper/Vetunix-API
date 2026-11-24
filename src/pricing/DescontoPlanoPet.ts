import type { NovaConsulta } from "../domain/Consulta";
import type { Precificador } from "./CalculadoraDePreco";

export class DescontoPlanoPet implements Precificador {
  constructor(private readonly calculadora: Precificador) {}

  calcular(consulta: NovaConsulta): number {
    const valor = this.calculadora.calcular(consulta);
    return consulta.planoPetMais ? valor * 0.8 : valor;
  }
}
