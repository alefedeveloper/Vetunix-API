# Vetunix — Engenharia de Software II

O Vetunix é um exercício de agendamento veterinário inspirado no AgendaVet. Na
Parte 1, a equipe organiza o domínio e aplica SOLID e padrões de projeto. Na
Parte 2, cria a API REST e verifica as regras com testes. Os dados ficam em
memória e as notificações são simuladas.

## Executar no PowerShell

Use Node.js 22 ou superior, npm e Git. O projeto usa TypeScript, Express, Jest,
ts-jest e Supertest. Docker Desktop é necessário apenas para a etapa de contêiner.

```powershell
Set-Location C:\vetunix
npm install
npm run dev
```

Em outro terminal, execute `Invoke-RestMethod http://localhost:3000/status`.
A rota inicial responde HTTP 200 com `{"mensagem":"API Vetunix funcionando"}`.
Pressione Ctrl+C para parar o servidor. Para executar a versão compilada, use
`npm run build` e depois `npm start`.

```powershell
npm test
npm run test:watch
npm run test:coverage
```

O relatório HTML fica em `coverage/lcov-report/index.html`.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/domain/` | Tipos de atendimento e dados da consulta. |
| `src/pricing/` | Contrato das regras, calculadora e taxas de cancelamento. |
| `src/repositories/` | Contrato e, no exercício, armazenamento em memória. |
| `src/notifications/` | Contrato e, no exercício, notificação simulada. |
| `src/facade/` | Operações que a API usará. |
| `src/libs/` | Adapter e Decorator do exercício. |
| `src/legado/` | Exemplo de código para análise e adaptação. |
| `src/montagem.ts` | Ponto para conectar as dependências e montar o servidor. |
| `src/app.ts` | Aplicação Express que o Supertest pode importar. |
| `src/index.ts` | Inicia o servidor. |
| `tests/` | Teste inicial de status e futuros testes dos exercícios. |

## Parte 1 — Organização do sistema

1. **Leia o legado.** Em `src/legado/agendaAntiga.ts`, identifique a mistura de
   validação, preço e aviso, o valor fixo e os retornos difíceis de interpretar.
   Anote quais responsabilidades podem ser testadas separadamente.
2. **Organize o domínio.** Use `TipoAtendimento`, `NovaConsulta` e `Consulta`
   de `src/domain/Consulta.ts`. Uma consulta cadastrada tem ID e valor. A data
   é um objeto `Date` dentro do sistema.
3. **Calcule o preço.** Crie a classe `CalculadoraDePreco` em
   `src/pricing/CalculadoraDePreco.ts`, com `calcular(consulta: NovaConsulta): number`.
   Receba as regras `RegraDePreco` pelo construtor e selecione a regra pelo tipo.
   Comece por consulta, vacina e cirurgia. Depois registre a regra de banho e
   tosa na montagem e comprove que a calculadora aceita o novo preço sem edição.
4. **Armazene as consultas.** Implemente `IRepositorioConsultas` em memória.
   Teste salvar, listar, buscar um ID ausente e remover.
5. **Simule o aviso.** Implemente `INotificador`. Crie um **Adapter** que
   recebe `enviar(telefone, mensagem)` e chama `avisarAntigo(mensagem, telefone)`.
   Crie um **Decorator** que implementa o mesmo contrato, registra uma mensagem
   e delega ao notificador recebido.
6. **Reúna as operações.** Crie `ClinicaFacade` em `src/facade/ClinicaFacade.ts`.
   Injete o repositório, a calculadora e o notificador. Exponha
   `cadastrar(dados: NovaConsulta): Consulta`, `listar(): Consulta[]` e
   `buscarPorId(id: string): Consulta | undefined`. No cadastro, gere o ID,
   calcule o valor, salve e dispare o aviso simulado. Na Parte 2, acrescente
   `cancelar(id: string, agora: Date): number | undefined`, que devolve a taxa
   em reais ou `undefined` para ID ausente. Calcule a taxa antes de remover.

| Atendimento | Código | Preço |
| --- | --- | ---: |
| Consulta | `consulta` | R$ 120 |
| Vacina | `vacina` | R$ 80 |
| Cirurgia | `cirurgia` | R$ 540 |
| Banho e tosa | `banhoETosa` | R$ 65 |

O plano Pet+ concede **20% de desconto** no preço do atendimento.

| Princípio | Como praticar |
| --- | --- |
| SRP — Responsabilidade única | Separe preço, armazenamento, aviso e HTTP. |
| OCP — Aberto para extensão | Cadastre a regra de banho e tosa sem editar a calculadora. |
| LSP — Substituição de Liskov | Troque o notificador simples pelo decorado e confira se o aviso ainda é entregue uma vez. |
| ISP — Segregação de interfaces | Mantenha o contrato de envio separado do contrato de armazenamento. |
| DIP — Inversão de dependência | Faça a Facade receber o repositório e o notificador pelos respectivos contratos. |

A **Facade** oferece operações de cadastro e consulta ao Express. O Adapter
traduz uma interface existente. O Decorator mantém a interface e acrescenta
um comportamento ao delegar. Como exemplo independente de Adapter, um cliente
que trabalha em minutos pode usar um temporizador que recebe milissegundos:

```typescript
function agendarEmMinutos(minutos: number, avisar: () => void) {
  setTimeout(avisar, minutos * 60 * 1000);
}
```

## Parte 2 — API, cancelamento e testes

### Validação do cadastro

- `tutor` deve ser texto com pelo menos três caracteres após remover espaços das extremidades.
- `telefone` deve ser texto com 10 ou 11 dígitos e somente dígitos.
- `animal` deve ser texto preenchido e `tipoAtendimento` deve ser um dos códigos da tabela.
- `data` deve representar uma data válida e futura. Envie uma string ISO 8601
  com fuso horário no JSON e converta para `Date` depois de validar o campo.
- `planoPetMais` deve ser booleano. Use `false` quando o campo estiver ausente.
- Monte `NovaConsulta` apenas com os campos previstos. Ignore campos extras,
  inclusive valores de `id` ou `valor` enviados pelo cliente.

### Cancelamento

Compare o horário da consulta com `agora`. Para o exercício, calcule a taxa
sobre o valor registrado da consulta, já com o desconto do atendimento quando
aplicável.

| Tempo restante | Taxa |
| --- | ---: |
| 24 horas ou mais | 0% |
| De 2 horas a menos de 24 horas | 30% |
| Mais de zero e menos de 2 horas | 50% |
| Consulta iniciada ou não comparecimento | 100% |

O Pet+ reduz pela metade a taxa calculada. Valor da consulta menor ou igual a
zero deve gerar erro, inclusive quando o horário daria taxa zero.

### Rotas do exercício

| Rota | Sucesso | Erro esperado |
| --- | --- | --- |
| `POST /consultas` | 201 com a consulta criada | 400 para dados inválidos |
| `GET /consultas` | 200 com a lista, vazia quando aplicável | |
| `GET /consultas/:id` | 200 com a consulta | 404 para ID ausente |
| `DELETE /consultas/:id` | 200 com `{ "taxa": ... }` e remoção da consulta | 404 para ID ausente |

Registre as rotas Express e conecte-as à Facade em `src/montagem.ts`. Mantenha
a montagem acessível ao Supertest com um repositório novo para cada teste.
Datas em respostas JSON devem ser serializadas como texto.

### Roteiro de testes

- **Cancelamento — pelo menos 8 testes.** Cubra exatamente 24 h, um instante
  abaixo de 24 h, exatamente 2 h, um instante abaixo de 2 h, início da
  consulta, atraso ou não comparecimento, redução Pet+, valor zero e valor
  negativo. Use horários fixos.
- **Facade — pelo menos 4 testes unitários.** Verifique o cadastro persistido
  com preço, o aviso enviado uma vez com os argumentos esperados, a busca de
  ID inexistente e o cancelamento que calcula a taxa e remove a consulta.
  Use `jest.fn()` para observar chamadas ao repositório ou ao notificador.
- **HTTP — pelo menos 8 testes de integração.** Use Supertest. Cubra cadastro
  válido, padrão Pet+ e campos extras, listagem vazia, listagem após cadastro,
  busca existente, busca ausente, cancelamento seguido de 404 e cancelamento
  de ID ausente. Acrescente um caso de 400 para cada campo inválido.
- **TDD.** Red: escreva um caso novo e confirme que falha pelo motivo esperado.
  Green: implemente o mínimo para passar. Refactor: melhore o código e rode
  novamente a suíte para confirmar o comportamento.
- **Cobertura.** Quando as primeiras implementações de `pricing` e `facade`
  existirem, acrescente estas opções à configuração existente em
  `jest.config.ts`. O limite é de 80% de ramificações em cada pasta. Incluir
  os arquivos no relatório também evidencia implementações sem testes.

```typescript
collectCoverageFrom: ["src/pricing/**/*.ts", "src/facade/**/*.ts"],
coverageThreshold: {
  "./src/pricing/": { branches: 80 },
  "./src/facade/": { branches: 80 }
}
```

## Git em dupla

Use `main` como base. Se a cópia inicial ainda estiver em `master` e não
houver uma `main`, renomeie a branch local com `git branch -m main`. A partir
da base atualizada, abra uma branch de trabalho por etapa:

```powershell
git switch main
git switch -c feature/dominio-solid
git status
git add src tests
git diff --cached
git commit -m "Descreve a mudança realmente feita"
```

Depois de integrar essa etapa, volte à `main` atualizada e repita com
`git switch -c feature/padroes`. Após integrar os padrões, faça o mesmo com
`git switch -c feature/testes`.

Com o remoto da dupla configurado, envie a branch com
`git push -u origin feature/dominio-solid` (substitua pelo nome da branch
atual). No GitHub, abra **New pull request**, selecione `main` como base e
a branch de trabalho como comparação. Descreva as alterações e os testes
executados e solicite revisão ao outro integrante. Ele deve ler o diff,
registrar a revisão e verificar as correções antes da integração. Após
integrar, atualize a base com `git switch main` e `git pull --ff-only`.

A Parte 1 exige pelo menos **seis commits reais**, participação dos dois
integrantes e revisões reais dos Pull Requests. Cada pessoa usa sua própria
identidade Git e registra as mudanças que realizou. Os commits de preparação
deste repositório são o ponto de partida da dupla.

Ao concluir e testar a entrega na `main`, crie a tag com
`git tag -a v1.0 -m "Entrega Vetunix v1.0"`. Quando a dupla for publicar a
entrega, envie a tag com `git push origin v1.0`.

## Docker

Quando o Docker Desktop estiver com o motor Linux disponível, pare o servidor
local antes de usar a porta 3000 para o contêiner. Execute em ordem:

```powershell
docker build -t vetunix .
docker run --rm -d --name vetunix-teste -p 3000:3000 vetunix
Invoke-RestMethod http://localhost:3000/status
docker stop vetunix-teste
```
