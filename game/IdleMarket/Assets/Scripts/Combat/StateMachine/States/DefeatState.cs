using UnityEngine;

public class DefeatState : ICombatState
{
    public void Enter()
    {
        GameManager.Instance.ReportDefeat(() => CombatManager.Instance.RestartCombat());
    }

    public void Exit()
    {
        
    }

    public void Tick()
    {
        
    }
}
