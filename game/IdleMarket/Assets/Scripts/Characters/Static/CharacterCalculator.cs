using System.Collections.Generic;

public static class CharacterCalculator
{
    public static CharacterStats CalculateStats(CharacterBaseSO characterBase, int level, List<Equipment> equipments)
    {
        CharacterStats baseStats = CalculateBaseStats(characterBase, level);
        Dictionary<StatType, float> bonuses = new();

        equipments ??= new();

        foreach (Equipment equip in equipments)
        {
            AddBonus(bonuses, equip.mainStat, equip.mainStatValue);

            foreach (SubStat sub in equip.subStats)
            {
                AddBonus(bonuses, sub.statType, sub.statValue);
            }
        }

        float Bonus(StatType type) => bonuses.TryGetValue(type, out float value) ? value : 0;

        return new CharacterStats(
            baseStats.health * (1 + Bonus(StatType.Health) / 100),
            baseStats.attack * (1 + Bonus(StatType.Attack) / 100),
            baseStats.defense * (1 + Bonus(StatType.Defense) / 100),
            baseStats.speed + Bonus(StatType.Speed),
            baseStats.criticalChance + Bonus(StatType.CriticalChance),
            baseStats.criticalDamage + Bonus(StatType.CriticalDamage)
        );
    }

    private static CharacterStats CalculateBaseStats(CharacterBaseSO characterBase, int level)
    {
        int levelIndex = level - 1;

        return new CharacterStats(
            characterBase.healthBase + characterBase.healthPerLevel * levelIndex,
            characterBase.attackBase + characterBase.attackPerLevel * levelIndex,
            characterBase.defenseBase + characterBase.defensePerLevel * levelIndex,
            characterBase.speed,
            characterBase.criticalChance,
            characterBase.criticalDamage
        );
    }

    public static bool CanLevelUp(int currentXp, int currentLevel)
    {
        return currentXp >= GetXpForLevel(currentLevel);
    }

    public static int GetXpForLevel(int level)
    {
        return 10 * (level * level) + 100 * level;
    }

    private static void AddBonus(Dictionary<StatType, float> dict, StatType type, float value)
    {
        dict.TryGetValue(type, out float current);
        dict[type] = current + value;
    }
}

[System.Serializable]
public class CharacterStats
{
    public float health;
    public float attack;
    public float defense;
    public float speed;
    public float criticalChance;
    public float criticalDamage;

    public CharacterStats(float health, float attack, float defense, float speed, float criticalChance, float criticalDamage)
    {
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.criticalChance = criticalChance;
        this.criticalDamage = criticalDamage;
    }
}