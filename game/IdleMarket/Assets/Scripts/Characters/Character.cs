using System.Collections.Generic;
using UnityEngine;

public abstract class Character : MonoBehaviour
{
    [SerializeField] protected CharacterBaseSO baseData;

    public CharacterStats Stats { get; protected set; }
    public float CurrentHealth { get; protected set; }
    public bool IsAlive => CurrentHealth > 0;
    protected void InitializeStats(int level, List<Equipment> equipments)
    {
        Stats = CharacterCalculator.CalculateStats(baseData, level, equipments);
        CurrentHealth = Stats.health;
    }

    public void TakeDamage(float damage)
    {
        CurrentHealth = Mathf.Max(CurrentHealth - damage, 0);
    }
}
