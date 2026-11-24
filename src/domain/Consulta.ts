export type TipoAtendimento = "consulta" | "vacina" | "cirurgia" | "banhoETosa";

export interface NovaConsulta {
  tutor: string;
  telefone: string;
  animal: string;
  tipoAtendimento: TipoAtendimento;
  data: Date;
  planoPetMais: boolean;
}

export interface Consulta extends NovaConsulta {
  id: string;
  valor: number;
}
