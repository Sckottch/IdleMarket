using UnityEngine;

public static class RandomHelper
{
    public static int WeightedRandomIndex(float[] weights)
    {
        float total = 0f;
        foreach (float w in weights) total += w;

        float roll = Random.Range(0f, total);
        float cumulative = 0f;
        int lastPositive = 0;

        for (int i = 0; i < weights.Length; i++)
        {
            if (weights[i] <= 0) continue;

            lastPositive = i;
            cumulative += weights[i];

            if(roll < cumulative) return i;
        }

        return lastPositive;
    }

    public static float[] GetRarityWeights(int level) => level switch
    {
        <= 5 => new float[] { 100, 0, 0, 0, 0 },
        <= 10 => new float[] { 75, 25, 0, 0, 0 },
        <= 20 => new float[] { 15, 60, 25, 0, 0 },
        <= 30 => new float[] { 0, 30, 70, 0, 0 },
        <= 40 => new float[] { 0, 15, 60, 25, 0 },
        <= 50 => new float[] { 0, 0, 0, 80, 20 },
        _ => new float[] { 0, 0, 0, 0, 100 }
    };

    public static int GetPieceCount(int level)
    {
        (int[] counts, float[] weights) = level switch
        {
            <= 5 => (new[] { 0, 1 }, new float[] { 60, 40 }),
            <= 10 => (new[] { 1, 2 }, new float[] { 60, 40 }),
            <= 20 => (new[] { 2, 3 }, new float[] { 60, 40 }),
            <= 30 => (new[] { 2, 3, 4 }, new float[] { 15, 60, 25 }),
            <= 40 => (new[] { 3, 4 }, new float[] { 60, 40 }),
            _ => (new[] { 4 }, new float[] { 100 }),
        };

        return counts[WeightedRandomIndex(weights)];
    }
}