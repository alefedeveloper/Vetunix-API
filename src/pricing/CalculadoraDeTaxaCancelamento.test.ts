import { CalculadoraDeTaxaCancelamento } from "./CalculadoraDeTaxaCancelamento";

const inicio = new Date("2040-05-10T12:00:00Z");
const calculadora = new CalculadoraDeTaxaCancelamento();

describe("Taxa de cancelamento para uma consulta de R$ 120", () => {
  it.each([
    ["48 horas antes", 48 * 60, false, 0],
    ["24 horas exatas", 24 * 60, false, 0],
    ["23 horas e 59 minutos antes", 23 * 60 + 59, false, 36],
    ["2 horas exatas", 2 * 60, false, 36],
    ["1 hora e 59 minutos antes", 119, false, 60],
    ["na hora da consulta", 0, false, 120],
    ["1 hora antes com Pet+", 60, true, 30],
    ["após o início", -1, false, 120]
  ])("calcula a taxa %s", (_caso, minutosAntes, planoPetMais, taxa) => {
    const momentoCancelamento = new Date(inicio.getTime() - minutosAntes * 60_000);
    expect(calculadora.calcular(120, inicio, momentoCancelamento, planoPetMais)).toBe(taxa);
  });

  it.each([0, -120, NaN])("rejeita o valor %s", (valor) => {
    expect(() => calculadora.calcular(valor, inicio, inicio, false)).toThrow("Valor inválido");
  });
});
