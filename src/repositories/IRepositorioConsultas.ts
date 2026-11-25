import type { Consulta } from "../domain/Consulta";

export interface IRepositorioConsultas {
  criar(consulta: Omit<Consulta, "id">): Consulta;
  salvar(consulta: Consulta): void;
  listar(): Consulta[];
  buscarPorId(id: number): Consulta | undefined;
  remover(id: number): void;
}
