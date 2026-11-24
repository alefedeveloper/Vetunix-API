# Vetunix — Treinamento de Engenharia de Software II

Projeto didático, sem interface gráfica, banco de dados ou integrações reais.
O código inicial contém apenas uma API Express com a rota `GET /status` e um
teste de integração. As demais funcionalidades são exercícios para o estudante.

## 1. Verifique as ferramentas

No PowerShell, confira as ferramentas instaladas:

```text
node --version
npm --version
git --version
docker --version
```

O Node.js inclui o npm. Se algum comando não for encontrado, peça ao professor
orientação para instalar a ferramenta e reabra o terminal. Use Node.js 22 ou
superior.

## 2. Instale e execute

Na pasta `C:\vetunix`, instale as dependências e inicie a API:

```text
npm install
npm run dev
```

A API fica disponível em `http://localhost:3000`. Teste `GET /status` no
navegador ou com:

```text
Invoke-RestMethod http://localhost:3000/status
```

Para parar o servidor, pressione `Ctrl+C` no terminal.

A resposta esperada é HTTP 200 com o JSON
`{"mensagem":"API Vetunix funcionando"}`.

## 3. Conheça as pastas

- `src/domain`: conceitos e regras principais do agendamento.
- `src/pricing`: cálculo do preço do atendimento.
- `src/repositories`: armazenamento temporário em memória, sem banco de dados.
- `src/notifications`: envio de notificações simulado, sem WhatsApp real.
- `src/facade`: ponto simples de acesso às operações do sistema.
- `src/libs`: adaptadores e utilitários pequenos.
- `src/legado`: exemplos antigos que serão adaptados nos exercícios.
- `tests`: testes automatizados.

## 4. Exercícios — Parte 1

Faça um exercício de cada vez. Leia os testes, escreva uma solução pequena e
execute `npm test` depois de cada mudança.

1. **Clean Code e domínio:** crie `src/domain/Agendamento.ts` com uma estrutura
   simples para representar um agendamento. Use nomes claros em português e
   evite misturar dados com outras responsabilidades.
2. **Preço:** crie `src/pricing/CalculadoraPreco.ts`. Implemente uma função
   pequena para calcular o preço de um atendimento. Escreva testes antes da
   implementação e combine as regras de preço com o professor.
3. **SOLID:** separe o cálculo de preço do agendamento. Converse sobre a
   responsabilidade de cada arquivo e evite criar abstrações que o exercício
   não precisa.
4. **Adapter:** coloque em `src/legado/` uma função antiga de notificação
   simulada e crie em `src/libs/` um adaptador para usá-la com uma interface
   simples definida em `src/notifications/`. Não conecte serviços reais.
5. **Decorator:** adicione uma responsabilidade simples à notificação
   simulada, como registrar uma mensagem antes de enviá-la. Compare o código
   com e sem o decorator.
6. **Facade:** crie em `src/facade/` uma função que reúna, de forma fácil de
   entender, o agendamento, o preço e a notificação simulada.
7. **Git e branches:** com orientação do professor, use `git status`, crie uma
   branch para o exercício, faça alterações pequenas e compare as branches.
   Não use commits para fingir atividades ainda não realizadas.

## 5. Exercícios — Parte 2

8. **Testes unitários e TDD:** adicione testes em `tests/` para as regras de
   domínio e para o cálculo de preço. No TDD, alterne entre um teste que falha,
   a implementação mínima e uma melhoria simples.
9. **Mocks:** teste a facade substituindo a notificação por uma implementação
   falsa. Verifique o resultado sem chamar serviços externos.
10. **API REST:** implemente, em `src/app.ts`, uma rota para criar um
    agendamento. Valide apenas os dados combinados com o professor e retorne
    uma resposta HTTP adequada.
11. **Testes de integração:** use Supertest em `tests/` para testar a nova rota
    HTTP e seus casos válidos e inválidos.
12. **Cobertura:** execute `npm run test:coverage`. Leia o relatório e acrescente
    testes para comportamentos que ainda não foram exercitados.
13. **Docker:** execute a API em um contêiner conforme a seção abaixo e
    verifique se a rota responde da mesma forma.

## 6. Execute com Docker

Abra o Docker Desktop e aguarde o motor de contêineres Linux ficar disponível.
Execute os comandos em ordem e confirme que cada um funciona antes de passar
ao próximo:

```powershell
docker info
docker run --rm hello-world
docker build -t vetunix .
docker run --rm -d --name vetunix-teste -p 3000:3000 vetunix
Invoke-RestMethod http://localhost:3000/status
docker stop vetunix-teste
```

Encerre o servidor local com `Ctrl+C` antes de iniciar o contêiner, pois ambos
usam a porta 3000. Se o acesso ao motor Linux falhar no Windows, confira
`wsl --status` e `wsl -l -v` no PowerShell. Para reiniciar o ambiente, execute
`wsl --shutdown` (isso encerra as sessões WSL abertas) e reinicie o Docker Desktop.

## 7. Compilação e testes

```text
npm run build
npm start
```

`npm run build` compila os arquivos TypeScript para `dist/`. `npm start` executa
o servidor compilado. Durante o desenvolvimento, use `npm run dev`.

```powershell
npm test
npm run test:watch
npm run test:coverage
```

O teste inicial verifica o status HTTP e o JSON de `GET /status`. O relatório
HTML de cobertura fica em `coverage/lcov-report/index.html`.

## 8. Como estudar

- Faça uma alteração pequena por vez e leia a mensagem de erro inteira.
- Comece pelos testes e confirme que eles falham antes de implementar cada
  comportamento novo.
- Prefira funções curtas, nomes em português e estruturas já estudadas em aula.
- Não adicione banco de dados, interface gráfica, frameworks extras ou serviços
  reais de notificação.
- Siga os contratos do roteiro acadêmico para nomes de arquivos, assinaturas,
  regras de preço, campos obrigatórios e respostas HTTP. Confirme com o
  professor os detalhes que o roteiro deixar em aberto.
