export const tiposAtendimento = ["CONSULTA", "VACINA", "CIRURGIA", "BANHO_TOSA"] as const;

export type TipoAtendimento = (typeof tiposAtendimento)[number];

export function tipoAtendimentoValido(tipo: unknown): tipo is TipoAtendimento {
  return tiposAtendimento.some((tipoPermitido) => tipoPermitido === tipo);
}
