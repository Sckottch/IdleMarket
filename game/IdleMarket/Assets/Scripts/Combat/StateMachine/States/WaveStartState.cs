using UnityEngine;

public class WaveStartState : ICombatState
{
    public void Enter()
    {
        CombatManager.Instance.SetupWave(() => CombatManager.Instance.ChangeCombatState(CombatState.Battle));
    }

    public void Exit()
    {
        
    }

    public void Tick()
    {
        
    }
}
