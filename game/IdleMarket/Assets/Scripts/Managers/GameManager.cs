using System;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : SingletonMonoBehaviour<GameManager>
{
    [SerializeField] private bool useMock = true;

    [SerializeField] private string testUsername;
    [SerializeField] private string testPassword;

    public PlayerData PlayerData { get; private set; }

    public IBattleService BattleService { get; private set; }
    public MockInventoryService InventoryService { get; private set; }

    #region Events

    public event Action OnProgressionChanged;

    #endregion

    protected override void Awake()
    {
        base.Awake();

        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        StartCoroutine(Boot());
    }

    private IEnumerator Boot()
    {
        if (useMock)
        {
            PlayerData mockData = new()
            {
                id = Guid.NewGuid().ToString(),
                username = "TestPlayer",
                gold = 100,
                level = 1,
                xp = 0
            };

            BattleService = new MockBattleService(mockData);
            InventoryService = new MockInventoryService(mockData);
        }
        else
        {
            BattleService = new BattleService();

            bool loginOk = false;

            yield return AuthService.Login(testUsername, testPassword, () => loginOk = true, error =>
            {
                Debug.LogError($"Boot: login falhou ({error.Code}): {error.Message}");
            });
            if (!loginOk) yield break;
        }

        bool statusOk = true;

        yield return RefreshPlayerData(() => statusOk = false);

        if (!statusOk) yield break;

        if (!useMock)
        {
            SceneManager.LoadScene("GameScene");
            yield return null;
            while (CombatManager.Instance == null) yield return null;
        }

        CombatManager.Instance.ChangeCombatState(CombatState.Idle);
    }

    public IEnumerator RefreshPlayerData(Action onError)
    {
        yield return BattleService.GetStatus(data =>
        {
            PlayerData = data;
        }, error =>
        {
            Debug.LogError($"Refresh: status falhou ({error.Code}): {error.Message}");
            onError?.Invoke();
        });
    }

    public void ReportDefeat(Action onComplete)
    {
        StartCoroutine(BattleService.ReportDefeat(() =>
        {
            //Log de gold para conferir durante o mock, sempre retorna 0 no real
            Debug.Log($"Player's new gold amount after defeat: {PlayerData.gold}");

            onComplete?.Invoke();
        }, 
        error =>
        {
            Debug.LogError($"Defeat: derrota falhou ({error.Code}): {error.Message}");
            onComplete?.Invoke();
        }));
    }

    public void ReportVictory(int enemyLevel, bool isBoss, Action onComplete)
    {
        StartCoroutine(BattleService.ReportVictory(enemyLevel, isBoss, result =>
        {
            PlayerData.level = result.level;
            PlayerData.xp = result.xp;

            //Log de gold para conferir durante o mock, sempre retorna 0 no real
            Debug.Log($"Player's new gold amount after victory: {PlayerData.gold}");
            Debug.Log($"Player's new XP amount after victory: {PlayerData.xp}");

            OnProgressionChanged?.Invoke();

            onComplete?.Invoke();  
        },
        error =>
        {
            Debug.LogError($"Victory: vitória falhou ({error.Code}): {error.Message}");
            onComplete?.Invoke();
        }));
    }
}
