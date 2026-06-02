using System;
using System.Collections;

public interface ICombatService
{
    IEnumerator ReportDefeat(Action<int> onResult);
}
