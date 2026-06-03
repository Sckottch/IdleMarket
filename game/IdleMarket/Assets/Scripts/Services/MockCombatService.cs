using System;
using System.Collections;
using UnityEngine;

public class MockCombatService : ICombatService
{
    private readonly PlayerData playerData;

    public MockCombatService(PlayerData playerData)
    {
        this.playerData = playerData;
    }

    public IEnumerator ReportDefeat(Action<int> onResult)
    {
        yield return new WaitForSeconds(0.5f);

        int penalty = Mathf.Max(1, Mathf.FloorToInt(playerData.gold * 0.05f));
        int newGold = Mathf.Max(0, playerData.gold - penalty);

        onResult?.Invoke(newGold); 
    }

    public IEnumerator ReportVictory(Action<RewardResult> onResult, int enemyLevel, bool isBoss)
    {
        yield return new WaitForSeconds(0.5f);

        int goldEarned = enemyLevel * 15;
        int experienceEarned = enemyLevel * 25;

        if (isBoss)
        {
            goldEarned *= 2;
            experienceEarned *= 2;
        }

        Equipment equipmentReward = null;

        bool hasEquipmentReward = UnityEngine.Random.value < 0.7f || isBoss;

        if (hasEquipmentReward)
        {
            if (isBoss)
            {
                int rarity = RewardHelper.GetBossRarity(enemyLevel);

                equipmentReward = EquipmentGenerator.GenerateRandomEquipment(rarity);
            }
            else
            {
                int rarity = RandomHelper.WeightedRandomIndex(RewardHelper.GetRarityWeights(enemyLevel)) + 1;

                equipmentReward = EquipmentGenerator.GenerateRandomEquipment(rarity);
            }
        }

        int newGold = playerData.gold + goldEarned;
        int newExperience = playerData.xp + experienceEarned;
        int newLevel = playerData.level;

        while (CharacterCalculator.CanLevelUp(newExperience, newLevel))
        {
            int xpForNextLevel = CharacterCalculator.GetXpForLevelUp(newLevel);

            newLevel++;
            newExperience -= xpForNextLevel;
        }

        onResult?.Invoke(new RewardResult
        {
            Level = newLevel,
            Gold = newGold,
            Experience = newExperience,
            Equipment = equipmentReward
        });
    }
}
