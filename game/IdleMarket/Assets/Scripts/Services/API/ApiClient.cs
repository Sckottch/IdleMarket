using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public static class ApiClient
{
    private const string BaseUrl = "http://localhost:3333";

    public static string Token { get; set; }

    private static readonly JsonSerializerSettings JsonSettings = new()
    {
        Converters = { new StringEnumConverter() },
        NullValueHandling = NullValueHandling.Ignore
    };

    public static IEnumerator Post<TResponse>(
        string path,
        object body,
        Action<TResponse> onSuccess,
        Action<ApiError> onError)
    {
        string json = body != null ? JsonConvert.SerializeObject(body, JsonSettings) : "{}";

        using UnityWebRequest request = new(BaseUrl + path, "POST");
        request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        if (!string.IsNullOrEmpty(Token))
        {
            request.SetRequestHeader("Authorization", $"Bearer {Token}");
        }

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(new(request.responseCode, request.downloadHandler.text));
            yield break;
        }

        TResponse data = JsonConvert.DeserializeObject<TResponse>(request.downloadHandler.text, JsonSettings);

        onSuccess?.Invoke(data);
    }

    public static IEnumerator Get<TResponse>(
        string path,
        Action<TResponse> onSuccess,
        Action<ApiError> onError)
    {
        using UnityWebRequest request = new(BaseUrl + path, "GET");
        request.downloadHandler = new DownloadHandlerBuffer();

        if (!string.IsNullOrEmpty(Token))
        {
            request.SetRequestHeader("Authorization", $"Bearer {Token}");
        }

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            onError?.Invoke(new(request.responseCode, request.downloadHandler.text));
            yield break;
        }

        TResponse data = JsonConvert.DeserializeObject<TResponse>(request.downloadHandler.text, JsonSettings);

        onSuccess?.Invoke(data);
    }
}

public readonly struct ApiError
{
    public readonly long Code;
    public readonly string Message;

    public ApiError(long code, string message)
    {
        Code = code;
        Message = message;
    }
}