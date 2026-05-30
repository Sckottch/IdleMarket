using UnityEngine;

public abstract class Character : MonoBehaviour
{
    [SerializeField] protected CharacterBaseSO baseData;

    public CharacterStats Stats { get; protected set; }
    public float CurrentHealth { get; protected set; }
    public bool IsAlive => CurrentHealth > 0;

    protected void InitializeStats(int level)
    {
        Stats = CharacterCalculator.CalculateBaseStats(baseData, level);
        CurrentHealth = Stats.health;
    }

    public void TakeDamage(float damage)
    {
        CurrentHealth = Mathf.Max(CurrentHealth - damage, 0);
    }
}
