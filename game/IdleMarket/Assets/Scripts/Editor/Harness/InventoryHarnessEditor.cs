using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(InventoryDebugHarness))]
public class InventoryDebugHarnessEditor : Editor
{
    private readonly Dictionary<string, bool> expanded = new();

    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();

        if (!Application.isPlaying)
        {
            EditorGUILayout.HelpBox("Entre em Play mode pra mexer no inventário.", MessageType.Info);
            return;
        }

        GameManager gm = GameManager.Instance;
        if (gm == null || gm.PlayerData == null || gm.InventoryService == null)
        {
            EditorGUILayout.HelpBox("GameManager/PlayerData/InventoryService indisponíveis.", MessageType.Warning);
            return;
        }

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Inventário", EditorStyles.boldLabel);

        foreach (Equipment e in gm.PlayerData.equipments)
        {
            EditorGUILayout.BeginHorizontal();

            expanded.TryGetValue(e.id, out bool isOpen);
            expanded[e.id] = EditorGUILayout.Foldout(isOpen, $"{e.equipmentType} {e.rarity}★  R:{e.rating}", true);

            if (e.isEquipped)
            {
                if (GUILayout.Button("Desequipar", GUILayout.Width(90)))
                    gm.InventoryService.Unequip(e.id);
            }
            else
            {
                if (GUILayout.Button("Equipar", GUILayout.Width(90)))
                    gm.InventoryService.Equip(e.id);
            }

            EditorGUILayout.EndHorizontal();

            if (expanded[e.id])
            {
                EditorGUI.indentLevel++;
                EditorGUILayout.LabelField("Tipo", e.equipmentType.ToString());
                EditorGUILayout.LabelField("Principal", $"{e.mainStat}: {e.mainStatValue:F1}");

                if (e.subStats.Count > 0)
                {
                    EditorGUILayout.LabelField("Sub-status:");
                    EditorGUI.indentLevel++;
                    foreach (SubStat sub in e.subStats)
                        EditorGUILayout.LabelField($"{sub.statType}: {sub.statValue:F1}");
                    EditorGUI.indentLevel--;
                }
                else
                {
                    EditorGUILayout.LabelField("Sub-status", "nenhum");
                }

                EditorGUI.indentLevel--;
            }
        }
    }
}