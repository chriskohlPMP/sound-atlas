const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? window.location.origin + window.location.pathname;

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ");

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const VERIFIER_KEY = "ohrwurm-pkce-verifier";
const TOKEN_KEY = "ohrwurm-spotify-token";
const REFRESH_KEY = "ohrwurm-spotify-refresh";
const EXPIRY_KEY = "ohrwurm-spotify-expiry";

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// --- PKCE helpers ---

function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// --- Public API ---

export async function initiateLogin(): Promise<void> {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

export async function handleCallback(): Promise<TokenData | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");

  if (error || !code) return null;

  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) return null;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tokenData: TokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    storeTokens(tokenData);
    sessionStorage.removeItem(VERIFIER_KEY);

    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);

    return tokenData;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<TokenData | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      clearAuth();
      return null;
    }

    const data = await response.json();
    const tokenData: TokenData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    storeTokens(tokenData);
    return tokenData;
  } catch {
    clearAuth();
    return null;
  }
}

export function getStoredToken(): TokenData | null {
  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const expiresAt = localStorage.getItem(EXPIRY_KEY);

    if (!accessToken || !refreshToken || !expiresAt) return null;

    return {
      accessToken,
      refreshToken,
      expiresAt: Number(expiresAt),
    };
  } catch {
    return null;
  }
}

export async function getValidToken(): Promise<string | null> {
  const stored = getStoredToken();
  if (!stored) return null;

  // Refresh if within 5 minutes of expiry
  if (stored.expiresAt - Date.now() < 5 * 60 * 1000) {
    const refreshed = await refreshAccessToken();
    return refreshed?.accessToken ?? null;
  }

  return stored.accessToken;
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
}

// --- Internal ---

function storeTokens(tokens: TokenData): void {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(EXPIRY_KEY, String(tokens.expiresAt));
}
