using System;
using System.Collections;

public interface ICombatService
{
    IEnumerator ReportVictory(Action<RewardResult> onResult, int enemyLevel, bool isBoss);

    IEnumerator ReportDefeat(Action<int> onResult);
}
