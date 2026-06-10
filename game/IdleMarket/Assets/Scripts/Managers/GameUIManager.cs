using UnityEngine;

public class GameUIManager : SingletonMonoBehaviour<GameUIManager>
{
    [SerializeField] private Camera gameCamera;
    [SerializeField] private PlayerInfoUI playerInfoUI;
    [SerializeField] private EnemyInfoUI enemyInfoUI;
    [SerializeField] private DamageNumber damageNumber;
    [SerializeField] private WaveAnnouncementUI waveAnnouncementUI;
    [SerializeField] private float headOffset = 0.5f;

    public void BindCharacters(PlayerCharacter player, EnemyCharacter enemy)
    {
        playerInfoUI.Bind(player);
        enemyInfoUI.Bind(enemy);
    }

    public void ShowDamageNumber(Character target, DamageResult result)
    {
        Vector3 worldPosition = target.transform.position + Vector3.up * headOffset;
        Vector3 screenPosition = gameCamera.WorldToScreenPoint(worldPosition);

        damageNumber.Show(screenPosition, Mathf.RoundToInt(result.Damage), result.IsCritical);
    }

    public void ShowWaveAnnouncement(int wave,int maxWaves, bool isBoss)
    {
        waveAnnouncementUI.ShowAnnouncement(wave, maxWaves, isBoss);
    }
}
