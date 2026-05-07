const ACCESS_TOKEN_KEY = "leave_app_access_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const AUTH_EVENT_NAME = "leaveapp:auth";

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function readAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const item of cookies) {
    const [key, ...rest] = item.split("=");
    if (key === ACCESS_TOKEN_KEY) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

export function saveAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  notifyAuthChanged();
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  notifyAuthChanged();
}

export function subscribeToAuthChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_EVENT_NAME, callback);
  return () => window.removeEventListener(AUTH_EVENT_NAME, callback);
}
