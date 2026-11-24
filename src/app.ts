import express from "express";
import type { ErrorRequestHandler } from "express";
import { ErroValidacao } from "./domain/validarNovaConsulta";
import { ConsultaInexistente, ConsultaJaCancelada } from "./facade/ClinicaFacade";
import type { ClinicaFacade } from "./facade/ClinicaFacade";

const tratarErro: ErrorRequestHandler = (erro, _requisicao, resposta, _proximo) => {
  if (erro instanceof ErroValidacao) {
    resposta.status(400).json({ erros: erro.erros });
  } else if (erro instanceof ConsultaInexistente) {
    resposta.status(404).json({ mensagem: erro.message });
  } else if (erro instanceof ConsultaJaCancelada) {
    resposta.status(409).json({ mensagem: erro.message });
  } else if (erro instanceof SyntaxError && "type" in erro && erro.type === "entity.parse.failed") {
    resposta.status(400).json({ erros: ["JSON inválido"] });
  } else {
    resposta.status(500).json({ mensagem: "Erro interno" });
  }
};

export function criarApp(facade: ClinicaFacade) {
  const aplicacao = express();
  aplicacao.use(express.json());

  aplicacao.get("/status", (_requisicao, resposta) => {
    resposta.status(200).json({ mensagem: "API Vetunix funcionando" });
  });

  aplicacao.post("/consultas", (requisicao, resposta) => {
    resposta.status(201).json(facade.cadastrar(requisicao.body));
  });

  aplicacao.get("/consultas", (_requisicao, resposta) => {
    resposta.status(200).json(facade.listar());
  });

  aplicacao.get("/consultas/:id", (requisicao, resposta) => {
    const { id } = requisicao.params;
    const idValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!idValido.test(id)) {
      resposta.status(400).json({ mensagem: "ID inválido" });
      return;
    }
    const consulta = facade.buscarPorId(id.toLowerCase());
    if (!consulta) {
      throw new ConsultaInexistente();
    }
    resposta.status(200).json(consulta);
  });

  aplicacao.delete("/consultas/:id", (requisicao, resposta) => {
    const cancelada = facade.cancelar(requisicao.params.id.toLowerCase());
    resposta.status(200).json(cancelada);
  });

  aplicacao.use(tratarErro);
  return aplicacao;
}
