import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";

// ── Plataforma ───────────────────────────────────────────────────────────────

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // "android" | "ios" | "web"

// ── Inicialização ────────────────────────────────────────────────────────────

export async function initApp() {
  if (!isNative) return;

  // Status bar escura com fundo do app
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  await StatusBar.setBackgroundColor({ color: "#111827" }).catch(() => {});

  // Esconder splash screen após carregamento
  await SplashScreen.hide().catch(() => {});

  // Monitorar estado de rede
  Network.addListener("networkStatusChange", (status) => {
    console.log("[LiderWeb] Rede:", status.connected ? "online" : "offline");
    // Disparar evento customizado para o WebView capturar
    window.dispatchEvent(new CustomEvent("lw:network", { detail: status }));
  });

  // Interceptar botão voltar do Android
  App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  });

  console.log(`[LiderWeb] App iniciado — plataforma: ${platform}`);
}

// ── Push Notifications ───────────────────────────────────────────────────────

export async function registerPush(): Promise<string | null> {
  if (!isNative) return null;

  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") {
      console.warn("[LiderWeb] Push negado pelo usuário");
      return null;
    }

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener("registration", async (token) => {
        console.log("[LiderWeb] Push token:", token.value);
        // Enviar token para o servidor
        await fetch("https://liderweb.multitrackgospel.com/api/push/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: token.value, platform }),
        }).catch(() => {});
        resolve(token.value);
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("[LiderWeb] Erro no push:", err);
        resolve(null);
      });

      // Notificação recebida com app aberto
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[LiderWeb] Notificação recebida:", notification);
        window.dispatchEvent(new CustomEvent("lw:push", { detail: notification }));
      });

      // Toque na notificação — navegar para a URL
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const url = action.notification.data?.url;
        if (url) window.location.href = `https://liderweb.multitrackgospel.com${url}`;
      });

      setTimeout(() => resolve(null), 10000);
    });
  } catch (err) {
    console.error("[LiderWeb] Erro ao registrar push:", err);
    return null;
  }
}

async function sendTokenToServer(token: string) {
  try {
    await fetch("https://liderweb.multitrackgospel.com/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, platform }),
    });
  } catch (err) {
    console.error("[LiderWeb] Erro ao salvar token:", err);
  }
}

// ── Haptics ──────────────────────────────────────────────────────────────────

export async function haptic(style: "light" | "medium" | "heavy" = "light") {
  if (!isNative) return;
  const map = {
    light:  ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy:  ImpactStyle.Heavy,
  };
  await Haptics.impact({ style: map[style] }).catch(() => {});
}

// ── Google Sign-In nativo ────────────────────────────────────────────────────

export async function googleSignInNative(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
    await GoogleAuth.initialize({
      clientId: "510384512031-n27ieo0cqa1b5de7eg8jdvtqnk6qss52.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    });

    const user = await GoogleAuth.signIn();
    const idToken = user.authentication.idToken;

    // Enviar para o servidor LiderWeb para criar sessão
    const res = await fetch("https://liderweb.multitrackgospel.com/api/auth/google-native", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) throw new Error("Falha ao autenticar no servidor");

    const data = await res.json();

    // Setar cookie de sessão no WebView e redirecionar
    if (data.token) {
      document.cookie = `next-auth.session-token=${data.token}; path=/; secure; samesite=lax`;
      const dest = data.user?.groupId ? "/dashboard" : "/signup?mode=new-group";
      window.location.href = `https://liderweb.multitrackgospel.com${dest}`;
      return true;
    }

    return false;
  } catch (err) {
    console.error("[LiderWeb] Google Sign-In erro:", err);
    return false;
  }
}



export async function getNetworkStatus() {
  const status = await Network.getStatus();
  return status.connected;
}
