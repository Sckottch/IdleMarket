using UnityEngine;

public class IdleState : ICombatState
{
    public void Enter()
    {
        CombatManager.Instance.StartCombat();
        CombatManager.Instance.ChangeCombatState(CombatState.WaveStart);
    }

    public void Exit()
    {
        
    }

    public void Tick()
    {
        
    }
}
