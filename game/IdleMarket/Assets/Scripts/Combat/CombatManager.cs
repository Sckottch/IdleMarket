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
    [SerializeField] private float waveAnnouncementInterval = 0.5f;

    [Space(10)]
    [Header("Animações dos inimigos")]
    [SerializeField] private RuntimeAnimatorController redEnemyController;
    [SerializeField] private RuntimeAnimatorController blueEnemyController;
    [SerializeField] private RuntimeAnimatorController yellowEnemyController;
    [SerializeField] private RuntimeAnimatorController purpleEnemyController;

    private CombatStateMachine stateMachine = new();
    private EnemyColor lastEnemyColor;

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

    public void SetupWave(Action onSetupEnd)
    {
        StartCoroutine(SetupWaveRoutine(onSetupEnd));
    }

    private IEnumerator SetupWaveRoutine(Action onSetupEnd)
    {
        yield return GameManager.Instance.RefreshPlayerData(null);

        player.Initialize(GameManager.Instance.PlayerData);

        SelectEnemyColor();

        if (IsFinalWave)
        {
            EnemyGenerator.GenerateBossEnemy(enemy, ConfrontationLevel);
        }
        else
        {
            EnemyGenerator.GenerateCommonEnemy(enemy, ConfrontationLevel);
        }

        GameUIManager.Instance.ShowWaveAnnouncement(CurrentWave, maxWaves, IsFinalWave);

        yield return new WaitForSeconds(waveAnnouncementInterval);
        onSetupEnd?.Invoke();
    }

    private void SelectEnemyColor()
    {
        EnemyColor newColor;

        do
        {
            newColor = (EnemyColor)UnityEngine.Random.Range(0, Enum.GetValues(typeof(EnemyColor)).Length);
        }
        while (newColor == lastEnemyColor);

        lastEnemyColor = newColor;
        switch (newColor)
        {
            case EnemyColor.Red:
                enemy.Animator.SetController(redEnemyController);

                break;
            case EnemyColor.Blue:
                enemy.Animator.SetController(blueEnemyController);

                break;
            case EnemyColor.Yellow:
                enemy.Animator.SetController(yellowEnemyController);

                break;
            case EnemyColor.Purple:
                enemy.Animator.SetController(purpleEnemyController);

                break;
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

        attacker.SpriteRenderer.sortingOrder = 1;
        defender.SpriteRenderer.sortingOrder = 0;

        yield return attacker.Animator.Advance();

        attacker.Animator.PlayAttack(result.IsCritical);
        yield return attacker.Animator.WaitForHit();

        defender.TakeDamage(result.Damage);

        if (defender.IsAlive) defender.Animator.PlayGuard();
        else defender.Animator.PlayDeath();

        GameUIManager.Instance.ShowDamageNumber(defender, result);

        yield return attacker.Animator.WaitForAttackEnd();
        yield return attacker.Animator.Return();
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
        GameUIManager.Instance.BindCharacters(player, enemy);
    }

    public EnemyCharacter GetEnemy() => enemy;
    public PlayerCharacter GetPlayer() => player;
    public int GetMaxWaves() => maxWaves;
}