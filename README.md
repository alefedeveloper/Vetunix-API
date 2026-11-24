# Vetunix

Projeto desenvolvido para a disciplina de Engenharia de Software II.

## Integrantes

- Nome do integrante 1
- Nome do integrante 2

## Sobre o projeto

Sistema de agendamento para uma clínica veterinária. Permite cadastrar, listar, buscar e cancelar consultas, calcular preços, descontos e taxas de cancelamento.

Os dados são armazenados em memória.

## Tecnologias

- Node.js
- TypeScript
- Express
- Jest
- Docker

## Como executar

```bash
npm install
npm run dev
```

A API funciona na porta 3000.

## Rotas

| Método | Rota |
|---|---|
| POST | /consultas |
| GET | /consultas |
| GET | /consultas/:id |
| DELETE | /consultas/:id |

## Testes

```bash
npm test
npm run test:coverage
```

Resultados:

- 39 testes aprovados.
- Cobertura de linhas: 94,21%.
- Cobertura geral de ramificações: 91,52%.
- Cobertura de ramificações em pricing e facade: 100%.

## Docker

```bash
docker build -t vetunix .
docker run --rm -p 3000:3000 vetunix
```

## Conceitos aplicados

Clean Code, SOLID, Adapter, Decorator, Facade e testes automatizados.

O projeto contou com auxílio de inteligência artificial no desenvolvimento.
