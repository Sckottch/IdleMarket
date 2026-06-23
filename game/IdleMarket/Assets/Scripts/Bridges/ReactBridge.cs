using UnityEngine;
using System.Runtime.InteropServices;

public class ReactBridge : SingletonMonoBehaviour<ReactBridge>
{
    [DllImport("__Internal")]
    private static extern void NotifyReady();

    [DllImport("__Internal")]
    private static extern void NotifyVictory();

    [DllImport("__Internal")]
    private static extern void NotifyDefeat();

    [SerializeField] private string tokenDeTeste;

    public void ReceiveToken(string token)
    {
        GameManager.Instance.DeliverToken(token);    
    }

    [ContextMenu("Simular envio de token (React)")]
    public void SimularTokenDoReact()
    {
        ReceiveToken(tokenDeTeste);
    }

    protected override void Awake()
    {
        base.Awake();
        DontDestroyOnLoad(gameObject);
    }

    public void OnReadyConfirmed()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
            NotifyReady();
        #endif
    }

    public void OnVictoryConfirmed()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
            NotifyVictory();
        #endif
    }

    public void OnDefeatConfirmed()
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
            NotifyDefeat();
        #endif
    }
}
