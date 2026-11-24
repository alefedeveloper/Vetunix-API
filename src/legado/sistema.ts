// Código legado preservado para comparar com a versão organizada.
export function marcarConsultaAntiga(tutor: string, telefone: string): string {
  if (tutor === "") {
    return "Erro";
  }

  console.log("Aviso para " + telefone + ": consulta marcada para " + tutor);
  return tutor + ";120";
}

export function avisarAntigo(mensagem: string, destino: string): void {
  console.log("Aviso simulado para " + destino + ": " + mensagem);
}
