using System;
using System.Collections;
using UnityEngine;

public class MockBattleService : IBattleService
{
    private readonly PlayerData playerData;

    public MockBattleService(PlayerData playerData)
    {
        this.playerData = playerData;
    }

    public IEnumerator GetStatus(Action<PlayerData> onResult, Action<ApiError> onError)
    {
        yield return new WaitForSeconds(0.5f);

        onResult?.Invoke(playerData);
    }

    public IEnumerator ReportDefeat(Action onResult, Action<ApiError> onError)
    {
        yield return new WaitForSeconds(0.5f);

        int penalty = Mathf.Max(1, Mathf.FloorToInt(playerData.gold * 0.05f));
        int newGold = Mathf.Max(0, playerData.gold - penalty);

        //ouro existe apenas no backend, jogo não vai receber esse valor
        playerData.gold = newGold;

        onResult?.Invoke(); 
    }

    public IEnumerator ReportVictory(int enemyLevel, bool isBoss, Action<RewardResult> onResult, Action<ApiError> onError)
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

        bool hasEquipmentReward = UnityEngine.Random.value < 0.6f || isBoss;

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

            equipmentReward.id = Guid.NewGuid().ToString();
        }

        int newExperience = playerData.xp + experienceEarned;
        int newLevel = playerData.level;

        while (CharacterCalculator.CanLevelUp(newExperience, newLevel))
        {
            int xpForNextLevel = CharacterCalculator.GetXpForLevelUp(newLevel);

            newLevel++;
            newExperience -= xpForNextLevel;
        }

        //recompensas que são apenas aplicadas no backend
        playerData.gold += goldEarned;
        if (hasEquipmentReward) playerData.equipments.Add(equipmentReward);

        onResult?.Invoke(new RewardResult
        {
            level = newLevel,
            xp = newExperience,
        });
    }
}
