public static class CharacterCalculator
{
    public static CharacterStats CalculateBaseStats(CharacterBaseSO characterBase, int level)
    {
        int levelIndex = level - 1;

        return new CharacterStats(
            characterBase.healthBase + characterBase.healthPerLevel * levelIndex,
            characterBase.atackBase + characterBase.atackPerLevel * levelIndex,
            characterBase.defenseBase + characterBase.defensePerLevel * levelIndex,
            characterBase.speed,
            characterBase.criticalChance,
            characterBase.criticalDamage
        );
    }

    public static bool CanLevelUP(int currentXp, int currentLevel)
    {
        return currentXp >= GetXpForLevel(currentLevel);
    }

    public static int GetXpForLevel(int level)
    {
        return 10 * level ^ 2 + 100 * level;
    }
}

[System.Serializable]
public class CharacterStats
{
    public float health;
    public float atack;
    public float defense;
    public float speed;
    public float criticalChance;
    public float criticalDamage;

    public CharacterStats(float health, float atack, float defense, float speed, float criticalChance, float criticalDamage)
    {
        this.health = health;
        this.atack = atack;
        this.defense = defense;
        this.speed = speed;
        this.criticalChance = criticalChance;
        this.criticalDamage = criticalDamage;
    }
}