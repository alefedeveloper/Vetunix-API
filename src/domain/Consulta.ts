import type { TipoAtendimento } from "./TipoAtendimento";

export type { TipoAtendimento } from "./TipoAtendimento";

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
  status: "AGENDADA" | "CANCELADA";
  taxaCancelamento?: number;
}
