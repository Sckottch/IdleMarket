using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public static class EquipmentGenerator
{
    public static Equipment GenerateRandomEquipment(int rarity)
    {
        EquipmentType randomType = (EquipmentType)UnityEngine.Random.Range(
            0, Enum.GetValues(typeof(EquipmentType)).Length);

        return GenerateEquipment(rarity, randomType);
    }

    public static Equipment GenerateEquipment(int rarity, EquipmentType type)
    {
        StatType mainStat = EquipmentHelper.GetMainStat(type);

        List<SubStat> subStats = GetSubStatsByRarity(rarity);

        float mainStatValue = EquipmentHelper.GetMainStatRange(rarity).Roll();
        int rating = GenerateRating(mainStatValue, subStats, rarity);

        return new Equipment(
            type, rarity, mainStat, mainStatValue, rating, subStats
        );   
    }

    private static List<SubStat> GetSubStatsByRarity(int rarity)
    {
        List<SubStat> subStats = new();

        List<StatType> pool = new()
        {
            StatType.Health, StatType.Attack, StatType.Defense,
            StatType.CriticalChance, StatType.CriticalDamage
        };

        int subStatCount = rarity - 1;

        for (int i = 0; i < subStatCount; i++)
        {
            int index = UnityEngine.Random.Range(0, pool.Count);
            StatType subStatType = pool[index];
            pool.RemoveAt(index);
            
            StatRange statRange = EquipmentHelper.GetSubStatRange(subStatType);

            float subStatValue = statRange.Roll();
            subStats.Add(new SubStat(subStatType, subStatValue));
        }

        return subStats;
    }

    private static int GenerateRating(float mainStatValue, List<SubStat> subStats, int rarity)
    {
        List<float> scores = new();

        StatRange mainStatRange = EquipmentHelper.GetMainStatRange(rarity);

        scores.Add(mainStatRange.Normalize(mainStatValue) * 100f);

        foreach (SubStat subStat in subStats)
        {
            StatRange subStatRange = EquipmentHelper.GetSubStatRange(subStat.statType);
            scores.Add(subStatRange.Normalize(subStat.statValue) * 100f);
        }

        return Mathf.RoundToInt(scores.Average());
    }
}