import type { NovaConsulta } from "./Consulta";
import { tipoAtendimentoValido } from "./TipoAtendimento";

export class ErroValidacao extends Error {
  constructor(public readonly erros: string[]) {
    super("Dados da consulta inválidos");
  }
}

function lerData(entrada: unknown): Date | undefined {
  if (entrada instanceof Date) {
    return new Date(entrada);
  }
  if (typeof entrada !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(entrada)) {
    return undefined;
  }

  const dia = entrada.slice(0, 10);
  const calendario = new Date(dia);
  if (!Number.isFinite(calendario.getTime()) || calendario.toISOString().slice(0, 10) !== dia) {
    return undefined;
  }
  return new Date(entrada);
}

export function validarNovaConsulta(entrada: unknown, agora: Date): NovaConsulta {
  const campos = (entrada ?? {}) as Record<string, unknown>;
  const tutor = typeof campos.tutor === "string" ? campos.tutor.trim() : "";
  const telefone = typeof campos.telefone === "string" ? campos.telefone : "";
  const pet = typeof campos.pet === "string" ? campos.pet.trim() : "";
  const { tipo } = campos;
  const dataHora = lerData(campos.dataHora);
  const planoPetMais = campos.planoPetMais === undefined ? false : campos.planoPetMais;
  const erros: string[] = [];

  if (tutor.length < 3) erros.push("Tutor deve ter pelo menos 3 caracteres");
  if (!/^\d{10,11}$/.test(telefone)) erros.push("Telefone deve ter 10 ou 11 dígitos");
  if (!pet) erros.push("Animal é obrigatório");
  if (!tipoAtendimentoValido(tipo)) erros.push("Tipo de atendimento inválido");
  if (!dataHora || !(dataHora.getTime() > agora.getTime())) erros.push("Data deve ser válida e futura");
  if (typeof planoPetMais !== "boolean") erros.push("Plano Pet+ deve ser booleano");

  if (erros.length) throw new ErroValidacao(erros);

  return { tutor, telefone, pet, tipo, dataHora, planoPetMais } as NovaConsulta;
}
