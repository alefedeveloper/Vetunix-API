import request from "supertest";
import { criarApp } from "../src/app";
import { montarFacade } from "../src/montagem";

describe("API Vetunix", () => {
  let api: ReturnType<typeof request>;

  function dadosValidos() {
    return {
      tutor: "Maria",
      telefone: "11912345678",
      pet: "Luna",
      tipo: "CONSULTA",
      dataHora: new Date(Date.now() + 48 * 3_600_000).toISOString()
    };
  }

  beforeEach(() => {
    api = request(criarApp(montarFacade()));
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("informa que a API está funcionando", async () => {
    await api.get("/status").expect(200, { mensagem: "API Vetunix funcionando" });
  });

  it("cadastra consulta válida com ID, status e padrão Pet+", async () => {
    const dados = dadosValidos();
    const resposta = await api.post("/consultas").send(dados).expect(201);
    expect(resposta.body).toMatchObject({ ...dados, planoPetMais: false, status: "AGENDADA" });
    expect(resposta.body.id).toBe(1);
    const proxima = await api.post("/consultas").send({ ...dados, id: 999 }).expect(201);
    expect(proxima.body.id).toBe(2);
  });

  it.each([
    ["CONSULTA", 120],
    ["VACINA", 80],
    ["CIRURGIA", 540],
    ["BANHO_TOSA", 65]
  ])("calcula o preço de %s e ignora campos extras", async (tipo, valor) => {
    const resposta = await api.post("/consultas")
      .send({ ...dadosValidos(), tipo, valor: 1, status: "CANCELADA", extra: true })
      .expect(201);
    expect(resposta.body).toMatchObject({ valor, status: "AGENDADA" });
    expect(resposta.body).not.toHaveProperty("extra");
  });

  it("aceita a data ISO sem fuso do roteiro como horário local", async () => {
    const ano = new Date().getFullYear() + 1;
    const dataHora = `${ano}-01-10T14:00:00`;
    const resposta = await api.post("/consultas").send({ ...dadosValidos(), dataHora }).expect(201);

    expect(resposta.body.dataHora).toBe(new Date(ano, 0, 10, 14).toISOString());
  });

  it.each([
    ["telefone", "11A12345678", "Telefone deve ter 10 ou 11 dígitos"],
    ["tipo", "EXAME", "Tipo de atendimento inválido"],
    ["dataHora", "2000-01-01T12:00:00Z", "Data deve ser válida e futura"],
    ["dataHora", "2099-02-29T12:00:00Z", "Data deve ser válida e futura"],
    ["planoPetMais", "true", "Plano Pet+ deve ser booleano"]
  ])("rejeita %s com valor %s", async (campo, valor, erro) => {
    const resposta = await api.post("/consultas").send({ ...dadosValidos(), [campo]: valor }).expect(400);
    expect(resposta.body.erros).toEqual([erro]);
  });

  it("retorna todos os erros obrigatórios para um corpo vazio", async () => {
    const resposta = await api.post("/consultas").send({}).expect(400);
    expect(resposta.body.erros).toEqual([
      "Tutor deve ter pelo menos 3 caracteres",
      "Telefone deve ter 10 ou 11 dígitos",
      "Animal é obrigatório",
      "Tipo de atendimento inválido",
      "Data deve ser válida e futura"
    ]);
  });

  it("rejeita JSON malformado", async () => {
    const resposta = await api.post("/consultas").type("json").send("{").expect(400);
    expect(resposta.body.erros).toEqual(["JSON inválido"]);
  });

  it("lista as consultas cadastradas", async () => {
    await api.get("/consultas").expect(200, []);
    const cadastro = await api.post("/consultas").send(dadosValidos()).expect(201);
    await api.get("/consultas").expect(200, [cadastro.body]);
  });

  it("busca a consulta pelo ID", async () => {
    const cadastro = await api.post("/consultas").send(dadosValidos()).expect(201);
    await api.get("/consultas/" + cadastro.body.id).expect(200, cadastro.body);
  });

  it("rejeita um ID malformado na busca", async () => {
    for (const id of ["abc", "0", "-1", "1.5", "1e2", "9007199254740992"]) {
      await api.get("/consultas/" + id).expect(400, { mensagem: "ID inválido" });
      await api.delete("/consultas/" + id).expect(400, { mensagem: "ID inválido" });
    }
  });

  it("retorna 404 ao buscar ou cancelar um ID inexistente", async () => {
    const caminho = "/consultas/999";
    await api.get(caminho).expect(404);
    await api.delete(caminho).expect(404);
  });

  it("retorna a taxa no cancelamento e 409 quando ele é repetido", async () => {
    const dataHora = new Date(Date.now() + 3_600_000).toISOString();
    const cadastro = await api.post("/consultas").send({ ...dadosValidos(), dataHora }).expect(201);
    const caminho = "/consultas/" + cadastro.body.id;
    const cancelamento = await api.delete(caminho).expect(200);
    expect(cancelamento.body).toMatchObject({ status: "CANCELADA", taxaCancelamento: 60 });
    await api.get(caminho).expect(200, cancelamento.body);
    await api.delete(caminho).expect(409);
  });
});
