using System;
using UnityEngine;

public class GameManager : SingletonMonoBehaviour<GameManager>
{
    [SerializeField] private bool useMock = true;

    public PlayerData PlayerData { get; private set; }

    public ICombatService CombatService { get; private set; }
    public MockInventoryService InventoryService { get; private set; }

    #region Events

    public event Action OnProgressionChanged;

    #endregion

    protected override void Awake()
    {
        base.Awake();

        DontDestroyOnLoad(gameObject);

        if(useMock)
        {
            PlayerData = new PlayerData
            {
                id = Guid.NewGuid().ToString(),
                username = "TestPlayer",
                gold = 100,
                level = 1,
                xp = 0
            };

            CombatService = new MockCombatService(PlayerData);
            InventoryService = new MockInventoryService(PlayerData);
        }
        else
        {
            //CombatService = new CombatService();
        }
    }

    private void Start()
    {
        CombatManager.Instance.ChangeCombatState(CombatState.Idle);
    }

    public void ReportDefeat(Action onComplete)
    {
        StartCoroutine(CombatService.ReportDefeat(newGold =>
        {
            PlayerData.gold = newGold;

            Debug.Log($"Player's new gold amount after defeat: {PlayerData.gold}");

            onComplete?.Invoke();
        }));
    }

    public void ReportVictory(int enemyLevel, bool isBoss, Action onComplete)
    {
        StartCoroutine(CombatService.ReportVictory(result =>
        {
            PlayerData.level = result.Level;
            PlayerData.gold = result.Gold;
            PlayerData.xp = result.Experience;
            if (result.Equipment != null)
            {
                PlayerData.equipments.Add(result.Equipment);
            }

            Debug.Log($"Player's new gold amount after victory: {PlayerData.gold}");
            Debug.Log($"Player's new XP amount after victory: {PlayerData.xp}");

            OnProgressionChanged?.Invoke();

            onComplete?.Invoke();  
        }, 
        enemyLevel, isBoss));
    }
}
