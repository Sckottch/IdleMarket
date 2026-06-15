# Planejamento do Sistema de Turnos

> Sistema responsável por orquestrar o combate automático em tempo real, dividido em waves. Complementa o [[Combate]] — que define os atributos e as fórmulas — sendo que aqui o foco é a **arquitetura e o fluxo**.

## Visão Geral

O combate é um *auto battler*: jogador e inimigo trocam golpes automaticamente, sem input, até a vida de um zerar. Cada confronto tem **5 waves** (4 comuns + 1 chefão). A execução é em **tempo real**, com pausas entre os turnos para animações e feedback visual — não instantânea.

O fluxo é orquestrado por uma **State Machine**: o combate está sempre em exatamente um estado, com transições explícitas entre eles.

## Decisões de Design

- **Tempo real, não instantâneo:** os turnos acontecem com intervalo (via coroutine), permitindo animações e exibição do dano. Resolver tudo de uma vez tiraria a graça de assistir ao combate.
- **State Machine para o fluxo:** ao invés de um emaranhado de booleans (`isFighting`, `waveOver`, `playerDead`...), um único `currentState` com transições explícitas. Combinações de estado inválidas se tornam impossíveis.
- **Fórmulas centralizadas no `CombatCalculator`:** classe estática que só recebe atacante/defensor e devolve valores. Sem estado, sem dependência de cena — mesmo padrão do `CharacterCalculator` e do `EquipmentHelper`.
- **Dano em `float`:** simplifica os cálculos percentuais (crítico, bônus de status) e o fluxo geral. A vida dos personagens também é float.
- **Níveis dos inimigos travados no início do confronto:** o nível do jogador é salvo uma vez no começo (`confrontationLevel`) e usado para gerar todos os inimigos. Subir de nível no meio do confronto não altera os inimigos já planejados.
- **Geração no início de cada wave:** o inimigo e o loadout do jogador são definidos quando a wave começa, não antes. Evita salvar dados que podem ser gerados na hora e impede o bug de o jogador trocar de equipamento no meio de um ataque.
- **Gancho de recompensas no estado `WaveWon`:** o ponto onde o combate dispara `ReportVictory` (`POST /api/battle/victory`) e segue. Na Fase 1 era mock; na **Fase 3 — Etapa 2** passou a chamar o backend real (ver [[Integração API]]). A state machine **sempre avança** — o `onComplete` dispara tanto no sucesso quanto no erro, pra um POST que falha nunca congelar o combate (ver [Tratamento de Erro](#tratamento-de-erro-e-criticidade)).

---

## A State Machine

```
              (entra no confronto)
                      │
                      ▼
              ┌─────────────┐
       ┌─────>│  WaveStart  │
       │      └─────────────┘
       │              │ (setup pronto)
       │              ▼
       │      ┌─────────────┐
       │      │   Battle    │
       │      └─────────────┘
       │         │        │
inimigo morreu   │        │  jogador morreu
       │         ▼        ▼
       │   ┌──────────┐  ┌──────────┐
       └───│ WaveWon  │  │  Defeat  │
  (há mais └──────────┘  └──────────┘
   waves)       │              │ (-5% ouro)
                │ (era a       └──> volta pra WaveStart (wave 1)
                ▼  wave 5)
          ┌──────────┐
          │ Victory  │
          └──────────┘
```

### Tabela de Estados

| Estado     | Responsabilidade                                          | Transiciona para                               |
| ---------- | --------------------------------------------------------- | ---------------------------------------------- |
| WaveStart  | Puxa `/status` (`RefreshPlayerData`) antes do `player.Initialize`; gera inimigo + loadout do player, reseta HP, define ordem; mostra o aviso de wave e segura ~0,5s antes do Battle (deixou de ser instantâneo) | Battle                                         |
| Battle     | Troca de golpes em tempo real (coroutine)                 | WaveWon (inimigo morre) / Defeat (player morre)|
| WaveWon    | Dispara `ReportVictory` (`/victory`); checa se há mais waves (avança no sucesso **ou** no erro) | WaveStart (há waves) / Victory (era a wave 5)  |
| Defeat     | Aplica penalidade de -5% de ouro                          | WaveStart (reinicia wave 1)                    |
| Victory    | Recompensas finais; encerra o confronto                   | — (sai do combate)                             |

---

## Mecânica de Turno

> As fórmulas de dano e os atributos base estão no [[Combate]]. Aqui fica o **fluxo** de um turno.

- O personagem de **maior velocidade** ataca primeiro. Em caso de empate, o **jogador** age primeiro.
- A cada turno, jogador e inimigo atacam **uma vez**.
- A morte é checada **entre os dois ataques**: se o primeiro golpe já mata o alvo, o segundo **não revida**.
- O **crítico é rolado por ataque** — cada golpe individual pode ou não ser crítico.

---

## Níveis dos Inimigos no Confronto

- No início do confronto, salva-se uma vez `confrontationLevel = nível atual do jogador`.
- Cada inimigo é gerado a partir desse valor (comum: 60% mesmo nível / 40% um abaixo, mínimo 1; chefão: `confrontationLevel + 1`). A tabela completa de geração está no [[Combate]].
- Na **derrota**, o confronto reinicia da wave 1 **mantendo o mesmo** `confrontationLevel` — é o mesmo confronto.
- O `confrontationLevel` só é re-capturado quando um confronto **novo** começa (após uma vitória completa).

---

## Recompensas e Integração (Fase 3 — Etapa 2)

- A cada inimigo derrotado, o jogador ganha XP, ouro e (possivelmente) um equipamento. As fórmulas estão no [[Recompensas]].
- Na **Fase 1** isso era mock; na **Fase 3 — Etapa 2** o Backend assumiu o cálculo e a persistência. O `WaveWon` chama `ReportVictory` (`POST /api/battle/victory`) e recebe de volta só `{ level, xp }` (ver [[Integração API]]).
- O `MockBattleService` continua existindo como toggle (`useMock`): faz o papel do banco internamente e devolve o mesmo `{ level, xp }`, então o `GameManager` é idêntico nos dois modos.
- **Level-up no meio do confronto:** os atributos do jogador atualizam imediatamente, mas o nível dos inimigos **não muda** (já travado no `confrontationLevel`).

---

## Fluxo de Boot

O combate **não começa mais** num `Start` síncrono. O início passou a ser orquestrado por um boot assíncrono:

- A **`BootScene`** passou a ser usada (estava vazia desde o setup). O `GameManager` (`DontDestroyOnLoad`) vive nela, roda o boot e só então carrega a `GameScene`.
- **`Boot()` é uma coroutine** que ramifica internamente por `useMock`:
    - **Mock:** fabrica `PlayerData` + `MockBattleService`, pula o login e pula o `LoadScene`.
    - **Real:** `Login` → segue.
    - Os dois caminhos convergem: `GetStatus` → atribui `PlayerData` → _(só no real:_ `LoadScene("GameScene")` + espera o `CombatManager` existir_)_ → `ChangeCombatState(Idle)` **no fim**. Esse é o **ponto único de início do combate**.
- **`CombatManager.Start` não inicia mais o combate** (é disparado pelo fim do `Boot`) — evita corrida no caminho mock-direto.
- **Padrão fallback-bootstrap:** há **também** um `GameManager` na `GameScene` com `useMock=true`, pra dar Play direto na `GameScene` e testar sem passar pela `BootScene`. Exige que o guard do singleton seja **"o primeiro vence"** (destrói o recém-chegado), pra o `GameManager` da `BootScene` sobreviver. Recomendado: `GameManager` como **prefab**, sobrescrevendo só o `useMock` por cena, pra não duplicar config.
- **Build Settings:** a `BootScene` no índice 0; a `GameScene` precisa estar listada.

---

## Tratamento de Erro e Criticidade

O contrato de erro é por **callback duplo** (`onSuccess` + `onError`, ver [[Integração API]]). A mesma chamada pode ter criticidades diferentes conforme o contexto:

- **`GetStatus` no boot = CRÍTICO:** sem `PlayerData` o jogo não começa → aborta/halt. _(Futuro: retry + tela "sem conexão".)_
- **`GetStatus` no refresh do `WaveStart` = BEST-EFFORT:** o jogo já tem um `PlayerData` válido → na falha, loga e **segue** com o estado atual; **nunca congela**.

**Regra "a state machine sempre avança":** nos wrappers `ReportVictory` / `ReportDefeat` do `GameManager`, o `onComplete` é chamado **tanto no sucesso quanto no erro**, pra um POST que falha nunca congelar a SM (`WaveWon` → próxima wave; `Defeat` → reinício do combate). É seguro porque:

- exatamente **um** callback dispara (sem duplo disparo);
- a derrota é não-crítica;
- a vitória **reconcilia no próximo refresh** (`/status` da próxima wave);
- **não há re-POST**, logo sem processamento duplo.

> Cosmético: a barra de XP não anima numa vitória que falha — reconcilia no próximo evento de progressão.

---

## Arquitetura de Código

| Classe              | Tipo            | Papel                                                        |
| ------------------- | --------------- | ------------------------------------------------------------ |
| `CombatManager`     | MonoBehaviour   | Dono do sistema: segura a state machine, as referências de player/enemy e roda a coroutine de batalha. Expõe os métodos que os estados usam. |
| `CombatStateMachine`| classe          | Guarda o estado atual e faz `ChangeState` (Exit do atual → Enter do novo). |
| `ICombatState`      | interface       | Contrato dos estados: `Enter()`, `Tick()`, `Exit()`.        |
| Estados concretos   | classes         | `WaveStartState`, `BattleState`, `WaveWonState`, `DefeatState`, `VictoryState`. |
| `CombatCalculator`  | classe estática | Fórmulas de dano. Recebe stats, devolve valores. Não toca em cena nem em estado. |

> O `GameManager` (`DontDestroyOnLoad`) é o dono do boot e dos wrappers de vitória/derrota; ele fala com o backend pela camada de serviços (`IBattleService`). Essa camada e o transporte estão documentados em [[Integração API]].

### Contrato dos estados

```csharp
public interface ICombatState
{
    void Enter();   // roda uma vez ao entrar
    void Tick();    // roda a cada frame enquanto está no estado
    void Exit();    // roda uma vez ao sair
}
```

### A máquina

```csharp
public class CombatStateMachine
{
    public ICombatState Current { get; private set; }

    public void ChangeState(ICombatState newState)
    {
        Current?.Exit();
        Current = newState;
        Current.Enter();
    }

    public void Tick() => Current?.Tick();
}
```

### O tempo real

O estado **Battle** dispara, no seu `Enter`, uma coroutine no `CombatManager`:

```
RunBattle():
  enquanto ambos vivos:
    mais rápido executa a coreografia do ataque
      (avança → ataca → aguarda o sinal de impacto OnHit → aplica dano → volta)
    se alvo morreu → break
    mais lento executa a coreografia
    se alvo morreu → break
  inimigo morreu → ChangeState(WaveWon)
  jogador morreu → ChangeState(Defeat)
```

Os estados decidem **o que** fazer; o `CombatManager` tem as **ferramentas** (coroutine, referências, spawn).