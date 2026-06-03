using UnityEngine;

public class VictoryState : ICombatState
{
    public void Enter()
    {
        CombatManager.Instance.ChangeCombatState(CombatState.Idle);
    }
    public void Exit()
    {

    }
    public void Tick()
    {

    }

}
