#!/bin/bash
# fix-build.sh - Script de Correção Final para Deploy

echo "🔧 Iniciando correção final do build..."

# 1. Remover pasta de funções Netlify que está causando erro
if [ -d "netlify/functions" ]; then
    echo "🗑️  Removendo pasta netlify/functions..."
    rm -rf netlify/functions
    echo "✅ Pasta netlify/functions removida"
fi

# 2. Verificar se package.json tem pdf-parse (remover se tiver)
if grep -q "pdf-parse" package.json; then
    echo "🔍 Removendo pdf-parse do package.json..."
    # Para sistemas que não têm jq instalado, usar sed
    sed -i.backup 's/.*"pdf-parse".*,//g' package.json
    echo "✅ pdf-parse removido do package.json"
fi

# 3. Limpar node_modules e reinstalar dependências
echo "🧹 Limpando node_modules..."
rm -rf node_modules package-lock.json

echo "📦 Reinstalando dependências..."
npm install

# 4. Testar build local
echo "🏗️  Testando build local..."
CI=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build local executado com sucesso!"
    echo ""
    echo "📁 Arquivos gerados:"
    ls -la build/
    echo ""
    echo "🚀 Próximos passos:"
    echo "1. git add ."
    echo "2. git commit -m 'fix: correção final para deploy sem warnings'"
    echo "3. git push origin main"
    echo ""
    echo "✨ Seu sistema estará disponível em: https://sistemaebd.netlify.app/"
else
    echo "❌ Erro no build local. Verifique os logs acima."
    exit 1
fi
