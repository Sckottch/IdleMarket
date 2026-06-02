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
}
