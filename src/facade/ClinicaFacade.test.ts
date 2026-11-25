import { TipoAtendimento, type NovaConsulta } from "../domain/Consulta";
import { ZapAdapter } from "../notifications/ZapAdapter";
import { CalculadoraDePreco } from "../pricing/CalculadoraDePreco";
import { DescontoPlanoPet } from "../pricing/DescontoPlanoPet";
import { PrecoConsulta } from "../pricing/regras";
import { RepositorioEmMemoria } from "../repositories/RepositorioEmMemoria";
import { ClinicaFacade } from "./ClinicaFacade";

const agora = new Date(2040, 4, 10, 12);
const dados: NovaConsulta = {
  tutor: "Maria",
  telefone: "11912345678",
  pet: "Luna",
  tipo: TipoAtendimento.CONSULTA,
  dataHora: new Date(2040, 4, 10, 13),
  planoPetMais: false
};

function prepararFacade() {
  const enviar = jest.fn();
  const calculadora = new CalculadoraDePreco([new PrecoConsulta()]);
  const facade = new ClinicaFacade(new RepositorioEmMemoria(), calculadora, { enviar });
  return { facade, enviar };
}

describe("ClinicaFacade", () => {
  it("persiste a consulta e envia uma única notificação", () => {
    const { facade, enviar } = prepararFacade();
    const consulta = facade.agendar(dados, agora);

    expect(facade.buscarPorId(consulta.id)).toEqual(consulta);
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar).toHaveBeenCalledWith(
      dados.telefone,
      "Olá Maria! A consulta do Luna foi agendada para 10/05/2040 13:00. Valor: R$ 120,00"
    );
  });

  it("não registra nem notifica dados inválidos", () => {
    const { facade, enviar } = prepararFacade();
    expect(() => facade.agendar({ ...dados, tutor: "Li" }, agora)).toThrow("Dados da consulta inválidos");
    expect(enviar).not.toHaveBeenCalled();
    expect(facade.listar()).toEqual([]);
  });

  it("calcula R$ 96 para consulta com Pet+", () => {
    const { facade } = prepararFacade();
    expect(facade.agendar({ ...dados, planoPetMais: true }, agora).valor).toBe(96);
  });

  it("lança erro ao cancelar uma consulta inexistente", () => {
    const { facade } = prepararFacade();
    expect(() => facade.cancelar(999, agora)).toThrow("Consulta inexistente");
  });

  it("guarda o status cancelado e cobra a taxa sobre o valor registrado", () => {
    const { facade } = prepararFacade();
    const consulta = facade.agendar({ ...dados, planoPetMais: true }, agora);
    const cancelada = facade.cancelar(consulta.id, agora);
    expect(cancelada).toMatchObject({ status: "CANCELADA", taxaCancelamento: 24 });
    expect(facade.buscarPorId(consulta.id)).toEqual(cancelada);
    expect(() => facade.cancelar(consulta.id, agora)).toThrow("Consulta já cancelada");
  });

  it("propaga falha da notificação após salvar a consulta", () => {
    const { facade, enviar } = prepararFacade();
    enviar.mockImplementation(() => { throw new Error("Falha ao notificar"); });
    expect(() => facade.agendar(dados, agora)).toThrow("Falha ao notificar");
    expect(facade.listar()).toMatchObject([{ id: 1, status: "AGENDADA" }]);
  });

  it("lança erro quando o tipo não tem regra cadastrada", () => {
    const { facade, enviar } = prepararFacade();
    expect(() => facade.agendar({ ...dados, tipo: "VACINA" }, agora))
      .toThrow("Tipo de atendimento não suportado: VACINA");
    expect(enviar).not.toHaveBeenCalled();
  });
});

describe("DescontoPlanoPet", () => {
  it("preserva o tipo da regra original e calcula o preço com desconto", () => {
    const regra = new DescontoPlanoPet(new PrecoConsulta());
    expect(regra.tipo).toBe(TipoAtendimento.CONSULTA);
    expect(regra.calcular()).toBe(96);
  });
});

describe("ZapAdapter", () => {
  it("acrescenta o DDI 55 e adapta a mensagem ao payload do SDK", () => {
    const dispararMsg = jest.fn().mockReturnValue({ ok: true });
    new ZapAdapter({ dispararMsg }).enviar("11912345678", "Aviso");

    expect(dispararMsg).toHaveBeenCalledWith("5511912345678", { txt: "Aviso" });
  });

  it("lança o erro combinado quando o SDK retorna ok: false", () => {
    const dispararMsg = jest.fn().mockReturnValue({ ok: false });
    expect(() => new ZapAdapter({ dispararMsg }).enviar("11912345678", "Aviso"))
      .toThrow("Falha ao notificar");
  });

  it("lança o erro combinado quando o SDK lança uma exceção", () => {
    const dispararMsg = jest.fn(() => { throw new Error("Erro do SDK"); });
    expect(() => new ZapAdapter({ dispararMsg }).enviar("11912345678", "Aviso"))
      .toThrow("Falha ao notificar");
  });
});
