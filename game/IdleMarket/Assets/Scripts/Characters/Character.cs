using System;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(CharacterAnimator))]
[RequireComponent(typeof(SpriteRenderer))]
public abstract class Character : MonoBehaviour
{
    [SerializeField] protected CharacterBaseSO baseData;

    public CharacterStats Stats { get; protected set; }
    public float CurrentHealth { get; protected set; }
    public bool IsAlive => CurrentHealth > 0;

    public CharacterAnimator Animator { get; protected set; }
    public SpriteRenderer SpriteRenderer { get; private set; }

    #region Events

    public event Action OnHealthChanged;
    public event Action OnInitialized;

    #endregion

    private void Awake()
    {
        Animator = GetComponent<CharacterAnimator>();
        SpriteRenderer = GetComponent<SpriteRenderer>();
    }

    protected void InitializeStats(int level, List<Equipment> equipments)
    {
        Stats = CharacterCalculator.CalculateStats(baseData, level, equipments);
        CurrentHealth = Stats.health;
    }

    public void TakeDamage(float damage)
    {
        CurrentHealth = Mathf.Max(CurrentHealth - damage, 0);
        HealthChanged();
    }

    public void HealthChanged()
    {
        OnHealthChanged?.Invoke();
    }

    public void Initialized()
    {
        OnInitialized?.Invoke();
    }
}
