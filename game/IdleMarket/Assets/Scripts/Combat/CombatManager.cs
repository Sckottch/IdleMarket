using UnityEngine;

public class CombatManager : SingletonMonoBehaviour<CombatManager>
{
    [SerializeField] private int maxWaves = 5;

    private CombatStateMachine stateMachine = new();

    #region Combat States

    private WaveStartState waveStartState = new();
    private DefeatState defeatState = new();

    #endregion

    public CombatState CurrentCombatState {  get; private set; } = CombatState.Idle;

    public int CurrentWave { get; private set; }

    public bool IsFinalWave => CurrentWave == maxWaves;

    public void ChangeCombatState(CombatState state)
    {
        CurrentCombatState = state;

        switch (state)
        {
            case CombatState.Idle:

                break;

            case CombatState.WaveStart:
                stateMachine.ChangeState(waveStartState);

                break;

            case CombatState.Battle:

                break;

            case CombatState.WaveWon:

                break;

            case CombatState.Defeat:
                stateMachine.ChangeState(defeatState);

                break;

            case CombatState.Victory:

                break;
        }
    }

    public void RestartCombat()
    {
        CurrentWave = 1;
        ChangeCombatState(CombatState.WaveStart);
    }
}