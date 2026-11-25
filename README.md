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
`pet`, `tipo`, `dataHora` futura em ISO 8601 com fuso e, opcionalmente,
`planoPetMais`. O plano tem valor padrão `false`.

## Demonstração da Parte 1

Com o servidor iniciado, execute:

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

Em uma instância nova, os IDs são 1, 2 e 3 e os valores são R$ 120, R$ 64 e
R$ 540. Os dados da demonstração são de exemplo.

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

A compilação passou e foram aprovados **39 testes em 3 suítes**. A cobertura
foi de 95,00% das instruções, 92,53% das ramificações, 95,91% das funções e
94,73% das linhas. As pastas `pricing` e `facade` atingiram 100% de
ramificações cada. O relatório HTML fica em `coverage/lcov-report/index.html`.

## Docker

Com a porta 3000 livre:

```powershell
docker build -t vetunix .
docker run --rm -p 3000:3000 vetunix
```

A imagem revisada foi validada no Docker Engine 29.9.3. Os três agendamentos
retornaram HTTP 201. Status, listagem, busca e cancelamento retornaram HTTP
200. O contêiner de teste foi encerrado e removido.

## Conceitos aplicados e desenvolvimento

O projeto aplica Clean Code, SOLID, Adapter, Decorator e Facade. A Facade
recebe as dependências no construtor. As regras de preço são classes
independentes, o Decorator aplica o desconto Pet+ e o Adapter conecta o
notificador à simulação de WhatsApp. Os testes usam mocks e Supertest.

Os documentos originais do professor não estavam disponíveis nesta revisão.
A conferência literal dos contratos de preço, repositório e Decorator, do
legado, do SDK e dos dados da demonstração depende desses documentos. O legado
e o SDK foram preservados.

O estudante informou que o professor autorizou o uso de IA. O Codex auxiliou
na implementação, nos testes e nas verificações. Os commits identificam seus
autores. Aprovações de Pull Requests, revisões da dupla e registros de TDD
dependem das atividades realmente realizadas.
