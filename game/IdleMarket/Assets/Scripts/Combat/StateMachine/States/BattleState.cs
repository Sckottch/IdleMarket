using UnityEngine;

public class BattleState : ICombatState
{
    public void Enter()
    {
        CombatManager.Instance.StartBattle(isPlayerAlive =>
        {
            if (isPlayerAlive)
            {
                CombatManager.Instance.ChangeCombatState(CombatState.WaveWon);

            }
            else
            {
                CombatManager.Instance.ChangeCombatState(CombatState.Defeat);
            }
        });
    }

    public void Exit()
    {
        
    }

    public void Tick()
    {
        
    }
}
