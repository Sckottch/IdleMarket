using System.Collections.Generic;
using UnityEngine;

public class EnemyCharacter : Character
{
    public int Level { get; private set; }

    public void Initialize(int level, List<Equipment> equipments)
    {
        Level = level;
        InitializeStats(level, equipments);
        Initialized();
    }
}
