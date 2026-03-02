const API_BASE = "https://api.spotify.com/v1";

export interface SpotifyUserProfile {
  display_name: string;
  id: string;
  images: { url: string }[];
  product: string; // "premium", "free", etc.
}

export async function getUserProfile(
  accessToken: string
): Promise<SpotifyUserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function playTracks(
  accessToken: string,
  deviceId: string,
  spotifyIds: string[],
  offset: number = 0,
  positionMs: number = 0
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: spotifyIds.map((id) => `spotify:track:${id}`),
          offset: { position: offset },
          position_ms: positionMs,
        }),
      }
    );
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

export async function pausePlayback(
  accessToken: string,
  deviceId: string
): Promise<void> {
  await fetch(`${API_BASE}/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {});
}
