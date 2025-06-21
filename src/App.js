// src/App.js - Versão Final Integrada ao PostgreSQL/Supabase
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Upload, 
  AlertCircle,
  User,
  BookOpen,
  Shield,
  Church,
  Eye,
  EyeOff,
  FileImage,
  CheckSquare,
  HelpCircle,
  Bot,
  LogOut,
  Loader2,
  Database
} from 'lucide-react';

// Import dos serviços Supabase
import { 
  authService, 
  membrosService, 
  ebdService, 
  estatisticasService,
  useSupabaseData 
} from './lib/supabase';

// Imports dos componentes
import MembrosComponent from './components/MembrosComponent';
import QuestionariosComponent from './components/QuestionariosComponent';
import ImportMembersComponent from './components/ImportMembersComponent';
import AutomationComponent from './components/AutomationComponent';

function App() {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estados para dados reais do PostgreSQL
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    total_membros: 0,
    total_igrejas: 0,
    total_grupos: 0,
    total_questionarios: 0,
    total_participacoes: 0,
    total_logs: 0
  });
  
  const [membros, setMembros] = useState([]);
  const [questionarios, setQuestionarios] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Hook para dados dinâmicos do Supabase
  const { config, loading: configLoading, error: configError } = useSupabaseData();

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL DE DADOS
  // =============================================================================
  
  useEffect(() => {
    // Verificar status da conexão
    setConnectionStatus(configError ? 'error' : configLoading ? 'connecting' : 'connected');
  }, [configLoading, configError]);

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          console.log('🔄 Carregando dados do usuário:', currentUser.nome);
          
          // Carregar dados baseados no usuário logado
          const [
            statsData,
            membrosData,
            questionariosData
          ] = await Promise.all([
            estatisticasService.obterDashboard(
              currentUser.id, 
              currentUser.igreja_id, 
              currentUser.grupo_id
            ),
            membrosService.listar({
              igreja_id: currentUser.perfil_acesso === 'igreja' ? currentUser.igreja_id : null,
              grupo_id: currentUser.perfil_acesso === 'grupo' ? currentUser.grupo_id : null,
              situacao: 'ativo'
            }),
            ebdService.listarQuestionarios({ limite: 10 })
          ]);

          setEstatisticas(statsData);
          setMembros(membrosData);
          setQuestionarios(questionariosData);

          console.log('✅ Dados carregados:', {
            membros: membrosData.length,
            questionarios: questionariosData.length,
            usuarios: statsData.total_usuarios
          });

        } catch (error) {
          console.error('❌ Erro ao carregar dados do usuário:', error);
          showMessage('error', 'Erro ao carregar dados do sistema');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  // =============================================================================
  // 🛠️ FUNÇÕES UTILITÁRIAS
  // =============================================================================
  
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // =============================================================================
  // 🔐 COMPONENTE DE LOGIN
  // =============================================================================
  
  const LoginScreen = () => {
    const [formData, setFormData] = useState({
      email: 'admin@sistema.com',
      senha: 'admin123',
      igreja: 'Nova Brasília 1',
      funcao: 'Pastor'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    // Listas dinâmicas do Supabase com fallback
    const igrejasList = config?.igrejas || ['Nova Brasília 1', 'ICM Central'];
    const funcoesList = config?.funcoes || ['Pastor', 'Evangelista', 'Membro'];

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoginLoading(true);

      try {
        console.log('🔐 Iniciando processo de login...');
        
        // Login real via Supabase
        const { user, session } = await authService.login(
          formData.email,
          formData.senha,
          formData.igreja,
          formData.funcao
        );

        console.log('✅ Login bem-sucedido:', user.nome);
        
        setCurrentUser(user);
        setCurrentView('dashboard');
        showMessage('success', `Login realizado com sucesso! Bem-vindo, ${user.nome}`);
        
      } catch (error) {
        console.error('❌ Erro no login:', error);
        showMessage('error', error.message || 'Erro no login. Verifique suas credenciais.');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Sistema EBD</h1>
            <p className="text-gray-600">Igreja Cristã Maranata</p>
            
            {/* Status da conexão */}
            <div className="mt-3 flex items-center justify-center">
              {connectionStatus === 'connecting' && (
                <div className="flex items-center text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Conectando ao PostgreSQL...
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center text-xs text-green-600">
                  <Database className="w-3 h-3 mr-1" />
                  PostgreSQL Conectado
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center text-xs text-yellow-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Usando dados locais
                </div>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Igreja *</label>
              <select
                required
                value={formData.igreja}
                onChange={(e) => setFormData({...formData, igreja: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={configLoading}
              >
                <option value="">Selecione a igreja</option>
                {igrejasList.map(igreja => (
                  <option key={igreja} value={igreja}>{igreja}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
              <select
                required
                value={formData.funcao}
                onChange={(e) => setFormData({...formData, funcao: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={configLoading}
              >
                <option value="">Selecione a função</option>
                {funcoesList.map(funcao => (
                  <option key={funcao} value={funcao}>{funcao}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading || configLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                loginLoading || configLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Acesso Demo:</strong> admin@sistema.com / admin123
            <br />
            <strong>Banco:</strong> PostgreSQL {connectionStatus === 'connected' ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // 📊 COMPONENTE DE DASHBOARD
  // =============================================================================
  
  const Dashboard = () => {
    const getAccessLevel = () => {
      if (currentUser?.perfil_acesso === 'admin') return 'Administrador Geral';
      if (currentUser?.perfil_acesso === 'igreja') return `Igreja: ${currentUser.igreja}`;
      return `Grupo: ${currentUser.grupo_assistencia || 'N/A'}`;
    };

    return (
      <div className="space-y-6">
        {/* Header do Dashboard */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">📚 Sistema EBD - Dashboard</h2>
          <p className="opacity-90">Bem-vindo, {currentUser?.nome}</p>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 mr-1" />
              {getAccessLevel()}
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <Church className="w-4 h-4 mr-1" />
              {currentUser?.igreja}
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <User className="w-4 h-4 mr-1" />
              {currentUser?.funcao}
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <Database className="w-4 h-4 mr-1" />
              {connectionStatus === 'connected' ? 'PostgreSQL Online' : 'Modo Offline'}
            </span>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_usuarios}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Membros</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_membros}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Igrejas</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_igrejas}</p>
              </div>
              <Church className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Questionários</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_questionarios}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Seção de Membros e Questionários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Membros Recentes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Membros Recentes ({membros.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando membros...
              </div>
            ) : (
              <div className="space-y-3">
                {membros.slice(0, 5).map(membro => (
                  <div key={membro.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{membro.nome_completo}</h4>
                        <p className="text-sm text-gray-600">{membro.email || 'Email não informado'}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Igreja: {membro.igrejas?.nome || 'N/A'}</span>
                          {membro.grupos_assistencia && (
                            <span className="ml-2">| Grupo: {membro.grupos_assistencia.nome}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        membro.situacao === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {membro.situacao}
                      </span>
                    </div>
                  </div>
                ))}
                
                {membros.length === 0 && !loading && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum membro encontrado
                  </div>
                )}
                
                <button
                  onClick={() => setCurrentView('membros')}
                  className="w-full p-2 text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-300 rounded hover:bg-blue-50"
                >
                  Ver todos os membros ({membros.length}) →
                </button>
              </div>
            )}
          </div>

          {/* Lista de Questionários Recentes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Questionários EBD ({questionarios.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando questionários...
              </div>
            ) : (
              <div className="space-y-3">
                {questionarios.slice(0, 3).map(q => (
                  <div key={q.id} className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{q.titulo}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        q.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {q.status || 'pendente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{q.subtitulo || 'Sem descrição'}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {q.data_inicio ? `Período: ${formatDate(q.data_inicio)}` : 'Data não definida'}
                        {q.data_fim && ` - ${formatDate(q.data_fim)}`}
                      </span>
                      <span>{q.total_licoes || 0} lições</span>
                    </div>
                  </div>
                ))}
                
                {questionarios.length === 0 && !loading && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum questionário encontrado
                  </div>
                )}
                
                <button
                  onClick={() => setCurrentView('questionarios')}
                  className="w-full p-2 text-green-600 hover:text-green-700 text-sm font-medium border border-green-300 rounded hover:bg-green-50"
                >
                  Ver todos os questionários ({questionarios.length}) →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status da Conexão e Logs */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">
                {connectionStatus === 'connected' 
                  ? 'Sistema Conectado ao PostgreSQL Supabase' 
                  : 'Sistema em Modo Offline'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {estatisticas.total_logs > 0 && `${estatisticas.total_logs} logs registrados`}
              <span className="ml-2">| {connectionStatus === 'connected' ? 'Tempo Real' : 'Cache Local'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // 📝 COMPONENTE SIMPLIFICADO
  // =============================================================================
  
  const SimpleComponent = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Icon className="mr-2 h-6 w-6" />
        {title} - {currentUser?.igreja}
      </h2>
      {children || (
        <>
          <p className="text-gray-600 mb-4">
            Esta funcionalidade está {connectionStatus === 'connected' ? 'conectada ao banco PostgreSQL' : 'preparada para desenvolvimento'} e pronta para uso.
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-600">
            💡 <strong>Sistema Real:</strong> {connectionStatus === 'connected' 
              ? `Conectado ao Supabase com ${estatisticas.total_membros} membros`
              : 'Usando dados de exemplo'}
          </div>
        </>
      )}
    </div>
  );

  //=============================================================================
  // 🧭 COMPONENTE DE NAVEGAÇÃO
  // =============================================================================
  
  const Navigation = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'membros', label: 'Membros', icon: Users },
      { id: 'import-membros', label: '📥 Importar', icon: Upload },
      { id: 'questionarios', label: 'Questionários', icon: HelpCircle },
      { id: 'automacao', label: '🤖 Automação', icon: Bot },
      { id: 'upload', label: 'Arquivos', icon: Upload },
      { id: 'pdf', label: 'PDF Semanal', icon: FileImage },
      { id: 'perfis', label: 'Perfis', icon: Shield },
      { id: 'configuracoes', label: 'Config', icon: Settings }
    ];

    const filteredItems = menuItems.filter(item => {
      if (currentUser?.perfil_acesso === 'grupo') {
        return ['dashboard', 'membros', 'import-membros', 'questionarios', 'upload'].includes(item.id);
      }
      if (currentUser?.perfil_acesso === 'igreja') {
        return !['perfis', 'configuracoes'].includes(item.id);
      }
      return true; // Admin vê tudo
    });

    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    currentView === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  };

  // =============================================================================
  // 🎯 HEADER
  // =============================================================================
  
  const Header = () => {
    const handleLogout = async () => {
      try {
        await authService.logout(currentUser?.id);
        setCurrentUser(null);
        setCurrentView('login');
        setMembros([]);
        setQuestionarios([]);
        setEstatisticas({
          total_usuarios: 0,
          total_membros: 0,
          total_igrejas: 0,
          total_grupos: 0,
          total_questionarios: 0,
          total_participacoes: 0,
          total_logs: 0
        });
        showMessage('success', 'Logout realizado com sucesso!');
      } catch (error) {
        console.error('Erro no logout:', error);
        showMessage('error', 'Erro no logout');
      }
    };

    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema EBD</h1>
                <p className="text-xs text-gray-500">Igreja Cristã Maranata</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{currentUser?.nome}</p>
                  <p className="text-gray-500">{currentUser?.funcao} - {currentUser?.igreja}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded hover:bg-gray-100"
                title="Sair do sistema"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  // =============================================================================
  // 🎨 RENDERIZAÇÃO PRINCIPAL
  // =============================================================================
  
  const renderCurrentView = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'membros':
        return <MembrosComponent currentUser={currentUser} showMessage={showMessage} />;
      case 'import-membros':
        return <ImportMembersComponent currentUser={currentUser} showMessage={showMessage} />;
      case 'questionarios':
        return <QuestionariosComponent currentUser={currentUser} showMessage={showMessage} />;
      case 'automacao':
        return <AutomationComponent currentUser={currentUser} showMessage={showMessage} />;
      case 'upload':
        return <SimpleComponent title="Gestão de Arquivos" icon={Upload} />;
      case 'pdf':
        return <SimpleComponent title="PDF Semanal" icon={FileImage} />;
      case 'perfis':
        return <SimpleComponent title="Gestão de Perfis" icon={Shield} />;
      case 'configuracoes':
        return <SimpleComponent title="Configurações" icon={Settings} />;
      default:
        return <Dashboard />;
    }
  };

  // =============================================================================
  // 🏗️ RENDER PRINCIPAL
  // =============================================================================
  
  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser && <Header />}
      {currentUser && <Navigation />}
      
      <main className={currentUser ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' && <CheckSquare className="h-4 w-4 mr-2" />}
              {message.type === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
              {message.text}
            </div>
          </div>
        )}
        
        {renderCurrentView()}
      </main>

      {currentUser && (
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <p>© 2025 Sistema EBD - Igreja Cristã Maranata - {currentUser?.igreja}</p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-400' :
                    connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                  }`}></div>
                  {connectionStatus === 'connected' ? 'PostgreSQL Online' :
                   connectionStatus === 'connecting' ? 'Conectando...' :
                   'Modo Offline'}
                </span>
                <span className="text-xs">
                  v1.0.0 | {estatisticas.total_logs > 0 && `${estatisticas.total_logs} logs`}
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
