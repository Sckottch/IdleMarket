using System.Collections.Generic;
using UnityEngine;

public static class EnemyGenerator
{
    public static void GenerateCommonEnemy(EnemyCharacter enemy, int playerLevel)
    {
        int offset = (Random.value < 0.4f) ? 1 : 0;
        int level = Mathf.Max(1, playerLevel - offset);

        int pieceCount = RandomHelper.GetPieceCount(level);

        List<Equipment> equipments = GenerateEnemyEquipment(pieceCount, () => GetRarity(level));

        enemy.Initialize(level, equipments);
    }

    public static void GenerateBossEnemy(EnemyCharacter enemy, int playerLevel)
    {
        int level = playerLevel + 1;

        int pieceCount = GetBossPieceCount(level);

        List<Equipment> equipments = GenerateEnemyEquipment(pieceCount, () => GetBossPieceRarity(level));

        enemy.Initialize(level, equipments);
    }

    private static List<Equipment> GenerateEnemyEquipment(int pieceCount, System.Func<int> getRarity)
    {
        List<Equipment> equipments = new();

        List<EquipmentType> typePool = new()
        {
            EquipmentType.Helmet, EquipmentType.Sword,
            EquipmentType.Armor, EquipmentType.Boots
        };

        for (int i = 0; i < pieceCount; i++)
        {
            int index = Random.Range(0, typePool.Count);
            EquipmentType type = typePool[index];
            typePool.RemoveAt(index);

            equipments.Add(EquipmentGenerator.GenerateEquipment(getRarity(), type));
        }

        return equipments;
    }

    private static int GetRarity(int level)
    {
        float[] weights = RandomHelper.GetRarityWeights(level);
        return RandomHelper.WeightedRandomIndex(weights) + 1;
    }

    private static int GetBossPieceCount(int level) => level switch
    {
        <= 5 => 1,
        <= 10 => 2,
        <= 20 => 3,
        _ => 4
    };

    private static int GetBossPieceRarity(int level) => level switch
    {
        <= 5 => 1,
        <= 10 => 2,
        <= 30 => 3,
        <= 40 => 4,
        _ => 5
    };
}