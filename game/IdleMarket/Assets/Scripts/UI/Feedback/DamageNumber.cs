using System.Collections;
using TMPro;
using UnityEngine;

public class DamageNumber : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private TextMeshProUGUI text;

    [Space(10)]
    [Header("Configurações")]
    [SerializeField] private float duration = 0.5f;
    [SerializeField] private float riseDistance = 40f;
    [SerializeField] private Color normalColor = Color.white;
    [SerializeField] private Color citicalColor = Color.orange;
    [SerializeField] private float criticalScale = 1.4f;

    private Coroutine coroutine;

    public void Show(Vector2 screenPosition, int damageAmount, bool isCritical)
    {
        transform.position = screenPosition;
        text.text = damageAmount.ToString();
        text.color = isCritical ? citicalColor : normalColor;
        transform.localScale = Vector3.one * (isCritical ? criticalScale : 1f);

        gameObject.SetActive(true);

        if (coroutine != null) StopCoroutine(coroutine);

        coroutine = StartCoroutine(Animate(screenPosition));
    }

    private IEnumerator Animate(Vector2 startPosition)
    {
        Vector2 endPosition = startPosition + Vector2.up * riseDistance;
        Color baseColor = text.color;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            float t = elapsed / duration;

            transform.position = Vector2.Lerp(startPosition, endPosition, t);
            text.color = new Color(baseColor.r, baseColor.g, baseColor.b, 1f - t);

            elapsed += Time.deltaTime;

            yield return null;
        }

        gameObject.SetActive(false);
    }
}
