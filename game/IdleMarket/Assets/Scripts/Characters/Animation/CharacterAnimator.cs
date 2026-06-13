using System.Collections;
using UnityEngine;

[RequireComponent(typeof(Character))]
[RequireComponent(typeof(Animator))]
public class CharacterAnimator : MonoBehaviour
{
    [SerializeField] private float advanceOffset;
    [SerializeField] private float moveSpeed = 8f;
    [SerializeField] private float fadeDuration = 0.3f;

    private static readonly int RunHash = Animator.StringToHash("Run");
    private static readonly int Attack1Hash = Animator.StringToHash("Attack1");
    private static readonly int Attack2Hash = Animator.StringToHash("Attack2");
    private static readonly int GuardHash = Animator.StringToHash("Guard");

    private Character character;
    private Animator animator;
    private Vector3 homePosition;

    private bool hitReceived;
    private bool attackEnded;

    private Coroutine deathRoutine;

    private void Awake()
    {
        character = GetComponent<Character>();
        animator = GetComponent<Animator>();
        homePosition = transform.position;
    }

    public void OnHit() => hitReceived = true;
    public void OnAttackEnd() => attackEnded = true;

    public void PlayAttack(bool isCritical)
    {
        hitReceived = false;
        attackEnded = false;

        animator.SetTrigger(isCritical ? Attack2Hash : Attack1Hash);
    }

    public void PlayGuard() => animator.SetTrigger(GuardHash);

    public void PlayDeath()
    {
        if (deathRoutine != null) StopCoroutine(deathRoutine);
        deathRoutine = StartCoroutine(DeathRoutine());
    }

    public IEnumerator WaitForHit()
    {
        yield return new WaitUntil(() => hitReceived);
    }

    public IEnumerator WaitForAttackEnd()
    {
        yield return new WaitUntil(() => attackEnded);
    }

    public IEnumerator Advance()
    {
        animator.SetBool(RunHash, true);

        Vector3 targetPosition = homePosition;
        targetPosition.x += advanceOffset;

        while (Vector3.Distance(transform.position, targetPosition) > 0.1f)
        {
            transform.position = Vector3.MoveTowards(transform.position, targetPosition, moveSpeed * Time.deltaTime);
            yield return null;
        }

        transform.position = targetPosition;

        animator.SetBool(RunHash, false);
    }

    public IEnumerator Return()
    {
        animator.SetBool(RunHash, true);

        while (Vector3.Distance(transform.position, homePosition) > 0.1f)
        {
            transform.position = Vector3.MoveTowards(transform.position, homePosition, moveSpeed * Time.deltaTime);
            yield return null;
        }

        transform.position = homePosition;

        animator.SetBool(RunHash, false);
    }

    private IEnumerator DeathRoutine()
    {
        float elapsed = 0f;

        while (elapsed < fadeDuration)
        {
            float t = elapsed / fadeDuration;

            SetAlpha(1f - t);

            elapsed += Time.deltaTime;

            yield return null;
        }

        SetAlpha(0f);
    }

    public void ResetVisual()
    {
        if (deathRoutine != null) { StopCoroutine(deathRoutine); deathRoutine = null;  }
        SetAlpha(1f);
    }

    private void SetAlpha(float alpha)
    {
        Color current = character.SpriteRenderer.color;
        current.a = alpha;
        character.SpriteRenderer.color = current;
    }

    public void SetController(RuntimeAnimatorController controller) => animator.runtimeAnimatorController = controller;
}