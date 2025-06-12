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

  // Componente simples para outras telas
  const SimpleComponent = ({ title, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Icon className="mr-2 h-6 w-6" />
        {title}
      </h2>
      <p className="text-gray-600">Esta funcionalidade está sendo desenvolvida.</p>
    </div>
  );

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

    const filteredItems = menuItems.filter(item => {
      if (currentUser?.perfil === 'grupo') {
        return ['dashboard', 'membros', 'upload'].includes(item.id);
      }
      if (currentUser?.perfil === 'igreja') {
        return ['dashboard', 'membros', 'upload', 'pdf'].includes(item.id);
      }
      return true;
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
        return <SimpleComponent title="Gestão de Membros" icon={UsersRound} />;
      case 'upload':
        return <SimpleComponent title="Importação de Dados" icon={Upload} />;
      case 'pdf':
        return <SimpleComponent title="Upload PDF Semanal" icon={FileImage} />;
      case 'perfis':
        return <SimpleComponent title="Gestão de Perfis" icon={Shield} />;
      case 'configuracoes':
        return <SimpleComponent title="Configurações" icon={Settings} />;
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

export default SistemaEBD;
