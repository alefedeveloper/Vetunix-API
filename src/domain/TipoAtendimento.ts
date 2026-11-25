export enum TipoAtendimento {
  CONSULTA = "CONSULTA",
  VACINA = "VACINA",
  CIRURGIA = "CIRURGIA",
  BANHO_TOSA = "BANHO_TOSA"
}

export function tipoAtendimentoValido(tipo: unknown): tipo is TipoAtendimento {
  return Object.values(TipoAtendimento).some((tipoPermitido) => tipoPermitido === tipo);
}
