# Vetunix

Projeto de Engenharia de Software II para agendar, listar, buscar e cancelar
consultas veterinárias. A API calcula preços, descontos e taxas de cancelamento
e simula notificações. Os dados ficam em memória.

## Integrantes

- Álefe Lucas Mendes Neves
- Erik Jason Gomes Miranda

## Como executar

Use Node.js 22 ou superior. O projeto usa TypeScript, Express, Jest, ts-jest,
Supertest e Docker.

```powershell
npm ci
npm run dev
```

A API escuta na porta 3000. Para executar a compilação, use
`npm run build` e depois `npm start`.

## Rotas

| Método e rota | Sucesso | Erros |
| --- | --- | --- |
| `GET /status` | 200 | |
| `POST /consultas` | 201 com a consulta agendada | 400 para dados inválidos |
| `GET /consultas` | 200 com a lista | |
| `GET /consultas/:id` | 200 com a consulta | 400 para ID inválido, 404 para ID ausente |
| `DELETE /consultas/:id` | 200 com a consulta cancelada e a taxa | 400 para ID inválido, 404 para ID ausente, 409 se já cancelada |

O repositório gera IDs inteiros sequenciais. Envie `tutor`, `telefone`,
`pet`, `tipo`, `dataHora` futura em ISO 8601 e, opcionalmente,
`planoPetMais` (padrão `false`). Uma data como `2030-01-10T14:00:00` usa o
horário local do servidor. Também são aceitos `Z` e deslocamentos explícitos.

## Demonstração da Parte 1

`npm run dev` agenda três exemplos e exibe os avisos simulados: consulta
de R$ 120, vacina com Pet+ de R$ 64 e banho e tosa de R$ 65. Confira os IDs
1, 2 e 3 em `GET /consultas`. O servidor compilado e o contêiner iniciam
com a lista vazia.

Os preços-base são R$ 120 para `CONSULTA`, R$ 80 para `VACINA`, R$ 540
para `CIRURGIA` e R$ 65 para `BANHO_TOSA`. O Pet+ reduz o preço em 20% e
reduz pela metade a taxa de cancelamento. A taxa sobre o valor registrado é
0% com pelo menos 24 h, 30% de 2 h até menos de 24 h, 50% acima de zero e
abaixo de 2 h, e 100% a partir do início.

## Testes

```powershell
npm run build
npm test
npm run test:coverage
```

A compilação passou e foram aprovados **41 testes em 3 suítes**. A cobertura
foi de 81,93% das instruções, 78,75% das ramificações, 92,15% das funções e
84,61% das linhas. A cobertura de ramificações foi de 92,30% em `pricing` e
100% em `facade`, acima da meta de 80% em ambas. O relatório HTML fica em
`coverage/lcov-report/index.html`.

## Docker

Com a porta 3000 livre:

```powershell
docker build -t vetunix .
docker run --rm -p 3000:3000 vetunix
```

A imagem revisada foi construída no Docker Engine 29.9.3. O teste HTTP em
contêiner confirmou o agendamento com data ISO sem fuso, a listagem, a busca
por ID, o cancelamento e o aviso simulado. O contêiner de teste foi removido.

## Conceitos aplicados e desenvolvimento

O projeto aplica Clean Code, SOLID, Adapter, Decorator e Facade.
`montarFacade` conecta o repositório em memória, a calculadora de preços e
o notificador à Facade. A calculadora seleciona uma regra pelo tipo e usa
`DescontoPlanoPet` para decorar essa regra. `ZapAdapter` traduz a chamada
para `ZapLegacySDK.dispararMsg`. O legado e o SDK vieram do roteiro da
Parte 1. Os testes usam mocks e Supertest.

O estudante informou que o professor autorizou o uso de IA. O Codex auxiliou
na implementação, nos testes e nas verificações. Os commits identificam seus
autores. Aprovações de Pull Requests, revisões da dupla e registros de TDD
dependem das atividades realmente realizadas.
