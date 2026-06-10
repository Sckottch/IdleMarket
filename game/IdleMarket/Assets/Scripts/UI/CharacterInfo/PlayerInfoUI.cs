using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class PlayerInfoUI : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI usernameText;
    [SerializeField] private Slider healthBar;
    [SerializeField] private Slider xpBar;

    private PlayerCharacter player;

    private void OnEnable()
    {
        GameManager.Instance.OnProgressionChanged += UpdateXPBar;
    }

    private void OnDisable()
    {
        GameManager.Instance.OnProgressionChanged -= UpdateXPBar;
    }

    public void Bind(PlayerCharacter player)
    {
        this.player = player;

        player.OnHealthChanged -= UpdateHealthBar;
        player.OnHealthChanged += UpdateHealthBar;

        player.OnInitialized -= PlayerInitialized;
        player.OnInitialized += PlayerInitialized;

        UpdateXPBar();
    }

    private void OnDestroy()
    {
        if (player ==  null) return;

        player.OnHealthChanged -= UpdateHealthBar;
        player.OnInitialized -= PlayerInitialized;
    }

    private void PlayerInitialized()
    {
        healthBar.maxValue = player.Stats.health;

        usernameText.text = player.Data.username;

        UpdateHealthBar();
    }

    private void UpdateHealthBar()
    {
        healthBar.value = player.CurrentHealth;
    }

    private void UpdateXPBar()
    {
        xpBar.maxValue = CharacterCalculator.GetXpForLevelUp(GameManager.Instance.PlayerData.level);
        xpBar.value = GameManager.Instance.PlayerData.xp;
    }
}
