using System;
using UnityEngine;

public class GameManager : SingletonMonoBehaviour<GameManager>
{
    [SerializeField] private bool useMock = true;

    public PlayerData PlayerData { get; private set; }

    public ICombatService CombatService { get; private set; }

    protected override void Awake()
    {
        base.Awake();

        DontDestroyOnLoad(gameObject);

        if(useMock)
        {
            CombatService = new MockCombatService(PlayerData);
        }
        else
        {
            //CombatService = new CombatService();
        }
    }

    public void ReportDefeat(Action onComplete)
    {
        StartCoroutine(CombatService.ReportDefeat(newGold =>
        {
            PlayerData.gold = newGold;
            onComplete?.Invoke();

            Debug.Log($"Player's new gold amount after defeat: {PlayerData.gold}");
        }));
    }
}
