using System;
using System.Collections;

public interface IBattleService
{
    IEnumerator GetStatus(Action<PlayerData> onResult, Action<ApiError> onError);

    IEnumerator ReportVictory(int enemyLevel, bool isBoss, Action<RewardResult> onResult, Action<ApiError> onError);

    IEnumerator ReportDefeat(Action onResult, Action<ApiError> onError);
}
