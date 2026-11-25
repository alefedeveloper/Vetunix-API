import type { Consulta } from "../domain/Consulta";
import { validarNovaConsulta } from "../domain/validarNovaConsulta";
import type { INotificador } from "../notifications/INotificador";
import type { CalculadoraDePreco } from "../pricing/CalculadoraDePreco";
import { CalculadoraDeTaxaCancelamento } from "../pricing/CalculadoraDeTaxaCancelamento";
import type { IRepositorioConsultas } from "../repositories/IRepositorioConsultas";

const calculadoraTaxaPadrao = new CalculadoraDeTaxaCancelamento();

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
    private readonly calculadora: CalculadoraDePreco,
    private readonly notificador: INotificador,
    private readonly calculadoraTaxa = calculadoraTaxaPadrao
  ) {}

  agendar(entrada: unknown, agora = new Date()): Consulta {
    const dados = validarNovaConsulta(entrada, agora);
    const consulta = this.repositorio.salvar({
      ...dados,
      valor: this.calculadora.calcular(dados.tipo, dados.planoPetMais),
      status: "AGENDADA"
    });
    const data = consulta.dataHora.toLocaleDateString("pt-BR");
    const hora = consulta.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const valor = consulta.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.notificador.enviar(
      consulta.telefone,
      `Olá ${consulta.tutor}! A consulta do ${consulta.pet} foi agendada para ${data} ${hora}. Valor: R$ ${valor}`
    );
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
    this.repositorio.atualizar(cancelada);
    return cancelada;
  }
}
