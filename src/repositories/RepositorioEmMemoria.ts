import type { Consulta } from "../domain/Consulta";
import type { IRepositorioConsultas } from "./IRepositorioConsultas";

export class RepositorioEmMemoria implements IRepositorioConsultas {
  private readonly consultas = new Map<string, Consulta>();

  salvar(consulta: Consulta): void {
    this.consultas.set(consulta.id, consulta);
  }

  listar(): Consulta[] {
    return Array.from(this.consultas.values());
  }

  buscarPorId(id: string): Consulta | undefined {
    return this.consultas.get(id);
  }

  remover(id: string): void {
    this.consultas.delete(id);
  }
}
