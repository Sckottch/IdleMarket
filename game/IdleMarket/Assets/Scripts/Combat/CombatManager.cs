using System;
using System.Collections;
using UnityEngine;

public class CombatManager : SingletonMonoBehaviour<CombatManager>
{
    [Header("Referências")]
    [SerializeField] private PlayerCharacter player;
    [SerializeField] private EnemyCharacter enemy;

    [Space(10)]
    [Header("Configurações do Combate")]
    [SerializeField] private int maxWaves = 5;
    [SerializeField] private float turnInterval = 0.3f;

    private CombatStateMachine stateMachine = new();

    #region Combat States

    private IdleState idleState = new();
    private WaveStartState waveStartState = new();
    private BattleState battleState = new();
    private WaveWonState waveWonState = new();
    private DefeatState defeatState = new();
    private VictoryState victoryState = new();

    #endregion

    public CombatState CurrentCombatState {  get; private set; }

    public int CurrentWave { get; private set; }
    public int ConfrontationLevel {  get; private set; }

    public bool IsFinalWave => CurrentWave == maxWaves;

    public void ChangeCombatState(CombatState state)
    {
        CurrentCombatState = state;

        switch (state)
        {
            case CombatState.Idle:
                stateMachine.ChangeState(idleState);

                break;

            case CombatState.WaveStart:
                stateMachine.ChangeState(waveStartState);

                break;

            case CombatState.Battle:
                stateMachine.ChangeState(battleState);

                break;

            case CombatState.WaveWon:
                stateMachine.ChangeState(waveWonState);

                break;

            case CombatState.Defeat:
                stateMachine.ChangeState(defeatState);

                break;

            case CombatState.Victory:
                stateMachine.ChangeState(victoryState);

                break;
        }
    }

    public void SetupWave()
    {
        player.Initialize(GameManager.Instance.PlayerData);

        // Add here logic to change enemy's sprite each wave

        if (IsFinalWave)
        {
            EnemyGenerator.GenerateBossEnemy(enemy, ConfrontationLevel);
        }
        else
        {
            EnemyGenerator.GenerateCommonEnemy(enemy, ConfrontationLevel);
        }  
    }

    public void NextWave()
    {
        CurrentWave++;

        ChangeCombatState(CombatState.WaveStart);
    }

    public void StartBattle(Action<bool> onBattleEnd)
    {
        StartCoroutine(RunBattle(onBattleEnd));
    }

    public IEnumerator RunBattle(Action<bool> onBattleEnd)
    {
        Character first, second;

        if(player.Stats.speed >= enemy.Stats.speed)
        {
            first = player;
            second = enemy;
        }
        else
        {
            first = enemy;
            second = player;
        }

        while (first.IsAlive && second.IsAlive)
        {
            yield return StartCoroutine(PerformAttack(first, second));

            if(second.IsAlive)
            {
                yield return StartCoroutine(PerformAttack(second, first));
            }
        }

        onBattleEnd?.Invoke(player.IsAlive);
    }

    private IEnumerator PerformAttack(Character attacker, Character defender)
    {
        DamageResult result = CombatCalculator.CalculateDamage(attacker.Stats, defender.Stats);

        defender.TakeDamage(result.Damage);

        //add animations here

        Debug.Log($"{attacker.name} dealt {result.Damage} damage to {defender.name}. Was Critical hit: {result.IsCritical}");
        Debug.Log($"{defender.name} has {defender.CurrentHealth} health left.");

        yield return new WaitForSeconds(turnInterval);
    }

    public void RestartCombat()
    {
        CurrentWave = 1;
        ChangeCombatState(CombatState.WaveStart);
    }

    public void StartCombat()
    {
        CurrentWave = 1;
        ConfrontationLevel = GameManager.Instance.PlayerData.level;
    }

    public EnemyCharacter GetEnemy() => enemy;
    public PlayerCharacter GetPlayer() => player;
}