using UnityEngine;

public class WaveWonState : ICombatState
{
    public void Enter()
    {
        CombatManager manager = CombatManager.Instance;

        if (manager.IsFinalWave)
        {
            GameManager.Instance.ReportVictory(manager.GetEnemy().Level, true, () =>
            {
                manager.ChangeCombatState(CombatState.Victory);
            });

        }
        else
        {
            GameManager.Instance.ReportVictory(manager.GetEnemy().Level, false, () =>
            {
                manager.NextWave();
            });
        }
    }

    public void Exit()
    {
        
    }

    public void Tick()
    {
        
    }
}
