#!/bin/bash

echo "🚀 Iniciando correção do build - Sistema EBD"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar status
show_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

show_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    show_error "Arquivo package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

show_status "Verificando estrutura do projeto..."

# Criar diretórios necessários
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/hooks

show_success "Estrutura de diretórios criada"

# Instalar dependências necessárias
show_status "Verificando dependências..."

# Verificar se as dependências estão instaladas
if ! npm list @supabase/supabase-js >/dev/null 2>&1; then
    show_status "Instalando @supabase/supabase-js..."
    npm install @supabase/supabase-js
fi

if ! npm list lucide-react >/dev/null 2>&1; then
    show_status "Instalando lucide-react..."
    npm install lucide-react
fi

if ! npm list @tailwindcss/forms >/dev/null 2>&1; then
    show_status "Instalando @tailwindcss/forms..."
    npm install -D @tailwindcss/forms
fi

show_success "Dependências verificadas e instaladas"

# Backup dos arquivos existentes
show_status "Criando backup dos arquivos existentes..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"

if [ -f "src/App.js" ]; then
    cp src/App.js $BACKUP_DIR/App.js.bak
    show_success "Backup do App.js criado"
fi

if [ -f "src/App.css" ]; then
    cp src/App.css $BACKUP_DIR/App.css.bak
    show_success "Backup do App.css criado"
fi

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    show_status "Criando arquivo .env.local..."
    cat > .env.local << 'EOL'
# Configurações do Supabase
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Configurações de desenvolvimento
GENERATE_SOURCEMAP=false
EOL
    show_success "Arquivo .env.local criado"
fi

# Verificar se o arquivo supabaseClient.js existe
if [ ! -f "src/supabaseClient.js" ]; then
    show_status "Criando supabaseClient.js..."
    cat > src/supabaseClient.js << 'EOL'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'dummy-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOL
    show_success "supabaseClient.js criado"
fi

# Atualizar package.json com scripts úteis
show_status "Atualizando scripts do package.json..."
npm pkg set scripts.build:analyze="npm run build && npx bundle-analyzer build/static/js/*.js"
npm pkg set scripts.lint="eslint src --ext .js,.jsx --fix"
npm pkg set scripts.format="prettier --write src/**/*.{js,jsx,css,md}"

# Criar arquivo .gitignore atualizado
show_status "Atualizando .gitignore..."
cat >> .gitignore << 'EOL'

# Build artifacts
/backup
*.log

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOL

show_success "Arquivos de configuração atualizados"

# Testar build local
show_status "Testando build local..."
if npm run build; then
    show_success "Build local executado com sucesso!"
else
    show_error "Erro no build local. Verifique os logs acima."
    exit 1
fi

# Instruções para Git
show_status "Preparando para commit..."

echo ""
echo "📋 PRÓXIMOS PASSOS PARA GIT:"
echo "=============================="
echo ""
echo "1. Verificar mudanças:"
echo "   git status"
echo ""
echo "2. Adicionar arquivos:"
echo "   git add ."
echo ""
echo "3. Fazer commit:"
echo '   git commit -m "🚀 Fix: Corrigir erros de build e implementar sistema completo"'
echo ""
echo "4. Enviar para repositório:"
echo "   git push origin main"
echo ""
echo "5. Acompanhar build no Netlify:"
echo "   - Acesse seu dashboard do Netlify"
echo "   - Vá em 'Deploys'"
echo "   - Aguarde o build finalizar"
echo ""

# Verificar se existem arquivos não commitados
if [ -n "$(git status --porcelain)" ]; then
    show_warning "Existem mudanças não commitadas. Execute os comandos git acima."
else
    show_success "Nenhuma mudança pendente encontrada."
fi

# Resumo final
echo ""
echo "✅ RESUMO DA CORREÇÃO:"
echo "====================="
echo "• Estrutura de diretórios criada"
echo "• Dependências instaladas/verificadas"
echo "• Backup dos arquivos existentes criado"
echo "• Arquivos de configuração atualizados"
echo "• Build local testado com sucesso"
echo ""
echo "🎯 COMPONENTES IMPLEMENTADOS:"
echo "• App.js - Sistema principal corrigido"
echo "• ImportMembersComponent.js - Importação de membros"
echo "• AutomationComponent.js - Sistema de automação RPA"
echo "• lib/supabase.js - Integração com Supabase"
echo "• Configurações Tailwind CSS"
echo ""
echo "🔗 FUNCIONALIDADES:"
echo "• Login com seleção de igreja (Nova Brasília I por padrão)"
echo "• Dashboard com estatísticas reais"
echo "• Sistema de importação de membros com detecção automática"
echo "• Automação RPA para extração de PDF e questionários"
echo "• 16 membros reais da Nova Brasília I pré-configurados"
echo "• Integração com Supabase (com fallback offline)"
echo ""

show_success "Correção concluída! Execute os comandos git para fazer deploy."

# Mostrar informações do sistema
echo ""
echo "📊 INFORMAÇÕES DO SISTEMA:"
echo "========================="
echo "Node.js: $(node --version 2>/dev/null || echo 'Não instalado')"
echo "npm: $(npm --version 2>/dev/null || echo 'Não instalado')"
echo "Projeto: $(npm pkg get name 2>/dev/null || echo 'Desconhecido')"
echo "Versão: $(npm pkg get version 2>/dev/null || echo 'Desconhecido')"
echo ""

exit 0
