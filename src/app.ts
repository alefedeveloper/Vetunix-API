import express from "express";

const aplicacao = express();

aplicacao.use(express.json());

aplicacao.get("/status", (_requisicao, resposta) => {
  resposta.status(200).json({ mensagem: "API Vetunix funcionando" });
});

export default aplicacao;
