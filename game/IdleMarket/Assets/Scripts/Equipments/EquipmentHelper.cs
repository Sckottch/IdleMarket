using UnityEngine;

public static class EquipmentHelper
{
    public static StatType GetMainStat(EquipmentType type)
    {
        return type switch
        {
            EquipmentType.Sword => StatType.Attack,
            EquipmentType.Armor => StatType.Defense,
            EquipmentType.Helmet => StatType.Health,
            EquipmentType.Boots => StatType.Speed,
            _ => throw new System.ArgumentException($"Tipo de equipamento inválido: {type}"),
        };
    }

    public static StatRange GetMainStatRange(int rarity) => rarity switch
    {
        1 => new StatRange(5f, 10f),
        2 => new StatRange(10f, 20f),
        3 => new StatRange(20f, 30f),
        4 => new StatRange(30f, 40f),
        5 => new StatRange(40f, 50f),
        _ => throw new System.ArgumentException($"Raridade inválida: {rarity}"),
    };

    public static StatRange GetSubStatRange(StatType statType) => statType switch
    {
        StatType.Health or StatType.Attack or StatType.Defense => new StatRange(10f, 20f),
        StatType.CriticalChance => new StatRange(5f, 15f),
        StatType.CriticalDamage => new StatRange(10f, 30f),
        _ => throw new System.ArgumentException($"Tipo de estatística inválido: {statType}"),
    }; 
}

[System.Serializable]
public struct StatRange
{
    public float min; 
    public float max;

    public StatRange(float min, float max)
    {
        this.min = min;
        this.max = max;
    }

    public float Roll()
    {
        float value = Random.Range(min, max);
        return Mathf.Round(value * 10f) / 10f;
    }

    public float Normalize(float value)
    {
        return Mathf.InverseLerp(min, max, value);
    }
}