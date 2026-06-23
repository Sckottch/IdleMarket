## Visão Geral

Interface web construída em React que serve como o hub do jogador fora da Unity. Nela, o usuário gerencia sua conta, visualiza os atributos do personagem, equipa ou desequipa itens e interage com a economia viva do jogo através do mercado de trocas. A **Fase 4** entregou todas as telas com dados mockados; a **Fase 5** trocou os mocks por chamadas reais ao backend e embutiu o jogo Unity (WebGL) na tela do Jogo, ligando a economia de ponta a ponta.

**Framework:** React (Vite / TypeScript)
**Estilo:** Tailwind CSS, interface escura estilo RPG
**Navegação:** React Router. Login e Cadastro ficam fora do layout; Dashboard, Jogo e Mercado rodam dentro do `MainLayout` (com a [[Componentes#TopNav|TopNav]]).

## Telas

Cada tela tem sua doc detalhada (layout, fluxo, elementos):

- [[Login-Cadastro]] — autenticação (Entrar / Criar Conta).
- [[Dashboard]] — perfil, inventário, equipar/desequipar/deletar.
- [[Jogo]] — Unity embutido (WebGL), stats e equipados ao redor.
- [[Mercado]] — abas Comprar e Vender.
- [[Componentes]] — reutilizáveis (ItemCard, TopNav, EquipmentManager).

## Arquitetura

### Camada de transporte (`data/api.ts`)

O cliente `api` centraliza o `fetch`. O **token** é estado ambiente: guardado no `localStorage` e anexado sozinho no header `Authorization` de toda chamada. Em respostas de erro, **lança** (`throw`) com a mensagem que o backend mandou — é o que alimenta os toasts de erro das telas. Manda `Content-Type: application/json` **só quando há corpo**, e lê a resposta como **texto antes de parsear** (assim trata corpo vazio de `200`/`204` sem quebrar).

### Seams assíncronos (`data/`)

Cada ponto que fala com o backend é uma **função assíncrona** na pasta `data/`. Foi assim desde a Fase 4 (devolvendo fixtures); na **Fase 5** a implementação virou `fetch` real sobre o `api` — **a assinatura não mudou**, então nenhuma tela precisou ser reescrita, e o `loading` já estava embutido no contrato `async` desde o dia 1 (ver [[Decisões]]).

- **`playerService.getMe()`** → `{ status, inventory }` — status do jogador (incl. `xpForNextLevel`) + inventário completo (`GET /api/player/me`).
- **`marketService`** → `getListings`, `buy`, `sell`, `unlist`.
- **`inventoryService`** → `equipItem`, `unequipItem`, `deleteEquipment`. _(Renomeado de `equipmentService` pra bater com o grupo de rota `/api/inventory` do backend.)_
- **`authService`** → `login`, `register`, `logout`.

### PlayerContext (server-authoritative)

`context/PlayerContext.tsx` é a fonte de verdade do estado do jogador no front. Mantém `status`, `inventory` e `loading`; expõe as ações (`equip`, `unequip`, `deleteItem`, `buyItem`, `sellItem`, `unlistItem`, `logout`) e os refreshes.

- **Server-authoritative:** na Fase 5 o servidor é a fonte de verdade. Cada ação chama o seam e em seguida **repuxa** o estado, em vez de espelhar a mudança no cache local.
- **Boot:** ao montar, se já há token, carrega via `getMe`; se a chamada falha, faz logout. O **login não remonta o Provider** (navegar de tela não recria o contexto), então o fluxo de login dispara um `refresh()` **explícito** pra trazer os dados da conta recém-logada.
- **Refreshes:**
    - `refresh()` — repuxa o `getMe` (silencioso) e devolve os dados.
    - `refreshVictory()` — repuxa e devolve um `Rewards` calculado por **diff** (antes/depois), via `lib/battle.ts`.
    - `refreshDefeat()` — repuxa e devolve o `goldDelta` por diff.

### Libs (lógica pura)

- **`lib/equipmentFilters.ts`** — o tipo `Filters` e a função pura `filterEquipment` (tipo, status principal, sub-status, rating, raridade, preço). Compartilhada por Dashboard e Mercado.
- **`lib/characterStats.ts`** — `computeCharacterStats(level, equipados)` calcula os atributos de combate **no front**, replicando a fórmula dos stats-base da Unity (exibição cosmética, não regra cheatável — ver [[Decisões]]).
- **`lib/inventory.ts`** — ordenações (`sortInventory`, `sortByTypeOrder`) e os `apply*` que espelham as regras do backend no cache.
- **`lib/equipmentVisuals.ts`** — mapeamentos de ícone e cor de raridade.
- **`lib/battle.ts`** — os diffs de recompensa (`diffRewards`, `diffDefeat`) e o type `Rewards`. **Funções puras**, fora do Context: comparam o `/me` antes e depois de uma wave pra derivar XP/gold/drops ganhos (ver [[Integração API]] e [[Decisões]]).
