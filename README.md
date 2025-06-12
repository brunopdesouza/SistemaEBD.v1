# Sistema EBD - Igreja Cristã Maranata

Sistema completo de gestão da Escola Bíblica Dominical com hierarquia de usuários, controle de igrejas e grupos de assistência.

## 🚀 Funcionalidades

### 🔐 Sistema de Autenticação
- Login seguro com validação por Igreja, Função, Email e Senha
- Cadastro de usuários com diferentes níveis de acesso
- 3 níveis de permissão:
  - **Administrador**: Acesso total ao sistema
  - **Usuário Igreja**: Visualiza todos os grupos da sua igreja
  - **Usuário Grupo**: Visualiza apenas seu grupo específico

### 👥 Gestão de Membros
- Cadastro completo com Nome, Sexo, CPF, Classe, Situação, Telefone
- Filtros por permissão - cada usuário vê apenas o que tem acesso
- Busca avançada por nome, CPF ou classe
- Edição e exclusão de membros
- Hierarquia de responsáveis e secretários por grupo

### 📁 Importação de Dados
- Múltiplos formatos: Excel (.xlsx, .xls), CSV, PDF, Word
- Drag & Drop para facilitar o upload
- Validação automática de formato e conteúdo
- Preview dos arquivos carregados

### 📄 Gestão de PDFs Semanais
- Upload semanal de questionários
- Validação de conteúdo automática
- Controle por semana/ano
- Disponibilização para todos os usuários após validação

### 📊 Dashboard Inteligente
- Estatísticas em tempo real
- Informações dos grupos de assistência
- Controle de PDFs semanais
- Informações personalizadas por nível de acesso

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **JavaScript ES6+** - Lógica da aplicação

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-ebd.git
cd sistema-ebd
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

## 🚀 Deploy no Netlify

1. Faça o build do projeto:
```bash
npm run build
```

2. Faça upload da pasta `build` no Netlify ou conecte o repositório GitHub

3. Configure as variáveis de ambiente se necessário

## 📱 Credenciais de Demonstração

Para testar o sistema, use:

**Administrador:**
- Email: `admin@sistema.com`
- Senha: `admin123`
- Igreja: `ICM Central`
- Função: `Pastor`

## 🏗️ Estrutura do Projeto

```
src/
├── App.js              # Componente principal
├── index.js           # Ponto de entrada
├── index.css          # Estilos globais
└── components/        # Componentes futuros

public/
├── index.html         # Template HTML
└── manifest.json      # Configurações PWA
```

## 🔄 Níveis de Acesso

### Administrador
- Visualiza todas as igrejas e grupos
- Acesso completo a todas as funcionalidades
- Gestão de perfis de usuários
- Configurações do sistema

### Usuário Igreja
- Visualiza apenas grupos da sua igreja
- Cadastro de membros da igreja
- Upload de PDFs semanais
- Importação de dados

### Usuário Grupo
- Visualiza apenas seu grupo específico
- Cadastro de membros do grupo
- Importação de dados do grupo
- Visualização de responsáveis e secretários

## 🎯 Funcionalidades Futuras

### Fase 2 - Automações
- Integração com scripts Python para extração de PDFs
- Automação de preenchimento de formulários web
- Processamento automático de planilhas
- Relatórios automatizados

### Fase 3 - Avançado
- Sistema de notificações
- Backup automático
- API REST completa
- Aplicativo mobile

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

**Igreja Cristã Maranata**
- Website: https://www.igrejacristamaranata.org.br
- Email: contato@sistema-ebd.com

## 🔄 Atualizações

### v1.0.0 (Atual)
- ✅ Sistema de autenticação completo
- ✅ Gestão de membros com hierarquia
- ✅ Upload de arquivos e PDFs
- ✅ Dashboard com estatísticas
- ✅ Controle de permissões por nível

### v1.1.0 (Planejado)
- 🔄 Integração com automações Python
- 🔄 Sistema de backup
- 🔄 Relatórios avançados
- 🔄 Notificações por email

---

**Desenvolvido com ❤️ para a Igreja Cristã Maranata**
