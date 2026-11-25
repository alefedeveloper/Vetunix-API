# Vetunix — Engenharia de Software II

API de agendamento veterinário inspirada no AgendaVet. Cadastra, lista, busca e
cancela consultas, calcula preços e taxas e simula avisos por WhatsApp. As
consultas ficam em memória e são descartadas ao reiniciar o servidor.

**Integrantes**

- Álefe Lucas Mendes Neves
- Erik Jason Gomes Miranda

## Tecnologias e estrutura

Node.js 22 ou superior, TypeScript, Express, Jest, ts-jest e Supertest. O Docker
é usado para empacotar a aplicação.

| Caminho | Conteúdo |
| --- | --- |
| `src/domain` | Tipos de atendimento, modelos e validação do cadastro. |
| `src/pricing` | Regras de preço, desconto Pet+ e taxa de cancelamento. |
| `src/repositories` | Contrato e armazenamento em memória com `Map`. |
| `src/notifications` | Contrato do notificador e Adapter do WhatsApp simulado. |
| `src/facade` | Operações da clínica e testes unitários. |
| `src/libs` e `src/legado` | Biblioteca simulada e código original para comparação. |
| `src/montagem.ts` | Liga as dependências com `montarFacade()`. |
| `src/app.ts` e `src/index.ts` | Criam o Express com `criarApp(facade)` e iniciam o servidor. |
| `tests/api.test.ts` | Testes HTTP com Supertest. |

## Execução local

No PowerShell, a partir da raiz do projeto:

```powershell
npm ci
npm run dev
```

A API escuta na porta 3000. Em outro terminal, execute
`Invoke-RestMethod http://localhost:3000/status`. Pressione Ctrl+C para parar.
Para rodar a versão compilada, use `npm run build` e depois `npm start`.

## API

| Método e rota | Sucesso | Erros esperados |
| --- | --- | --- |
| `GET /status` | 200 com mensagem de funcionamento | |
| `POST /consultas` | 201 com a consulta e o ID gerado | 400 com a lista `erros` |
| `GET /consultas` | 200 com a lista de agendadas e canceladas | |
| `GET /consultas/:id` | 200 com a consulta | 400 para ID inválido, 404 para ID inexistente |
| `DELETE /consultas/:id` | 200 com a consulta cancelada e `taxaCancelamento` em reais | 400 para ID inválido, 404 para consulta inexistente, 409 se já cancelada |

Exemplo de corpo para `POST /consultas`. Use uma data futura em ISO 8601 com fuso:

```json
{
  "tutor": "Maria Silva",
  "telefone": "11912345678",
  "pet": "Luna",
  "tipo": "CONSULTA",
  "dataHora": "2099-05-10T14:00:00-03:00",
  "planoPetMais": true
}
```

Para gerar uma data futura e testar as quatro rotas:

```powershell
$url = 'http://localhost:3000/consultas'
$dados = @{
  tutor = 'Maria Silva'
  telefone = '11912345678'
  pet = 'Luna'
  tipo = 'CONSULTA'
  dataHora = [DateTime]::UtcNow.AddHours(1).ToString('o')
  planoPetMais = $true
} | ConvertTo-Json
$consulta = Invoke-RestMethod $url -Method Post -ContentType 'application/json' -Body $dados
Invoke-RestMethod $url
Invoke-RestMethod "$url/$($consulta.id)"
Invoke-RestMethod "$url/$($consulta.id)" -Method Delete
```

O cadastro exige `tutor` com pelo menos três caracteres, `telefone` de 10 ou
11 dígitos, `pet` preenchido, `tipo` válido e `dataHora` futura. Se omitido, o booleano
`planoPetMais` vale `false`. O servidor ignora os campos extras e gera o ID,
o valor e o status `AGENDADA`. O repositório gera IDs inteiros sequenciais a
partir de 1. Uma falha ao enviar o aviso simulado desfaz o cadastro.

### Demonstração da Parte 1

Com o servidor iniciado, execute três agendamentos de exemplo e confira os
valores de R$ 120, R$ 64 e R$ 540. Em uma instância recém-iniciada, os IDs
serão 1, 2 e 3.

```powershell
$url = 'http://localhost:3000/consultas'
$exemplos = @(
    @{ pet = 'Luna'; tipo = 'CONSULTA'; planoPetMais = $false }
    @{ pet = 'Toby'; tipo = 'VACINA'; planoPetMais = $true }
    @{ pet = 'Nina'; tipo = 'CIRURGIA'; planoPetMais = $false }
)
$exemplos | ForEach-Object {
    $dados = $_ + @{
        tutor = 'Maria Silva'
        telefone = '11912345678'
        dataHora = [DateTime]::UtcNow.AddDays(2).ToString('o')
    }
    Invoke-RestMethod $url -Method Post -ContentType 'application/json' -Body ($dados | ConvertTo-Json)
} | Select-Object id, pet, tipo, planoPetMais, valor
```

### Preços e cancelamento

| Tipo | Valor |
| --- | ---: |
| `CONSULTA` | R$ 120 |
| `VACINA` | R$ 80 |
| `CIRURGIA` | R$ 540 |
| `BANHO_TOSA` | R$ 65 |

O Pet+ reduz o preço do atendimento em 20%. A taxa de cancelamento incide sobre
o valor registrado da consulta.

| Tempo até o início | Taxa |
| --- | ---: |
| 24 horas ou mais | 0% |
| De 2 horas inclusive a menos de 24 horas | 30% |
| Mais de zero a menos de 2 horas | 50% |
| No início ou depois | 100% |

