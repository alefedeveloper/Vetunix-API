import type { Consulta } from "../domain/Consulta";

export interface IRepositorioConsultas {
  salvar(consulta: Consulta): void;
  listar(): Consulta[];
  buscarPorId(id: string): Consulta | undefined;
  remover(id: string): void;
}
