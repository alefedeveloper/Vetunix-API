import type { Consulta } from "../domain/Consulta";
import { validarNovaConsulta } from "../domain/validarNovaConsulta";
import type { INotificador } from "../notifications/INotificador";
import type { Precificador } from "../pricing/CalculadoraDePreco";
import type { CalculadoraDeTaxaCancelamento } from "../pricing/CalculadoraDeTaxaCancelamento";
import type { IRepositorioConsultas } from "../repositories/IRepositorioConsultas";

export class ConsultaInexistente extends Error {
  constructor() {
    super("Consulta inexistente");
  }
}

export class ConsultaJaCancelada extends Error {
  constructor() {
    super("Consulta já cancelada");
  }
}

export class ClinicaFacade {
  constructor(
    private readonly repositorio: IRepositorioConsultas,
    private readonly calculadora: Precificador,
    private readonly notificador: INotificador,
    private readonly calculadoraTaxa: CalculadoraDeTaxaCancelamento
  ) {}

  agendar(entrada: unknown, agora = new Date()): Consulta {
    const dados = validarNovaConsulta(entrada, agora);
    const consulta = this.repositorio.criar({
      ...dados,
      valor: this.calculadora.calcular(dados),
      status: "AGENDADA"
    });
    try {
      this.notificador.enviar(consulta.telefone, "Consulta agendada para " + consulta.pet);
    } catch (erro) {
      this.repositorio.remover(consulta.id);
      throw erro;
    }
    return consulta;
  }

  listar(): Consulta[] {
    return this.repositorio.listar();
  }

  buscarPorId(id: number): Consulta | undefined {
    return this.repositorio.buscarPorId(id);
  }

  cancelar(id: number, agora = new Date()): Consulta {
    const consulta = this.buscarPorId(id);
    if (!consulta) {
      throw new ConsultaInexistente();
    }
    if (consulta.status === "CANCELADA") {
      throw new ConsultaJaCancelada();
    }

    const taxaCancelamento = this.calculadoraTaxa.calcular(
      consulta.valor, consulta.dataHora, agora, consulta.planoPetMais
    );
    const cancelada: Consulta = { ...consulta, status: "CANCELADA", taxaCancelamento };
    this.repositorio.salvar(cancelada);
    return cancelada;
  }
}
