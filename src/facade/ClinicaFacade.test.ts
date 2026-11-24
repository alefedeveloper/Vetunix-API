import type { NovaConsulta } from "../domain/Consulta";
import { ZapAdapter } from "../notifications/ZapAdapter";
import { CalculadoraDePreco } from "../pricing/CalculadoraDePreco";
import { CalculadoraDeTaxaCancelamento } from "../pricing/CalculadoraDeTaxaCancelamento";
import { DescontoPlanoPet } from "../pricing/DescontoPlanoPet";
import { regraConsulta } from "../pricing/regras";
import { RepositorioEmMemoria } from "../repositories/RepositorioEmMemoria";
import { ClinicaFacade } from "./ClinicaFacade";

const agora = new Date("2040-05-10T12:00:00Z");
const dados: NovaConsulta = {
  tutor: "Maria",
  telefone: "11912345678",
  pet: "Luna",
  tipo: "CONSULTA",
  dataHora: new Date("2040-05-10T13:00:00Z"),
  planoPetMais: false
};

function prepararFacade() {
  const enviar = jest.fn();
  const precificador = new DescontoPlanoPet(new CalculadoraDePreco([regraConsulta]));
  const facade = new ClinicaFacade(
    new RepositorioEmMemoria(), precificador, { enviar }, new CalculadoraDeTaxaCancelamento()
  );
  return { facade, enviar };
}

describe("ClinicaFacade", () => {
  it("persiste a consulta e envia uma única notificação", () => {
    const { facade, enviar } = prepararFacade();
    const consulta = facade.cadastrar(dados, agora);

    expect(facade.buscarPorId(consulta.id)).toEqual(consulta);
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar).toHaveBeenCalledWith(dados.telefone, "Consulta agendada para Luna");
  });

  it("não registra nem notifica dados inválidos", () => {
    const { facade, enviar } = prepararFacade();
    expect(() => facade.cadastrar({ ...dados, tutor: "Li" }, agora)).toThrow("Dados da consulta inválidos");
    expect(enviar).not.toHaveBeenCalled();
    expect(facade.listar()).toEqual([]);
  });

  it("calcula R$ 96 para consulta com Pet+", () => {
    const { facade } = prepararFacade();
    expect(facade.cadastrar({ ...dados, planoPetMais: true }, agora).valor).toBe(96);
  });

  it("lança erro ao cancelar uma consulta inexistente", () => {
    const { facade } = prepararFacade();
    expect(() => facade.cancelar("ausente", agora)).toThrow("Consulta inexistente");
  });

  it("guarda o status cancelado e cobra a taxa sobre o valor registrado", () => {
    const { facade } = prepararFacade();
    const consulta = facade.cadastrar({ ...dados, planoPetMais: true }, agora);
    const cancelada = facade.cancelar(consulta.id, agora);
    expect(cancelada).toMatchObject({ status: "CANCELADA", taxaCancelamento: 24 });
    expect(facade.buscarPorId(consulta.id)).toEqual(cancelada);
    expect(() => facade.cancelar(consulta.id, agora)).toThrow("Consulta já cancelada");
  });

  it("desfaz o cadastro quando o notificador falha", () => {
    const { facade, enviar } = prepararFacade();
    enviar.mockImplementation(() => { throw new Error("Falha ao notificar"); });
    expect(() => facade.cadastrar(dados, agora)).toThrow("Falha ao notificar");
    expect(facade.listar()).toEqual([]);
  });

  it("lança erro quando o tipo não tem regra cadastrada", () => {
    const { facade, enviar } = prepararFacade();
    expect(() => facade.cadastrar({ ...dados, tipo: "VACINA" }, agora))
      .toThrow("Regra de preço não encontrada");
    expect(enviar).not.toHaveBeenCalled();
  });
});

describe("ZapAdapter", () => {
  it("inverte os argumentos e acrescenta o DDI 55", () => {
    const enviarMensagem = jest.fn().mockReturnValue(true);
    new ZapAdapter({ enviarMensagem }).enviar("11912345678", "Aviso");

    expect(enviarMensagem).toHaveBeenCalledWith("Aviso", "5511912345678");
  });

  it("lança o erro combinado quando o SDK retorna false", () => {
    const enviarMensagem = jest.fn().mockReturnValue(false);
    expect(() => new ZapAdapter({ enviarMensagem }).enviar("11912345678", "Aviso"))
      .toThrow("Falha ao notificar");
  });

  it("lança o erro combinado quando o SDK lança uma exceção", () => {
    const enviarMensagem = jest.fn(() => { throw new Error("Erro do SDK"); });
    expect(() => new ZapAdapter({ enviarMensagem }).enviar("11912345678", "Aviso"))
      .toThrow("Falha ao notificar");
  });
});
