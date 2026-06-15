# Integração com a API (Unity ↔ Backend)

> Contrato de integração entre o jogo (Unity) e o backend (Fastify + Postgres): camada de transporte, autenticação, contrato dos serviços de domínio, princípio mock vs real e os canais de dados. Marca o fechamento da **Fase 3 — Etapa 2**: a comunicação Unity → backend → banco foi validada ponta a ponta no editor.
>
> O **fluxo de boot**, a **máquina de estados** e o **tratamento de erro** moram no [[Sistema de Turnos]]. Os atributos e fórmulas no [[Combate]]; o contrato visual no [[Interface]].

## Duas camadas: transporte vs domínio

A comunicação é separada em duas camadas, cada uma com uma responsabilidade:

- **`ApiClient`** — a camada de **transporte**. Sabe de HTTP, JSON e token; não sabe de "login" nem de "vitória".
- **Serviços de domínio** (`AuthService`, `BattleService`) — sabem das **operações** e chamam o `ApiClient` por baixo.

Login e victory são operações de **domínio**, não de transporte — por isso vivem nos serviços, não no `ApiClient`.

## ApiClient (transporte)

Classe `static` que envolve o `UnityWebRequest`, com métodos genéricos `Post<T>` e `Get<T>`.

- **Serialização centralizada:** as `JsonSerializerSettings` do Newtonsoft ficam num único lugar:
    - `StringEnumConverter` — mapeia enums como string (`"Helmet"` ↔ `EquipmentType.Helmet`).
    - `NullValueHandling.Ignore` — pro `salePrice` nullable.
- **Token JWT como estado ambiente** (`ApiClient.Token`): setado no login e anexado sozinho como header `Authorization: Bearer` em toda chamada.
- **`BuildUrl`** normaliza a barra inicial do path — centraliza a montagem da URL (ver [Lições](#lições--armadilhas-pra-não-repetir)).

## Autenticação (AuthService)

`AuthService` (`static`, sem estado):

- `Login` faz `POST /api/auth/login`, guarda o token no `ApiClient.Token` **e** no `PlayerPrefs` (`"auth_token"`).
- DTOs: `LoginRequest` / `LoginResponse`.

## Contrato dos serviços (IBattleService)

`ICombatService` foi **renomeado para `IBattleService`** — agrupa status + victory + defeat, mapeando 1:1 com `/api/battle/*`. (Motivo: status não é "combate"; o nome agora bate com o grupo de rotas do backend.)

- **Contrato de erro por callback duplo:** `onSuccess` + `onError`. O `onError` (`Action<ApiError>`) está em **todos** os métodos da interface, coerente com o `ApiClient`.
- **Ordem dos parâmetros:** entradas primeiro, depois `onSuccess`, depois `onError`.

| Método | Assinatura | Papel |
| --- | --- | --- |
| `GetStatus` | `GetStatus(Action<PlayerData> onResult, Action<ApiError> onError)` | Canal de **bootstrap E de refresh** (ver [[Sistema de Turnos]]). |
| `ReportVictory` | `ReportVictory(int enemyLevel, bool isBoss, Action<VictoryResult> onResult, Action<ApiError> onError)` | Reporta a wave vencida. |
| `ReportDefeat` | `ReportDefeat(Action onResult, Action<ApiError> onError)` | `onResult` **sem gold** — o resultado da derrota não é consumido pelo jogo (ouro é do React). |

### DTO de vitória

`RewardResult` foi substituído por **`VictoryResult { int level; int xp; }`** — os campos batem **exatamente** com o JSON do backend, então o Newtonsoft desserializa direto. O contrato de vitória **não carrega mais** `gold` nem `equipment`.

## Princípio mock vs real

- O **contrato do callback é idêntico** entre mock e real; a diferença (tem backend ou não) fica escondida **dentro** de cada implementação.
- O `MockBattleService` faz o papel do banco: muta o `PlayerData` internamente (gold, equipamento dropado) e devolve só `{ level, xp }` pelo callback — igual ao real. **Por isso o `GameManager` é idêntico nos dois modos.**
- Os mocks **não foram removidos** (corrige a redação antiga do handoff): ficam como toggle (`useMock`) pra teste offline rápido.

## Canais de dados

Reconcilia o "Contrato de dados do jogo" do [[Interface]]. O jogo tem dois pontos de entrada:

- **`/status` (boot + refresh):** `{ username, level, xp, equipados }`. A **mesma rota** serve para os dois usos — a primeira chamada é o **bootstrap**, as seguintes são **refresh**. É por aqui que entra o **snapshot de equipados**.
- **`/victory`:** `{ level, xp }`. Atualiza a barra de XP e o rebuild de stats. Não carrega ouro nem equipamento.

Ouro, inventário completo e log de drops **não trafegam pro jogo** — são responsabilidade do backend/React.

### O jogo é receptor de equipados

O jogo é **receptor** do estado de equipados; ele **nunca** chama equip/unequip (isso é React → backend). Não existe `IInventoryService` no runtime; o `MockInventoryService` fica só como ferramenta de debug do modo mock.

O snapshot é realizado **puxando** o `/status` a cada `WaveStart` (`RefreshPlayerData`), logo antes do `player.Initialize`. Motivos:

- **Trocas feitas no React entram na próxima wave** — sem necessidade de push.
- **Anti-trapaça:** o estado autoritativo do servidor sobrescreve qualquer adulteração local; a janela de trapaça é `<=` uma wave; a progressão segue autoritativa via `/victory`.
- Re-puxar level/xp a cada wave é coerente com a regra "stats do player atualizam na hora no level-up" — o `confrontationLevel` fica travado à parte no `CombatManager` (ver [[Sistema de Turnos]]).
