import request from "supertest";
import { criarApp } from "../src/app";
import { montarFacade } from "../src/montagem";

describe("API Vetunix", () => {
  it("informa que a API está funcionando", async () => {
    const resposta = await request(criarApp(montarFacade())).get("/status");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ mensagem: "API Vetunix funcionando" });
  });
});
