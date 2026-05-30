using UnityEngine;

public class EnemyCharacter : Character
{
    public int Level { get; private set; }

    public void Initialize(int level)
    {
        Level = level;
        InitializeStats(level);
    }
}
