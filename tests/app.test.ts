import request from "supertest";
import aplicacao from "../src/app";

describe("API Vetunix", () => {
  it("informa que a API está funcionando", async () => {
    const resposta = await request(aplicacao).get("/status");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ mensagem: "API Vetunix funcionando" });
  });
});
