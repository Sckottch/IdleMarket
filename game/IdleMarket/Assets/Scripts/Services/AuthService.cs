using UnityEngine;
using System.Collections;
using System;

//DTOs
public class LoginRequest { public string username; public string password; }
public class LoginResponse { public string token; }

public static class AuthService
{
    public static IEnumerator Login(string username, string password, Action onSuccess, Action<ApiError> onError)
    {
        LoginRequest body = new() { username = username, password = password };

        yield return ApiClient.Post<LoginResponse>("/api/auth/login", body, response =>
        {
            ApiClient.Token = response.token;
            PlayerPrefs.SetString("auth_token", response.token);
            onSuccess?.Invoke();
        }, 
        onError);
    }
}
