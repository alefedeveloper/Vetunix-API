import type { Consulta } from "../domain/Consulta";
import type { IRepositorioConsultas } from "./IRepositorioConsultas";

export class RepositorioEmMemoria implements IRepositorioConsultas {
  private readonly consultas = new Map<number, Consulta>();
  private proximoId = 1;

  criar(dados: Omit<Consulta, "id">): Consulta {
    const consulta = { ...dados, id: this.proximoId++ };
    this.salvar(consulta);
    return consulta;
  }

  salvar(consulta: Consulta): void {
    this.consultas.set(consulta.id, consulta);
  }

  listar(): Consulta[] {
    return Array.from(this.consultas.values());
  }

  buscarPorId(id: number): Consulta | undefined {
    return this.consultas.get(id);
  }

  remover(id: number): void {
    this.consultas.delete(id);
  }
}
