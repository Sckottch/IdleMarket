using UnityEngine;

public static class RewardHelper 
{
    public static float[] GetRarityWeights(int enemyLevel) =>  enemyLevel switch
    {
        <= 4 => new float[] { 75, 25, 0, 0, 0 },
        <= 14 => new float[] { 10, 60, 30, 0, 0 },
        <= 24 => new float[] { 0, 10, 60, 30, 0 },
        <= 34 => new float[] { 0, 0, 10, 60, 30 },
        <= 44 => new float[] { 0, 0, 0, 25, 75 },
        _ => new float[] { 0, 0, 0, 0, 100 }
    };

    public static int GetBossRarity(int enemyLevel) => enemyLevel switch
    {
        <= 4 => 2,
        <= 14 => 3,
        <= 24 => 4,
        _ => 5
    };
}

public struct RewardResult
{
    public int Level;
    public int Gold;
    public int Experience;
    public Equipment Equipment;

    public RewardResult(int level, int gold, int experience, Equipment equipment)
    {
        Level = level;
        Gold = gold;
        Experience = experience;
        Equipment = equipment;
    }
}