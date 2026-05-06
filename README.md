# LiderWeb App — Android & iOS

App nativo do LiderWeb usando **Capacitor**, carregando o web em produção.

> **Repo web:** [andrenevescoelho/liderweb](https://github.com/andrenevescoelho/liderweb)  
> **URL produção:** https://liderweb.multitrackgospel.com

---

## Como funciona

O app é um **shell nativo** que carrega o LiderWeb web via WebView.  
Toda atualização no repo web aparece automaticamente no app — sem precisar
publicar nova versão na Play Store.

```
┌─────────────────────────────────────┐
│           App Android               │
│  ┌───────────────────────────────┐  │
│  │         Capacitor             │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  WebView                │  │  │
│  │  │  liderweb.multitrack... │  │  │
│  │  └─────────────────────────┘  │  │
│  │  Push · Haptics · StatusBar   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Setup no Mac (primeira vez)

### Pré-requisitos
- [Node.js 18+](https://nodejs.org)
- [Android Studio](https://developer.android.com/studio)
- Java 17 (instalado pelo script)

### Rodar o setup
```bash
git clone https://github.com/andrenevescoelho/liderweb-app
cd liderweb-app
bash scripts/setup-mac.sh
```

O script:
1. Verifica e configura Java, Android Studio e ANDROID_HOME
2. Instala dependências npm
3. Inicializa a plataforma Android
4. Gera ícones e splash screen (se os assets existirem)

---

## Desenvolvimento

```bash
# Abrir no Android Studio
npm run open:android

# Testar no emulador/dispositivo
npm run run:android

# Live reload (conectado ao servidor de dev)
npm run run:livereload

# Sincronizar após mudanças no capacitor.config.ts
npm run sync
```

---

## Build para Play Store

### APK de teste
```bash
npm run build:android
# Saída: android/app/build/outputs/apk/release/app-release.apk
```

### AAB para Play Store
```bash
npm run build:aab
# Saída: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Firebase — Push Notifications

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie projeto **"LiderWeb"**
3. Adicione app Android com package: `com.multitrackgospel.liderweb`
4. Baixe `google-services.json`
5. Cole em `android/app/google-services.json` (não commitar — está no .gitignore)

---

## Secrets do GitHub Actions

Para o CI/CD funcionar, configure no GitHub (Settings > Secrets):

| Secret | Descrição |
|---|---|
| `GOOGLE_SERVICES_JSON` | Conteúdo do google-services.json |
| `KEYSTORE_BASE64` | Keystore em base64 (`base64 -i liderweb.keystore`) |
| `KEYSTORE_PASSWORD` | Senha do keystore |
| `KEY_ALIAS` | Alias da chave |
| `KEY_PASSWORD` | Senha da chave |

### Gerar keystore (fazer uma vez)
```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore liderweb.keystore \
  -alias liderweb \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Converter para base64 (para o secret)
base64 -i liderweb.keystore | pbcopy
# Cola no secret KEYSTORE_BASE64
```

> ⚠️ Guarde o keystore em local seguro. Sem ele não é possível publicar atualizações.

---

## Criar conta Play Store

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Clique **"Começar"** e pague **U$25** (taxa única)
3. Nome do desenvolvedor: **LiderWeb by Multitrack Gospel**
4. Aguarde verificação (1-2 dias úteis)

### Publicar app
1. Console > **Criar app**
2. Nome: **Líder Web — Ministério de Louvor**
3. Upload do `.aab` em Produção > Nova versão

---

## Assets necessários

| Arquivo | Tamanho | Uso |
|---|---|---|
| `assets/icon.png` | 1024×1024px | Ícone do app |
| `assets/splash.png` | 2732×2732px | Splash screen |

Após adicionar os arquivos:
```bash
npx capacitor-assets generate --android
npm run sync
```

---

## Estrutura

```
liderweb-app/
├── capacitor.config.ts   # Configuração principal
├── package.json
├── tsconfig.json
├── www/                  # Placeholder (app carrega via URL)
├── src/
│   └── capacitor.ts      # Utilitários nativos
├── assets/
│   ├── icon.png          # Adicionar manualmente
│   └── splash.png        # Adicionar manualmente
├── scripts/
│   └── setup-mac.sh      # Setup automático no Mac
├── android/              # Gerado pelo Capacitor (não editar)
└── .github/
    └── workflows/
        └── build-android.yml
```

---

## Módulos do app

| Módulo | URL |
|---|---|
| Dashboard | /dashboard |
| Escalas | /schedules |
| Repertório | /songs |
| Membros | /members |
| Chat | /chat-grupo |
| Multitrack | /multitracks |
| Metrônomo | /metronomo |
| Comunicados | /comunicados |
| Ensaios | /ensaios |
| Pads | /pads |
| Professor | /professor |
