# IdleMarket

Ecossistema que une um jogo *auto battler* a um *marketplace* web. O jogador combate em waves automáticas dentro do navegador, coleta equipamentos com atributos gerados aleatoriamente e os equipa, vende ou compra de outros jogadores pela interface web — com o servidor como fonte de verdade de tudo que é progressão e economia.

O foco do projeto é a **arquitetura full-stack** e a **integração entre três camadas independentes**: nem o jogo nem o site falam com o banco, só com a API REST.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Jogo | Unity 6000.3.13f1 (C#), build WebGL, Newtonsoft.Json |
| Backend | Node.js + TypeScript, Fastify, Prisma ORM, JWT, bcrypt |
| Banco | PostgreSQL 17 (via Docker Compose) |
| Frontend | React 19 + Vite, TypeScript, Tailwind CSS 4, React Router, react-unity-webgl |
| Documentação | Vault Obsidian (Markdown) |

## Estrutura

```
backend/    API REST
web/        aplicação React
game/       projeto Unity
docs/       documentação (vault Obsidian)
```

**`backend/`** — servidor Fastify que concentra as regras de negócio. `src/routes/` tem os grupos de rotas (`auth`, `battle`, `inventory`, `player`, `market`); `src/game/` a lógica de domínio (gerador de loot, recompensas, progressão); `src/DTOs/` os contratos enviados ao front; `src/lib/` o cliente Prisma e o guard de autenticação. O schema e as migrations ficam em `prisma/`, e o `docker-compose.yml` sobe o Postgres.

**`web/`** — interface React. `src/screens/` são as telas (Login, Cadastro, Dashboard, Jogo, Mercado); `src/components/` os reutilizáveis; `src/data/` a camada que fala com a API; `src/context/` o estado global do jogador; `src/lib/` os cálculos de apoio (stats, filtros, diff de recompensas). O build WebGL do jogo é servido de `public/unity/`.

**`game/`** — projeto Unity do auto battler. Os scripts em `Assets/Scripts/` são separados por responsabilidade (`Combat`, `Characters`, `Equipments`, `Managers`, `Services`, `UI`, `Bridges`), com os serviços de API e a ponte com o React isolados do resto.

**`docs/`** — a documentação de verdade do projeto, em vault Obsidian: arquitetura, decisões de design com justificativa, modelagem do banco, contrato da API e detalhamento de cada tela.

## Como rodar

O passo a passo completo — instalação por sistema operacional, configuração e problemas comuns — está em **[docs/IdleMarket/Setup e Execução.md](docs/IdleMarket/Setup%20e%20Execu%C3%A7%C3%A3o.md)**.

Resumo, com Node, Docker e as dependências já instalados:

```bash
# banco + API (porta 3333)
cd backend
cp .env.example .env        # preencher as variáveis
docker compose up -d
npm install && npx prisma generate && npx prisma migrate deploy
npm run dev

# frontend (porta 5173), em outro terminal
cd web
npm install && npm run dev
```

Depois é só abrir <http://localhost:5173> e criar uma conta.

## Documentação

O ponto de entrada do vault é [docs/IdleMarket/Index.md](docs/IdleMarket/Index.md).
