import { createServer } from "node:http";
import aplicacao from "./app";

export function montarServidor() {
  // No exercício, conecte aqui o repositório, as regras e o notificador.
  return createServer(aplicacao);
}
