public class CombatStateMachine
{
    public ICombatState CurrentState { get; private set; }

    public void ChangeState(ICombatState newState)
    {
        CurrentState?.Exit();
        CurrentState = newState;

        CurrentState.Enter();
    }

    public void Tick() => CurrentState?.Tick();
}

public interface ICombatState
{
    void Enter();
    void Tick();
    void Exit();
}