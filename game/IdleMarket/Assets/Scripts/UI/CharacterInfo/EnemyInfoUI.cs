using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class EnemyInfoUI : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI levelText;
    [SerializeField] private Slider healthBar;

    private EnemyCharacter enemy;

    public void Bind(EnemyCharacter enemy)
    {
        this.enemy = enemy;

        enemy.OnHealthChanged -= UpdateHealthBar;
        enemy.OnHealthChanged += UpdateHealthBar;

        enemy.OnInitialized -= EnemyInitialized;
        enemy.OnInitialized += EnemyInitialized;
    }

    private void OnDestroy()
    {
        if (enemy == null) return;

        enemy.OnHealthChanged -= UpdateHealthBar;
        enemy.OnInitialized -= EnemyInitialized;
    }

    private void EnemyInitialized()
    {
        levelText.text = $"Lv. {enemy.Level}";

        healthBar.maxValue = enemy.Stats.health;
        UpdateHealthBar();
    }

    private void UpdateHealthBar()
    {
        healthBar.value = enemy.CurrentHealth;
    }
}
