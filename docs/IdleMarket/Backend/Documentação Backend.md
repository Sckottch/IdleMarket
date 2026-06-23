## Visão Geral

Servidor API REST assíncrono construído em Node.js que atua como o motor central da aplicação. É responsável por processar todas as regras de negócio e realizar a persistência de dados via Prisma ORM de forma segura. A comunicação com os clientes (Jogo e Web) é **REST only** — sem WebSocket; quando o estado muda, o cliente repuxa (ver [[Integração API]] e [[Decisões]]).

**Ambiente de Execução:** Node.js (Vite-node, Fastify ou Express) **Linguagem:** TypeScript (para garantir tipagem idêntica às tabelas do Prisma)

## Endpoints da API (Arquitetura de Rotas)

As rotas da API atenderão tanto às requisições do jogo (Unity) quanto às ações da interface web (React).

### 1. Sistema de Autenticação (`/api/auth`)

- `POST /register`: Recebe `username` e `password`. Verifica se o usuário já existe. Se não, criptografa a senha (usando `bcrypt`) e cria a linha no banco gerando também o `Personagem` inicial no nível 1.
    
- `POST /login`: Valida as credenciais. Se corretas, gera e retorna um **Token JWT** (JSON Web Token) que a Unity e o React usarão para autenticar as próximas requisições.
    

### 2. Fluxo de Gameplay e Recompensas (`/api/battle`)

- `GET /status`: Retorna o ouro, nível, experiência e os itens equipados atuais do jogador.
    
- `POST /victory`: **Rota Crítica.** Recebe a informação de que uma wave/confronto foi vencido.
    
    - _Lógica:_ O backend calcula o ganho de Experiência e Ouro com base no nível dos inimigos enfrentados.
        
    - _Gerador de Loot (RNG):_ Caso a matemática decida que houve drop de item (ou se for o Chefão da wave 5), o backend gera o equipamento, calcula a raridade, sorteia os status/sub-status dentro dos _ranges_ da tabela da Unity, calcula o **Rating (1-100)** e salva na tabela `Equipamento`.
        
    - _Resposta:_ Retorna para a Unity apenas `{ level, xp }` (o DTO `VictoryResult`). O ouro e o equipamento dropado são **persistidos no banco** mas não trafegam pro jogo — são exibidos pelo React. (Ver [[Integração API]].)
        
- `POST /defeat`: Chamada ao perder o combate. O backend busca o ouro atual do jogador, subtrai **5%**, atualiza no Postgres e retorna o novo valor.
    

### 3. Gerenciamento de Itens (`/api/inventory`)

- `POST /equip`: Recebe o `equipmentId`. Seta `isEquipped = true`. _(Regra de negócio: antes de salvar, busca se já existe um item com o mesmo `equipmentType` equipado e muda ele para `false`)_. Responde com os equipados atualizados.
    
- `POST /unequip`: Recebe o `equipmentId` e muda `isEquipped = false`.
    
- `DELETE /:id`: deleta um equipamento. O `id` vem como **route param** (`/api/inventory/:id`), não no corpo. Confere a **posse** antes de apagar (o `userId` do item tem que ser o do requisitante) — barra IDOR (deletar item alheio). O `onDelete: Cascade` do schema apaga os `subStats` junto. Responde `204`.
    

### 4. Marketplace Global (`/api/market`)

- `GET /list`: Retorna os equipamentos com `isForSale == true`, **escondendo os do próprio usuário** (`userId != requisitante`) — não faz sentido listar pra alguém o que já é seu. Serve a aba Comprar do React.
    
- `POST /sell`: Recebe `itemId` e `price`. Confere a posse e que o item não está já à venda, então seta `isForSale = true`, `salePrice = price` e `isEquipped = false`. _(Regra: anunciar tira o item de equipado.)_
    
- `POST /unlist`: Recebe `itemId`. Confere a posse e cancela o anúncio (`isForSale = false`, `salePrice = null`), devolvendo o item ao inventário. É o que o botão **Cancelar** da aba Vender chama.
    
- `POST /buy`: **Rota Crítica de Transação.** Recebe o `itemId` que o comprador quer.
    
    - _Lógica:_ Abre uma **`prisma.$transaction`** (tudo-ou-nada). Dentro dela valida **no servidor** (não confia no front): o item existe e está à venda, tem `salePrice`, não é auto-compra (`userId` do item != comprador) e o comprador tem ouro. Passando: debita o ouro do comprador ➔ credita o vendedor ➔ transfere o item (`userId` = comprador, `isForSale = false`, `salePrice = null`, `isEquipped = false`).
    - _Barrado server-side:_ auto-compra e ouro insuficiente são rejeitados aqui, com erro próprio — o front faz só checagem de UX (ver [[Mercado]]).

## Fase 5 — rotas e infra de integração

Com a Fase 5 os seams do front (pasta `data/`) deixaram de devolver fixtures e passaram a bater nas rotas reais (ver [[Documentação Frontend]]).

### Player (`/api/player`)

- `GET /me`: retorna o **`PlayerDataDTO`** — `status` (`username`, `gold`, `level`, `xp`, `xpForNextLevel`) + o **inventário completo** (`inventory`), cada item com seus `subStats`. Diferente de `/api/battle/status` (que serve a Unity e carrega só os **equipados**), o `/me` traz tudo que o Dashboard e o Mercado precisam. O `xpForNextLevel` vem do `getXpForLevelUp`, **extraído pra um helper compartilhado** (`game/playerHelper`) e reusado aqui — a mesma fórmula que decide o level-up no fluxo de batalha. É a rota por trás do `playerService.getMe`. (Ver [[Integração API]].)

### DTOs (`DTOs/`)

O formato enviado ao front é desacoplado do banco por DTOs centralizados (`DTOs/playerDTO`: `PlayerDataDTO`, `EquipmentDTO`, `SubStatDTO`). O DTO expõe **só o necessário** — `userId`, `passwordHash` e afins nunca trafegam — e mantém o contrato do front estável mesmo que o schema do Prisma mude.

### CORS (`@fastify/cors`)

Registrado **antes** das rotas (origem do dev: `http://localhost:5173`). O `methods` é declarado **explicitamente** incluindo `DELETE`: o default do plugin cobre só `GET`/`HEAD`/`POST`, então sem declarar, o preflight do `DELETE /api/inventory/:id` seria barrado.