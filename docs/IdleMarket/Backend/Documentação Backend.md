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

- `POST /equip`: Recebe o `id` do equipamento. Seta `estaEquipado = true`. _(Regra de negócio: antes de salvar, busca se já existe um item com a mesma propriedade `peca` equipado e muda ele para `false`)_.
    
- `POST /unequip`: Recebe o `id` do equipamento e muda `estaEquipado = false`.
    

### 4. Marketplace Global (`/api/market`)

- `GET /list`: Retorna todos os equipamentos do banco onde `estaAVenda == true`. Permite receber parâmetros de query para os filtros avançados do React (filtrar por preço, rating mínimo, sub-status, etc.).
    
- `POST /sell`: Recebe o `id` do item e o `precoVenda`. Altera `estaAVenda = true` e preenche o preço. _(Regra: o item não pode estar equipado para ser vendido)_.
    
- `POST /buy`: **Rota Crítica de Transação.** Recebe o `id` do item que o comprador quer.
    
    - _Lógica:_ Abre uma **Transaction (Prisma.$transaction)** para garantir que, se algo falhar no meio, nada mude. O backend checa se o comprador tem ouro. Se sim: reduz o ouro do comprador ➔ adiciona o ouro na conta do vendedor ➔ muda o `usuarioId` do item para o do comprador ➔ seta `estaAVenda = false` e `precoVenda = null`.

## Rotas a implementar na Fase 5 (consumidas pelo Frontend)

O Frontend (React) já chama estes pontos pelos seams da pasta `data/` (ver [[Documentação Frontend]]); hoje eles devolvem fixtures. Estas rotas precisam ser criadas no backend pra plugar o front real:

- `GET /me`: retorna o **status do jogador + inventário completo** num único payload — `{ username, gold, level, xp, xpForNextLevel, inventário[] }`. Diferente de `/api/battle/status` (que serve a Unity e só carrega os **equipados**), o `/me` carrega o inventário inteiro que o Dashboard e o Mercado precisam, incluindo o `xpForNextLevel` pra barra de XP. É a rota por trás do `playerService.getMe`. (Ver [[Integração API]].)
- `GET /api/inventory` (listar inventário): retorna todos os itens do jogador (equipados, guardados e à venda), pra alimentar o inventário do React de forma independente do `/me`.
- `POST /api/market/unlist`: recebe o `id` do item anunciado e **cancela o anúncio** (`estaAVenda = false`, `precoVenda = null`), devolvendo o item ao inventário. Complementa o `/sell` — é o que o botão **Cancelar** da aba Vender chama (`marketService.unlist`).

> Também entram na Fase 5 (já mapeadas nos seams do front, mas sem rota ainda): a rota de **deletar item** do inventário (ex.: `DELETE /api/inventory/:id`) — hoje só existem `/equip` e `/unequip`.