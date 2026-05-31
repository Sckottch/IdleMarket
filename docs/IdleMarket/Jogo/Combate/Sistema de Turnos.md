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
- **Gancho de recompensas no estado `WaveWon`:** na fase 1 é mock; na fase 3 é o ponto onde o combate "pausa" esperando a resposta do Backend (rota `/victory`) antes de seguir para a próxima wave.

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
| WaveStart  | Gera inimigo + loadout do player, reseta HP, define ordem | Battle                                         |
| Battle     | Troca de golpes em tempo real (coroutine)                 | WaveWon (inimigo morre) / Defeat (player morre)|
| WaveWon    | Espera recompensas; checa se há mais waves                | WaveStart (há waves) / Victory (era a wave 5)  |
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

## Recompensas (preparação para a Fase 3)

- A cada inimigo derrotado, o jogador ganha XP, ouro e (possivelmente) um equipamento. As fórmulas estão no [[Recompensas]].
- Na **fase 1** isso é mock; na **fase 3** o Backend assume o cálculo e a persistência.
- O estado **WaveWon** é o ponto de espera dessas recompensas entre waves.
- **Level-up no meio do confronto:** os atributos do jogador atualizam imediatamente, mas o nível dos inimigos **não muda** (já travado no início).

---

## Arquitetura de Código

| Classe              | Tipo            | Papel                                                        |
| ------------------- | --------------- | ------------------------------------------------------------ |
| `CombatManager`     | MonoBehaviour   | Dono do sistema: segura a state machine, as referências de player/enemy e roda a coroutine de batalha. Expõe os métodos que os estados usam. |
| `CombatStateMachine`| classe          | Guarda o estado atual e faz `ChangeState` (Exit do atual → Enter do novo). |
| `ICombatState`      | interface       | Contrato dos estados: `Enter()`, `Tick()`, `Exit()`.        |
| Estados concretos   | classes         | `WaveStartState`, `BattleState`, `WaveWonState`, `DefeatState`, `VictoryState`. |
| `CombatCalculator`  | classe estática | Fórmulas de dano. Recebe stats, devolve valores. Não toca em cena nem em estado. |

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
    mais rápido ataca  →  espera X seg (animação)
    se alvo morreu → break
    mais lento ataca   →  espera X seg
    se alvo morreu → break
  inimigo morreu → ChangeState(WaveWon)
  jogador morreu → ChangeState(Defeat)
```

Os estados decidem **o que** fazer; o `CombatManager` tem as **ferramentas** (coroutine, referências, spawn).