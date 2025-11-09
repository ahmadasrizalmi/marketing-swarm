export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://oauth.manus.im";
  const appId = import.meta.env.VITE_APP_ID || "";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Validate URL before creating
  if (!oauthPortalUrl || !oauthPortalUrl.startsWith('http')) {
    console.warn('Invalid VITE_OAUTH_PORTAL_URL, using default');
    return '#';
  }

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error('Error creating login URL:', error);
    return '#';
  }
};
