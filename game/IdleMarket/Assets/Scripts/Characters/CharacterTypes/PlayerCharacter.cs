using UnityEngine;

public class PlayerCharacter : Character
{
    public PlayerData Data {  get; private set; }

    public void Initialize(PlayerData data)
    {
        Data = data;
        InitializeStats(data.level);
    }
}
