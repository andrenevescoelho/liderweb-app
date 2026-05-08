#!/bin/bash
# ============================================================
# LiderWeb App — Setup no Mac
# Rodar após clonar: bash scripts/setup-mac.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 LiderWeb App — Setup no Mac${NC}"
echo ""

# ── Verificar pré-requisitos ────────────────────────────────

echo "🔍 Verificando pré-requisitos..."

# Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js não encontrado. Instale em: https://nodejs.org${NC}"
  exit 1
fi
echo -e "  ✅ Node.js $(node -v)"

# Java
if ! command -v java &> /dev/null; then
  echo -e "${YELLOW}⚠️  Java não encontrado. Instalando via Homebrew...${NC}"
  brew install --cask temurin@17
fi
echo -e "  ✅ Java $(java -version 2>&1 | head -1)"

# Android Studio
if [ ! -d "/Applications/Android Studio.app" ]; then
  echo -e "${YELLOW}⚠️  Android Studio não encontrado.${NC}"
  echo "   Baixe em: https://developer.android.com/studio"
  echo "   Após instalar, rode este script novamente."
  exit 1
fi
echo -e "  ✅ Android Studio encontrado"

# ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
  echo -e "${YELLOW}⚠️  ANDROID_HOME não configurado. Configurando...${NC}"
  
  ANDROID_SDK="$HOME/Library/Android/sdk"
  
  # Adicionar ao .zshrc (padrão macOS)
  echo "" >> ~/.zshrc
  echo "# Android SDK" >> ~/.zshrc
  echo "export ANDROID_HOME=$ANDROID_SDK" >> ~/.zshrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.zshrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.zshrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.zshrc
  
  export ANDROID_HOME=$ANDROID_SDK
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  
  echo -e "  ✅ ANDROID_HOME configurado em ~/.zshrc"
  echo -e "  ℹ️  Rode: source ~/.zshrc"
fi
echo -e "  ✅ ANDROID_HOME: $ANDROID_HOME"

echo ""

# ── Instalar dependências npm ───────────────────────────────

echo "📦 Instalando dependências npm..."
npm install
echo -e "  ✅ Dependências instaladas"

# ── Inicializar plataforma Android ─────────────────────────

echo ""
echo "📱 Inicializando plataforma Android..."
npx cap add android 2>/dev/null || echo "  ℹ️  Android já inicializado"
npx cap sync android
echo -e "  ✅ Android sincronizado"

# ── Gerar ícones e splash screen ───────────────────────────

echo ""
if [ -f "assets/icon.png" ] && [ -f "assets/splash.png" ]; then
  echo "🎨 Gerando ícones e splash screen..."
  npx capacitor-assets generate --android
  echo -e "  ✅ Assets gerados"
else
  echo -e "${YELLOW}⚠️  Ícones não encontrados em assets/icon.png e assets/splash.png${NC}"
  echo "   Adicione os arquivos e rode: npx capacitor-assets generate --android"
fi

# ── Concluído ───────────────────────────────────────────────

echo ""
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo "  1. Abrir no Android Studio:"
echo "     npx cap open android"
echo ""
echo "  2. Configurar Firebase (push notifications):"
echo "     → Acesse console.firebase.google.com"
echo "     → Crie projeto 'LiderWeb'"
echo "     → Baixe google-services.json"
echo "     → Cole em: android/app/google-services.json"
echo ""
echo "  3. Testar no emulador ou dispositivo:"
echo "     npm run run:android"
echo ""
echo "  4. Gerar APK de release:"
echo "     npm run build:android"
echo ""
echo "  📖 Documentação completa: README.md"
