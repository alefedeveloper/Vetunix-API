export class CalculadoraDeTaxaCancelamento {
  calcular(valor: number, inicio: Date, momentoCancelamento: Date, planoPetMais: boolean): number {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new Error("Valor inválido");
    }

    const horasRestantes = (inicio.getTime() - momentoCancelamento.getTime()) / 3_600_000;
    let percentual = 1;
    if (horasRestantes >= 24) {
      percentual = 0;
    } else if (horasRestantes >= 2) {
      percentual = 0.3;
    } else if (horasRestantes > 0) {
      percentual = 0.5;
    }

    if (planoPetMais) {
      percentual /= 2;
    }
    return Math.round(valor * percentual * 100) / 100;
  }
}
