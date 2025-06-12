import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  User,
  MessageSquare,
  BookOpen,
  Shield,
  Database,
  Download,
  RefreshCw,
  LogIn,
  UserPlus,
  Church,
  UsersRound,
  FileText,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  FileSpreadsheet,
  FileImage,
  CheckSquare,
  X
} from 'lucide-react';

const SistemaEBD = () => {
  // Estados principais
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados para dados
  const [usuarios, setUsuarios] = useState([]);
  const [membros, setMembros] = useState([]);
  const [pdfsSemanais, setPdfsSemanais] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    total_membros: 0,
    total_igrejas: 0,
    total_grupos: 0
  });

  // Dados mocados para demonstração
  const igrejasList = [
    'ICM Central',
    'ICM Vila Nova',
    'ICM Jardim das Flores',
    'ICM Centro',
    'ICM Bairro Alto'
  ];

  const funcoesList = [
    'Pastor',
    'Evangelista', 
    'Diácono',
    'Obreiro',
    'Professor',
    'Responsável do Grupo',
    'Secretário do Grupo',
    'Líder de Grupo',
    'Membro'
  ];

  const gruposAssistencia = [
    'Grupo 1 - Adultos',
    'Grupo 2 - Jovens',
    'Grupo 3 - Adolescentes',
    'Grupo 4 - Crianças',
    'Grupo 5 - Terceira Idade',
    'Grupo 6 - Casais',
    'Grupo 7 - Solteiros'
  ];

  // Função para obter responsável e secretário do grupo
  const getGrupoResponsaveis = (grupoAssistencia) => {
    const responsavel = usuarios.find(u => 
      u.grupo_assistencia === grupoAssistencia && 
      u.funcao === 'Responsável do Grupo' && 
      u.ativo
    );
    
    const secretario = usuarios.find(u => 
      u.grupo_assistencia === grupoAssistencia && 
      u.funcao === 'Secretário do Grupo' && 
      u.ativo
    );

    return { responsavel, secretario };
  };

  // Função para obter estatísticas do grupo
  const getEstatisticasGrupo = (grupoAssistencia) => {
    const membrosGrupo = membros.filter(m => m.grupo_assistencia === grupoAssistencia);
    return {
      total_membros: membrosGrupo.length,
      por_classe: membrosGrupo.reduce((acc, m) => {
        acc[m.classe] = (acc[m.classe] || 0) + 1;
        return acc;
      }, {}),
      por_situacao: membrosGrupo.reduce((acc, m) => {
        acc[m.situacao] = (acc[m.situacao] || 0) + 1;
        return acc;
      }, {})
    };
  };

  // Simulação de dados iniciais
  useEffect(() => {
    // Dados mocados
    setUsuarios([
      {
        id: '1',
        nome: 'Administrador Sistema',
        email: 'admin@sistema.com',
        igreja: 'ICM Central',
        funcao: 'Pastor',
        grupo_assistencia: '',
        perfil: 'admin',
        telefone: '11999999999',
        ativo: true
      }
    ]);

    setMembros([
      {
        id: '1',
        nome: 'João Silva',
        sexo: 'M',
        cpf: '12345678901',
        classe: 'Adultos',
        situacao: 'Membro',
        telefone: '11888888888',
        igreja: 'ICM Central',
        grupo_assistencia: 'Grupo 1 - Adultos'
      }
    ]);

    setEstatisticas({
      total_usuarios: 1,
      total_membros: 1,
      total_igrejas: 5,
      total_grupos: 7
    });
  }, []);

  // Funções utilitárias
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Componente de Login
  const LoginScreen = () => {
    const [formData, setFormData] = useState({
      email: '',
      senha: '',
      igreja: '',
      funcao: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        // Simulação de login
        if (formData.email === 'admin@sistema.com' && formData.senha === 'admin123') {
          setCurrentUser({
            id: '1',
            nome: 'Administrador Sistema',
            email: 'admin@sistema.com',
            igreja: 'ICM Central',
            funcao: 'Pastor',
            perfil: 'admin'
          });
          setCurrentView('dashboard');
          showMessage('success', 'Login realizado com sucesso!');
        } else {
          showMessage('error', 'Credenciais inválidas');
        }
      } catch (error) {
        showMessage('error', 'Erro no login');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Sistema EBD</h1>
            <p className="text-gray-600">Igreja Cristã Maranata</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Igreja *
              </label>
              <select
                required
                value={formData.igreja}
                onChange={(e) => setFormData({...formData, igreja: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione a igreja</option>
                {igrejasList.map(igreja => (
                  <option key={igreja} value={igreja}>{igreja}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função *
              </label>
              <select
                required
                value={formData.funcao}
                onChange={(e) => setFormData({...formData, funcao: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione a função</option>
                {funcoesList.map(funcao => (
                  <option key={funcao} value={funcao}>{funcao}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
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
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('register')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Não tem conta? Cadastre-se aqui
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Demo:</strong> admin@sistema.com / admin123
          </div>
        </div>
      </div>
    );
  };

  // Componente de Cadastro de Usuário
  const RegisterScreen = () => {
    const [formData, setFormData] = useState({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
      igreja: '',
      funcao: '',
      grupo_assistencia: '',
      perfil: 'grupo'
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
      e.preventDefault();
      
      if (formData.senha !== formData.confirmarSenha) {
        showMessage('error', 'Senhas não coincidem');
        return;
      }

      if (formData.senha.length < 6) {
        showMessage('error', 'Senha deve ter pelo menos 6 caracteres');
        return;
      }

      setLoading(true);

      try {
        // Simulação de cadastro
        const novoUsuario = {
          id: Date.now().toString(),
          ...formData,
          ativo: true
        };
        delete novoUsuario.confirmarSenha;

        setUsuarios(prev => [...prev, novoUsuario]);
        setEstatisticas(prev => ({
          ...prev,
          total_usuarios: prev.total_usuarios + 1
        }));
        showMessage('success', 'Usuário cadastrado com sucesso! Faça login.');
        setCurrentView('login');
      } catch (error) {
        showMessage('error', 'Erro no cadastro');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Cadastro de Usuário</h1>
            <p className="text-gray-600">Sistema EBD - Igreja Cristã Maranata</p>
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={pdfForm.titulo}
                  onChange={(e) => setPdfForm({...pdfForm, titulo: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Questionário EBD - Semana 46"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semana/Ano *
                </label>
                <input
                  type="text"
                  required
                  value={pdfForm.semana}
                  onChange={(e) => setPdfForm({...pdfForm, semana: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 46/2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo PDF *
              </label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setPdfForm({...pdfForm, arquivo: e.target.files[0]})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Enviar PDF para Validação
            </button>
          </form>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
              Processo de Validação:
            </h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>1. Upload do PDF com título e semana</p>
              <p>2. Validação automática do conteúdo</p>
              <p>3. Disponibilização para todos os usuários após aprovação</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">PDFs Disponíveis</h3>
            <div className="space-y-3">
              {validatedPDFs.map(pdf => (
                <div key={pdf.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{pdf.titulo}</p>
                    <p className="text-sm text-gray-600">Semana {pdf.semana} • {pdf.igreja}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pdf.validado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pdf.validado ? 'Validado' : 'Pendente'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navegação Principal
  const Navigation = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'membros', label: 'Membros', icon: UsersRound },
      { id: 'upload', label: 'Importar Dados', icon: Upload },
      { id: 'pdf', label: 'PDF Semanal', icon: FileImage },
      { id: 'perfis', label: 'Perfis', icon: Shield },
      { id: 'configuracoes', label: 'Configurações', icon: Settings }
    ];

    // Filtrar itens baseado no perfil do usuário
    const filteredItems = menuItems.filter(item => {
      if (currentUser?.perfil === 'grupo') {
        return ['dashboard', 'membros', 'upload'].includes(item.id);
      }
      if (currentUser?.perfil === 'igreja') {
        return ['dashboard', 'membros', 'upload', 'pdf'].includes(item.id);
      }
      return true; // admin vê tudo
    });

    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
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

  // Header do Sistema
  const Header = () => (
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
                <p className="text-gray-500">{currentUser?.funcao}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setCurrentView('login');
                showMessage('success', 'Logout realizado com sucesso!');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Renderização Principal
  const renderCurrentView = () => {
    if (!currentUser) {
      return currentView === 'register' ? <RegisterScreen /> : <LoginScreen />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'membros':
        return <MembrosManagement />;
      case 'upload':
        return <FileUploadComponent />;
      case 'pdf':
        return <PDFUploadComponent />;
      case 'perfis':
        return <PerfilManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentUser && <Header />}
      {currentUser && <Navigation />}
      
      <main className={currentUser ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        {renderCurrentView()}
      </main>

      {currentUser && (
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <p>© 2025 Sistema EBD - Igreja Cristã Maranata</p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                  Sistema Online
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SistemaEBD;text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Igreja *
                </label>
                <select
                  required
                  value={formData.igreja}
                  onChange={(e) => setFormData({...formData, igreja: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione a igreja</option>
                  {igrejasList.map(igreja => (
                    <option key={igreja} value={igreja}>{igreja}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  required
                  value={formData.funcao}
                  onChange={(e) => setFormData({...formData, funcao: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione a função</option>
                  {funcoesList.map(funcao => (
                    <option key={funcao} value={funcao}>{funcao}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupo de Assistência *
                </label>
                <select
                  required
                  value={formData.grupo_assistencia}
                  onChange={(e) => setFormData({...formData, grupo_assistencia: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione o grupo</option>
                  {gruposAssistencia.map(grupo => (
                    <option key={grupo} value={grupo}>{grupo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value.replace(/\D/g, '')})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="11999999999"
                  maxLength="11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil de Acesso *
              </label>
              <select
                required
                value={formData.perfil}
                onChange={(e) => setFormData({...formData, perfil: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="grupo">Usuário Grupo - Acesso apenas ao seu grupo</option>
                <option value="igreja">Usuário Igreja - Acesso a todos os grupos da igreja</option>
                <option value="admin">Administrador - Acesso total ao sistema</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente Dashboard
  const Dashboard = () => {
    const getAccessLevel = () => {
      if (currentUser?.perfil === 'admin') return 'Administrador Geral';
      if (currentUser?.perfil === 'igreja') return `Igreja: ${currentUser.igreja}`;
      return `Grupo: ${currentUser.grupo_assistencia}`;
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">📚 Sistema EBD - Dashboard</h2>
          <p className="opacity-90">Bem-vindo, {currentUser?.nome}</p>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              {getAccessLevel()}
            </span>
            <span className="flex items-center">
              <Church className="w-4 h-4 mr-1" />
              {currentUser?.igreja}
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {currentUser?.funcao}
            </span>
          </div>
        </div>

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
              <UsersRound className="h-8 w-8 text-green-500" />
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
                <p className="text-sm text-gray-600">Grupos Assistência</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_grupos}</p>
              </div>
              <UsersRound className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Grupos de Assistência
            </h3>
            <div className="space-y-3">
              {gruposAssistencia.slice(0, 4).map(grupo => {
                const { responsavel, secretario } = getGrupoResponsaveis(grupo);
                const stats = getEstatisticasGrupo(grupo);
                
                return (
                  <div key={grupo} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{grupo}</h4>
                      <span className="text-sm font-semibold text-blue-600">
                        {stats.total_membros} membros
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Responsável:</span>
                        <br />
                        {responsavel ? responsavel.nome : 'Não definido'}
                      </div>
                      <div>
                        <span className="font-medium">Secretário:</span>
                        <br />
                        {secretario ? secretario.nome : 'Não definido'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              PDFs Semanais
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Semana 45 - 2024</p>
                  <p className="text-sm text-gray-600">Validado</p>
                </div>
                <CheckSquare className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Semana 44 - 2024</p>
                  <p className="text-sm text-gray-600">Pendente validação</p>
                </div>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Gestão de Perfis
  const PerfilManagement = () => {
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = usuarios.filter(user => 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.igreja.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPerfilBadge = (perfil) => {
      const badges = {
        admin: 'bg-red-100 text-red-800',
        igreja: 'bg-blue-100 text-blue-800',
        grupo: 'bg-green-100 text-green-800'
      };
      const labels = {
        admin: 'Administrador',
        igreja: 'Igreja',
        grupo: 'Grupo'
      };
      
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${badges[perfil]}`}>
          {labels[perfil]}
        </span>
      );
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              Gestão de Perfis
            </h2>
            <button
              onClick={() => setCurrentView('register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">Nome</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Igreja</th>
                  <th className="text-left p-3 font-semibold">Função</th>
                  <th className="text-left p-3 font-semibold">Perfil</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.nome}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">{user.igreja}</td>
                    <td className="p-3">{user.funcao}</td>
                    <td className="p-3">{getPerfilBadge(user.perfil)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Componente Gestão de Membros
  const MembrosManagement = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [formData, setFormData] = useState({
      nome: '',
      sexo: '',
      cpf: '',
      classe: '',
      situacao: '',
      telefone: '',
      igreja: currentUser?.perfil === 'admin' ? '' : currentUser?.igreja || '',
      grupo_assistencia: currentUser?.perfil === 'grupo' ? currentUser?.grupo_assistencia || '' : ''
    });

    // Obter grupos disponíveis baseado no perfil do usuário
    const getGruposDisponiveis = () => {
      if (currentUser?.perfil === 'admin') {
        return gruposAssistencia;
      } else if (currentUser?.perfil === 'igreja') {
        return gruposAssistencia;
      } else {
        return [currentUser?.grupo_assistencia].filter(Boolean);
      }
    };

    const gruposDisponiveis = getGruposDisponiveis();

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (editingMember) {
        setMembros(prev => prev.map(m => m.id === editingMember.id ? {...formData, id: editingMember.id} : m));
        showMessage('success', 'Membro atualizado com sucesso!');
      } else {
        const novoMembro = {
          id: Date.now().toString(),
          ...formData
        };
        setMembros(prev => [...prev, novoMembro]);
        setEstatisticas(prev => ({
          ...prev,
          total_membros: prev.total_membros + 1
        }));
        showMessage('success', 'Membro cadastrado com sucesso!');
      }
      
      setShowForm(false);
      setEditingMember(null);
      setFormData({
        nome: '',
        sexo: '',
        cpf: '',
        classe: '',
        situacao: '',
        telefone: '',
        igreja: currentUser?.perfil === 'admin' ? '' : currentUser?.igreja || '',
        grupo_assistencia: currentUser?.perfil === 'grupo' ? currentUser?.grupo_assistencia || '' : ''
      });
    };

    const filteredMembros = membros.filter(membro => {
      const matchesSearch = membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           membro.cpf.includes(searchTerm) ||
                           membro.classe.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrupo = selectedGrupo === '' || membro.grupo_assistencia === selectedGrupo;
      
      let hasPermission = false;
      if (currentUser?.perfil === 'admin') hasPermission = true;
      else if (currentUser?.perfil === 'igreja') hasPermission = membro.igreja === currentUser.igreja;
      else if (currentUser?.perfil === 'grupo') hasPermission = membro.grupo_assistencia === currentUser.grupo_assistencia;
      
      return matchesSearch && matchesGrupo && hasPermission;
    });

    return (
      <div className="space-y-6">
        {currentUser?.perfil === 'grupo' && currentUser?.grupo_assistencia && (
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UsersRound className="mr-2 h-5 w-5" />
              {currentUser.grupo_assistencia}
            </h3>
            
            {(() => {
              const { responsavel, secretario } = getGrupoResponsaveis(currentUser.grupo_assistencia);
              const stats = getEstatisticasGrupo(currentUser.grupo_assistencia);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Responsável</h4>
                    <p className="text-blue-700">
                      {responsavel ? responsavel.nome : 'Não definido'}
                    </p>
                    {responsavel && (
                      <p className="text-sm text-blue-600">{formatPhone(responsavel.telefone)}</p>
                    )}
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Secretário</h4>
                    <p className="text-green-700">
                      {secretario ? secretario.nome : 'Não definido'}
                    </p>
                    {secretario && (
                      <p className="text-sm text-green-600">{formatPhone(secretario.telefone)}</p>
                    )}
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Total de Membros</h4>
                    <p className="text-2xl font-bold text-purple-700">{stats.total_membros}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <UsersRound className="mr-2 h-6 w-6" />
              Gestão de Membros
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Membro
            </button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar membros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(currentUser?.perfil === 'admin' || currentUser?.perfil === 'igreja') && (
              <div>
                <select
                  value={selectedGrupo}
                  onChange={(e) => setSelectedGrupo(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os grupos</option>
                  {gruposDisponiveis.map(grupo => (
                    <option key={grupo} value={grupo}>{grupo}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingMember ? 'Editar Membro' : 'Novo Membro'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexo *
                    </label>
                    <select
                      required
                      value={formData.sexo}
                      onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12345678901"
                      maxLength="11"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="11999999999"
                      maxLength="11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe *
                    </label>
                    <select
                      required
                      value={formData.classe}
                      onChange={(e) => setFormData({...formData, classe: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="Crianças">Crianças</option>
                      <option value="Intermediários">Intermediários</option>
                      <option value="Adolescentes">Adolescentes</option>
                      <option value="Jovens">Jovens</option>
                      <option value="Adultos">Adultos</option>
                      <option value="Terceira Idade">Terceira Idade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Situação *
                    </label>
                    <select
                      required
                      value={formData.situacao}
                      onChange={(e) => setFormData({...formData, situacao: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      <option value="Membro">Membro</option>
                      <option value="Obreiro">Obreiro</option>
                      <option value="Diácono">Diácono</option>
                      <option value="Pastor">Pastor</option>
                      <option value="Visitante">Visitante</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser?.perfil === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Igreja *
                      </label>
                      <select
                        required
                        value={formData.igreja}
                        onChange={(e) => setFormData({...formData, igreja: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        {igrejasList.map(igreja => (
                          <option key={igreja} value={igreja}>{igreja}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(currentUser?.perfil === 'admin' || currentUser?.perfil === 'igreja') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grupo de Assistência *
                      </label>
                      <select
                        required
                        value={formData.grupo_assistencia}
                        onChange={(e) => setFormData({...formData, grupo_assistencia: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        {gruposDisponiveis.map(grupo => (
                          <option key={grupo} value={grupo}>{grupo}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMember(null);
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    {editingMember ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">Nome</th>
                  <th className="text-left p-3 font-semibold">CPF</th>
                  <th className="text-left p-3 font-semibold">Classe</th>
                  <th className="text-left p-3 font-semibold">Situação</th>
                  <th className="text-left p-3 font-semibold">Telefone</th>
                  {(currentUser?.perfil === 'admin' || currentUser?.perfil === 'igreja') && (
                    <th className="text-left p-3 font-semibold">Grupo</th>
                  )}
                  <th className="text-left p-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembros.map(membro => (
                  <tr key={membro.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{membro.nome}</td>
                    <td className="p-3 text-gray-600">{formatCPF(membro.cpf)}</td>
                    <td className="p-3">{membro.classe}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {membro.situacao}
                      </span>
                    </td>
                    <td className="p-3">{formatPhone(membro.telefone)}</td>
                    {(currentUser?.perfil === 'admin' || currentUser?.perfil === 'igreja') && (
                      <td className="p-3 text-sm">{membro.grupo_assistencia}</td>
                    )}
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingMember(membro);
                            setFormData(membro);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Componente Upload de Arquivos
  const FileUploadComponent = () => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFileUpload = (files) => {
      Array.from(files).forEach(file => {
        const fileInfo = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toLocaleString()
        };
        setUploadedFiles(prev => [...prev, fileInfo]);
      });
      showMessage('success', `${files.length} arquivo(s) carregado(s) com sucesso!`);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Upload className="mr-2 h-6 w-6" />
            Importação de Dados
          </h2>

          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              {message.text}
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Carregar Arquivos de Membros</h3>
            <p className="text-gray-600 mb-4">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Suporta: Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf), Word (.doc, .docx)
            </p>
            
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload-input"
            />
            
            <label
              htmlFor="file-upload-input"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Arquivos
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Arquivos Carregados</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB • {file.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Processar
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Formato Esperado para Planilhas:
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Colunas obrigatórias:</strong> Nome, CPF, Classe, Situação</p>
              <p><strong>Colunas opcionais:</strong> Sexo, Telefone, Igreja, Grupo de Assistência</p>
              <p><strong>Exemplo:</strong> Nome | CPF | Classe | Situação | Telefone</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Upload PDF Semanal
  const PDFUploadComponent = () => {
    const [pdfForm, setPdfForm] = useState({
      titulo: '',
      semana: '',
      arquivo: null
    });
    const [validatedPDFs, setValidatedPDFs] = useState([
      {
        id: '1',
        titulo: 'Questionário EBD - Semana 45',
        semana: '45/2024',
        validado: true,
        igreja: 'ICM Central',
        uploadDate: '2024-11-10'
      }
    ]);

    const handlePDFSubmit = (e) => {
      e.preventDefault();
      
      const novoPDF = {
        id: Date.now().toString(),
        ...pdfForm,
        validado: false,
        igreja: currentUser?.igreja,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      
      setValidatedPDFs(prev => [...prev, novoPDF]);
      showMessage('success', 'PDF enviado para validação!');
      
      setPdfForm({
        titulo: '',
        semana: '',
        arquivo: null
      });
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FileImage className="mr-2 h-6 w-6" />
            Upload PDF Semanal
          </h2>

          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePDFSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Questionário *
                </label>
                <input
                  type="
