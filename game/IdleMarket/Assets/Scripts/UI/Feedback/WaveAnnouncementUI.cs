using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class WaveAnnouncementUI : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private TextMeshProUGUI text;
    [SerializeField] private Image background;

    [Space(10)]
    [Header("Configurações")]
    [SerializeField] private Color normalColor = Color.white;
    [SerializeField] private Color bossColor = Color.red;
    [SerializeField] private float fadeDuration = 0.1f;
    [SerializeField] private float displayDuration = 0.3f;


    public void ShowAnnouncement(int waveNumber,int maxWaves, bool isBossWave)
    {
        text.text = isBossWave ? $"ONDA FINAL" : $"Onda {waveNumber}/{maxWaves} ";
        
        Color textColor = isBossWave ? bossColor : normalColor;
        Color bgColor = background.color;

        text.color = new(textColor.r, textColor.g, textColor.b, 0f);
        background.color = new(bgColor.r, bgColor.g, bgColor.b, 0f);

        gameObject.SetActive(true);
        StartCoroutine(AnimateAnnouncement());
    }

    private IEnumerator AnimateAnnouncement()
    {
        float elapsed = 0f;
        Color baseBGColor = background.color;
        Color baseTextColor = text.color;

        while (elapsed < fadeDuration)
        {
            float t = elapsed / fadeDuration;

            text.color = new(baseTextColor.r, baseTextColor.g, baseTextColor.b, 0 + t);
            background.color = new(baseBGColor.r, baseBGColor.g, baseBGColor.b, 0 + t);

            elapsed += Time.deltaTime;

            yield return null;
        }

        yield return new WaitForSeconds(displayDuration);
        elapsed = 0f;

        while (elapsed < fadeDuration)
        {
            float t = elapsed / fadeDuration;

            text.color = new(baseTextColor.r, baseTextColor.g, baseTextColor.b, 1 - t);
            background.color = new(baseBGColor.r, baseBGColor.g, baseBGColor.b, 1 - t);

            elapsed += Time.deltaTime;

            yield return null;
        }

        gameObject.SetActive(false);
    }
}