O Pet+ reduz a taxa de cancelamento pela metade. Valor menor ou igual a zero
gera `Valor inválido`. A consulta cancelada permanece armazenada com status
`CANCELADA`.

## SOLID e padrões

| Princípio | Aplicação |
| --- | --- |
| SRP — Responsabilidade única | Preço, validação, armazenamento e notificação ficam em arquivos próprios. |
| OCP — Aberto para extensão | A regra de banho e tosa entra na montagem sem alterar a seleção de preços. |
| LSP — Substituição de Liskov | A calculadora e a calculadora decorada podem ser usadas como `Precificador`. |
| ISP — Segregação de interfaces | Armazenamento, notificação e cálculo têm contratos próprios. |
| DIP — Inversão de dependência | A Facade recebe o repositório, o precificador e o notificador pelo construtor. |

O **Adapter** `ZapAdapter` adiciona o DDI 55 e adapta a ordem dos argumentos
do SDK simulado. O **Decorator** `DescontoPlanoPet` chama a calculadora e
aplica o desconto. A **Facade** `ClinicaFacade` reúne as operações usadas
pelas rotas e delega o trabalho às dependências.

Os documentos originais do professor não estavam disponíveis nesta revisão.
A demonstração usa dados de exemplo. A conferência literal dos contratos de
preço, repositório e Decorator, do legado e do SDK depende desses documentos.

## Testes e cobertura

```powershell
npm run build
npm test
npm run test:coverage
```

Na validação final, `npm run build`, `npm test` e `npm run test:coverage`
concluíram com sucesso. Passaram **39 testes em 3 suítes**. A cobertura foi de
95,00% das instruções, 92,53% das ramificações, 95,91% das funções e 94,73%
das linhas. As pastas `pricing` e `facade` atingiram **100% de ramificações**
cada.

O Jest exige pelo menos 80% de cobertura de ramificações em cada uma das
pastas `pricing` e `facade`. O relatório HTML fica em
`coverage/lcov-report/index.html`.

Os testes unitários cobrem os limites de horário e usam mocks do notificador
e do SDK. Os testes de integração usam Supertest. Na verificação HTTP na
porta 3000, o cadastro retornou 201, e a listagem, a busca e o cancelamento
retornaram 200. Os cenários de erro retornaram 400, 404 e 409 conforme a
tabela da API. A consulta Pet+ de R$ 96 teve taxa de R$ 24 ao ser cancelada
com menos de duas horas de antecedência.

Para aplicar TDD em uma mudança futura, escreva um teste que falhe, faça a
menor implementação que o faça passar e depois refatore. Os resultados
registrados acima verificam a versão atual do código.

## Git e participação da dupla

Use `main` como base e branches como `feature/dominio-solid`,
`feature/padroes` e `feature/testes` para trabalhos específicos. Para uma nova
alteração, parta da base atualizada e escolha um nome de branch disponível:

```powershell
git switch main
git switch -c feature/nome-da-alteracao
git status
git add src tests
git diff --cached
git commit -m "Descreve a alteração realizada"
```

Quando houver um remoto da dupla, envie a branch com
`git push -u origin feature/nome-da-alteracao`. Abra um Pull Request com
`main` como base, descreva as mudanças e inclua os testes executados. O outro
integrante deve revisar o diff, registrar a revisão e conferir as correções
antes de integrar. Na Parte 1, o roteiro exige seis commits reais, participação
dos dois integrantes e revisões reais. Cada integrante usa sua identidade
Git para registrar o trabalho que realizou.

Após validar todos os requisitos, incluindo o contêiner, crie a tag com
`git tag -a v1.0 -m "Entrega Vetunix v1.0"`. Publique a tag com
`git push origin v1.0` quando a equipe decidir publicar a entrega.

### Registro de uso de IA

O estudante informou que o professor autorizou o uso de IA. O Codex implementou
o sistema, escreveu os testes, executou as verificações e registrou seus commits
locais. A autoria desses commits identifica o Codex. A contribuição da dupla e
as revisões dos Pull Requests devem ser registradas pelos próprios integrantes.

## Docker

O Dockerfile instala as dependências do lock, compila o TypeScript e inicia o
servidor pela entrada compilada `dist/index.js`, chamada por `npm start`. Com
o motor Linux disponível e a porta 3000 livre, execute:

```powershell
docker info
docker run --rm hello-world
docker build -t vetunix .
docker run --rm -d --name vetunix-final -p 3000:3000 vetunix
Invoke-RestMethod http://localhost:3000/status
Invoke-RestMethod http://localhost:3000/consultas
docker stop vetunix-final
```

Para cadastrar uma consulta no contêiner, execute o exemplo da seção API
antes de rodar `docker stop`.

A validação final passou no Docker Desktop com WSL 2 e Docker Engine 29.9.3.
`docker info`, `hello-world` e a construção da imagem concluíram com sucesso.
O contêiner respondeu 200 em `GET /status`, 201 em `POST /consultas` para
uma consulta Pet+ de R$ 96 e 200 em `GET /consultas` com a consulta cadastrada.
O contêiner de teste foi encerrado e removido pelo parâmetro `--rm`.

Após a revisão dos IDs, a imagem foi reconstruída no Docker Engine 29.9.3.
A demonstração da Parte 1 retornou 201 para os três agendamentos, com IDs
numéricos 1, 2 e 3. Status, listagem, busca por ID e cancelamento retornaram
200. O contêiner da revisão também foi encerrado e removido.
