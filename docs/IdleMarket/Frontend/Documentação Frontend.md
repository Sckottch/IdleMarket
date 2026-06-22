## Visão Geral

Interface web construída em React que serve como o hub do jogador fora da Unity. Nela, o usuário gerencia sua conta, visualiza os atributos do personagem, equipa ou desequipa itens e interage com a economia viva do jogo através do mercado de trocas. A **Fase 4** entregou todas as telas funcionando com dados mockados, prontas pra receber dados reais na Fase 5.

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

### Seams assíncronos (`data/`)

Cada ponto que vai falar com o backend na Fase 5 já existe como uma **função assíncrona** na pasta `data/`. Na Fase 4 elas devolvem fixtures; na Fase 5 a implementação troca pra `fetch` — **a assinatura não muda**, então nenhuma tela precisa ser reescrita, e o `loading` já está embutido no contrato `async` desde o dia 1 (ver [[Decisões]]).

- **`playerService.getMe()`** → `{ status, inventory }` — status do jogador (incl. `xpForNextLevel`) + inventário completo.
- **`marketService`** → `getListings`, `buy`, `sell`, `unlist`.
- **`equipmentService`** → `equipItem`, `unequipItem`, `deleteEquipment`.
- **`authService`** → `login`, `register`, `logout`.

### PlayerContext (cache + refresh)

`context/PlayerContext.tsx` é a fonte de verdade do estado do jogador no front. Mantém `status`, `inventory` e `loading`; expõe as ações (`equip`, `unequip`, `deleteItem`, `buyItem`, `sellItem`, `unlistItem`, `logout`) e um **`refresh()`** que repuxa o `getMe` e devolve os dados.

- Na Fase 4, cada ação chama o seam e **espelha a mudança no cache local** (funções puras de `lib/inventory.ts`: `applyEquip`, `applyUnequip`, etc.).
- Na Fase 5, o servidor vira a fonte autoritativa: troca-se o apply local pela resposta da API / um `refresh()`.

### Libs (lógica pura)

- **`lib/equipmentFilters.ts`** — o tipo `Filters` e a função pura `filterEquipment` (tipo, status principal, sub-status, rating, raridade, preço). Compartilhada por Dashboard e Mercado.
- **`lib/characterStats.ts`** — `computeCharacterStats(level, equipados)` calcula os atributos de combate **no front**, replicando a fórmula dos stats-base da Unity (exibição cosmética, não regra cheatável — ver [[Decisões]]).
- **`lib/inventory.ts`** — ordenações (`sortInventory`, `sortByTypeOrder`) e os `apply*` que espelham as regras do backend no cache.
- **`lib/equipmentVisuals.ts`** — mapeamentos de ícone e cor de raridade.
