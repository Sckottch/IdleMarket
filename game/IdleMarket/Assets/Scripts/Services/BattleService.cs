using System;
using System.Collections;
using UnityEngine;

//DTOs
public class VictoryRequest { public int enemyLevel; public bool isBoss; }
public class DefeatResponse { public int gold; }

public class BattleService : IBattleService
{
    public IEnumerator GetStatus(Action<PlayerData> onResult, Action<ApiError> onError)
    {
        yield return ApiClient.Get<PlayerData>("/api/battle/status", onResult, onError);
    }

    public IEnumerator ReportDefeat(Action onResult, Action<ApiError> onError)
    {
        yield return ApiClient.Post<DefeatResponse>("/api/battle/defeat", null, response =>
        {
            onResult?.Invoke();
        },
        onError);
    }

    public IEnumerator ReportVictory(int enemyLevel, bool isBoss, Action<RewardResult> onResult, Action<ApiError> onError)
    {
        VictoryRequest body = new() { enemyLevel = enemyLevel, isBoss = isBoss };

        yield return ApiClient.Post<RewardResult>("/api/battle/victory", body, onResult, onError);
    }
}
