import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Upload, 
  AlertCircle,
  User,
  MessageSquare,
  BookOpen,
  Shield,
  Church,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  FileImage,
  CheckSquare,
  HelpCircle,
  Save,
  Bot // NOVA IMPORTAÇÃO
} from 'lucide-react';

// NOVAS IMPORTAÇÕES PARA SUPABASE
import { dataService, useSupabaseData } from './lib/supabase';
import AutomationComponent from './components/AutomationComponent';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [estatisticas, setEstatisticas] = useState({
    total_usuarios: 0,
    total_membros: 0,
    total_igrejas: 0,
    total_grupos: 0
  });
  const [questionarios, setQuestionarios] = useState([]);
  const [estatisticasQuestionarios, setEstatisticasQuestionarios] = useState({
    total_questionarios: 0,
    questionarios_ativos: 0,
    total_respostas: 0,
    taxa_participacao: 0
  });
  const [formQuestionario, setFormQuestionario] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    ativo: true,
    grupo_target: '',
    perguntas: []
  });

  // HOOK PARA DADOS DO SUPABASE
  const { config, loading: configLoading } = useSupabaseData();

  // LISTAS DINÂMICAS DO SUPABASE COM FALLBACK
  const igrejasList = config.igrejas || [
    'ICM Central',
    'ICM Vila Nova',
    'ICM Jardim das Flores',
    'ICM Centro',
    'ICM Bairro Alto',
    'Nova Brasília 1' // GARANTIR QUE NOVA BRASÍLIA 1 ESTÁ INCLUÍDA
  ];

  const funcoesList = config.funcoes || [
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

  const gruposAssistencia = config.grupos_assistencia || [
    'Grupo 1 - Adultos',
    'Grupo 2 - Jovens',
    'Grupo 3 - Adolescentes',
    'Grupo 4 - Crianças',
    'Grupo 5 - Terceira Idade',
    'Grupo 6 - Casais',
    'Grupo 7 - Solteiros'
  ];

  // CARREGAMENTO DE DADOS REAIS DO SUPABASE
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar estatísticas reais do Supabase
        const stats = await dataService.getEstatisticas();
        setEstatisticas(stats);

        // Carregar questionários reais
        const questData = await dataService.getQuestionarios();
        setQuestionarios(questData);
        
        setEstatisticasQuestionarios({
          total_questionarios: questData.length,
          questionarios_ativos: questData.filter(q => q.ativo).length,
          total_respostas: questData.reduce((total, q) => total + (q.total_respostas || 0), 0),
          taxa_participacao: questData.length > 0 ? Math.round((questData.filter(q => q.ativo).length / questData.length) * 100) : 0
        });

      } catch (error) {
        console.error('Erro carregando dados do Supabase:', error);
        // Manter dados demo se der erro - agora com Nova Brasília 1
        setEstatisticas({
          total_usuarios: 1,
          total_membros: 3, // Incluir membros de Nova Brasília 1
          total_igrejas: 6, // Incluir Nova Brasília 1
          total_grupos: 7
        });

        // Questionário demo específico da Nova Brasília 1
        const questionarioDemo = {
          id: '1',
          titulo: 'Avaliação da Escola Bíblica - Nova Brasília 1',
          descricao: 'Questionário semanal para avaliar o aprendizado e participação na EBD da Nova Brasília 1',
          data_inicio: '2024-11-01',
          data_fim: '2024-11-07',
          ativo: true,
          grupo_target: 'Todos',
          igreja: 'Nova Brasília 1',
          perguntas: [
            {
              id: '1',
              texto: 'Como você avalia a lição de hoje na Nova Brasília 1?',
              tipo: 'multipla_escolha',
              opcoes: ['Excelente', 'Muito boa', 'Boa', 'Regular', 'Precisa melhorar'],
              obrigatoria: true
            },
            {
              id: '2', 
              texto: 'Qual foi o principal aprendizado da lição na Nova Brasília 1?',
              tipo: 'texto_longo',
              opcoes: [],
              obrigatoria: true
            }
          ],
          criado_por: 'admin@novabrasilia1.com',
          criado_em: '2024-10-28'
        };

        setQuestionarios([questionarioDemo]);
        setEstatisticasQuestionarios({
          total_questionarios: 1,
          questionarios_ativos: 1,
          total_respostas: 2,
          taxa_participacao: 75
        });
      }
    };

    if (!configLoading) {
      loadData();
    }
  }, [configLoading]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const LoginScreen = () => {
    const [formData, setFormData] = useState({
      email: 'admin@sistema.com',
      senha: 'admin123',
      igreja: 'Nova Brasília 1', // PADRÃO PARA NOVA BRASÍLIA 1
      funcao: 'Pastor'
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (formData.email === 'admin@sistema.com' && formData.senha === 'admin123') {
          const user = {
            id: '1',
            nome: 'Administrador Sistema',
            email: 'admin@sistema.com',
            igreja: formData.igreja,
            funcao: formData.funcao,
            perfil: 'admin'
          };

          // Tentar criar/atualizar perfil no Supabase
          try {
            await dataService.createProfile({
              id: user.id,
              nome: user.nome,
              email: user.email,
              igreja: user.igreja,
              funcao: user.funcao,
              perfil: 'admin'
            });
          } catch (error) {
            // Perfil já existe ou erro de conexão, tudo bem para demo
            console.log('Perfil já existe ou erro de conexão:', error);
          }

          setCurrentUser(user);
          setCurrentView('dashboard');
          showMessage('success', `Login realizado com sucesso! Igreja: ${formData.igreja}`);
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Igreja *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Função *</label>
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

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Demo:</strong> admin@sistema.com / admin123
            <br />
            <strong>Igreja padrão:</strong> Nova Brasília 1
          </div>
        </div>
      </div>
    );
  };

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
          {/* DESTAQUE ESPECIAL PARA NOVA BRASÍLIA 1 */}
          {currentUser?.igreja === 'Nova Brasília 1' && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg text-sm">
              🎯 <strong>Nova Brasília 1</strong> - Sistema de automação disponível! 
              <button 
                onClick={() => setCurrentView('automacao')}
                className="ml-2 bg-white/20 px-2 py-1 rounded text-xs hover:bg-white/30"
              >
                Acessar Automação →
              </button>
            </div>
          )}
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
                <p className="text-sm text-gray-600">Questionários Ativos</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticasQuestionarios.questionarios_ativos}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-purple-500" />
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
              {gruposAssistencia.slice(0, 4).map(grupo => (
                <div key={grupo} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{grupo}</h4>
                    <span className="text-sm font-semibold text-blue-600">5 membros</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Responsável:</span><br />
                      João Silva
                    </div>
                    <div>
                      <span className="font-medium">Secretário:</span><br />
                      Maria Santos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Questionários Recentes
            </h3>
            <div className="space-y-3">
              {questionarios.slice(0, 3).map(q => (
                <div key={q.id} className="p-3 bg-gray-50 rounded border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{q.titulo}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      q.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {q.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{q.descricao}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Período: {formatDate(q.data_inicio)} - {formatDate(q.data_fim)}</span>
                    <span>{q.perguntas?.length || 0} perguntas</span>
                  </div>
                  {q.igreja && (
                    <div className="mt-1 text-xs text-blue-600">
                      🏛️ {q.igreja}
                    </div>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => setCurrentView('questionarios')}
                className="w-full p-2 text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-300 rounded hover:bg-blue-50"
              >
                Ver todos os questionários →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            PDFs Semanais - {currentUser?.igreja}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Semana 45 - 2024</p>
                <p className="text-sm text-gray-600">Validado - {currentUser?.igreja}</p>
              </div>
              <CheckSquare className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Semana 44 - 2024</p>
                <p className="text-sm text-gray-600">Pendente validação - {currentUser?.igreja}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ListaQuestionarios = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <HelpCircle className="mr-2 h-6 w-6" />
          Questionários da EBD - {currentUser?.igreja}
        </h2>
        <button
          onClick={() => setCurrentView('criar-questionario')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Questionário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Lista de Questionários</h3>
            <div className="flex gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Search className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {questionarios.map(questionario => (
            <div key={questionario.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {questionario.titulo}
                  </h4>
                  <p className="text-gray-600 mb-2">{questionario.descricao}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(questionario.data_inicio)} - {formatDate(questionario.data_fim)}
                    </span>
                    <span className="flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      {questionario.perguntas?.length || 0} perguntas
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      2 respostas
                    </span>
                    {questionario.igreja && (
                      <span className="flex items-center">
                        <Church className="h-4 w-4 mr-1" />
                        {questionario.igreja}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    questionario.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {questionario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    onClick={() => showMessage('info', 'Funcionalidade em desenvolvimento')}
                    className="p-2 text-blue-600 hover:text-blue-700"
                    title="Ver respostas"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-700" title="Editar">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-700" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CriarQuestionario = () => {
    const salvarQuestionario = async () => {
      if (!formQuestionario.titulo.trim()) {
        showMessage('error', 'Digite o título do questionário');
        return;
      }

      try {
        const novoQuestionario = {
          ...formQuestionario,
          igreja: currentUser?.igreja || 'Nova Brasília 1'
        };

        // Tentar salvar no Supabase
        try {
          const created = await dataService.createQuestionario(novoQuestionario);
          setQuestionarios(prev => [...prev, created]);
          showMessage('success', 'Questionário criado com sucesso no Supabase!');
        } catch (error) {
          console.error('Erro salvando no Supabase:', error);
          // Fallback - salvar localmente
          const fallbackQuestionario = {
            id: Date.now().toString(),
            ...novoQuestionario,
            criado_por: currentUser.email,
            criado_em: new Date().toISOString().split('T')[0]
          };
          setQuestionarios(prev => [...prev, fallbackQuestionario]);
          showMessage('success', 'Questionário criado com sucesso (modo offline)!');
        }
        
        setCurrentView('questionarios');
        
        // Limpar formulário
        setFormQuestionario({
          titulo: '',
          descricao: '',
          data_inicio: '',
          data_fim: '',
          ativo: true,
          grupo_target: '',
          perguntas: []
        });

      } catch (error) {
        console.error('Erro criando questionário:', error);
        showMessage('error', 'Erro ao salvar questionário');
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Plus className="mr-2 h-6 w-6" />
            Criar Novo Questionário - {currentUser?.igreja}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Questionário *
              </label>
              <input
                type="text"
                value={formQuestionario.titulo}
                onChange={(e) => setFormQuestionario(prev => ({...prev, titulo: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Avaliação da EBD - Nova Brasília 1 - Semana 45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo Alvo
              </label>
              <select
                value={formQuestionario.grupo_target}
                onChange={(e) => setFormQuestionario(prev => ({...prev, grupo_target: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os grupos</option>
                {gruposAssistencia.map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formQuestionario.descricao}
              onChange={(e) => setFormQuestionario(prev => ({...prev, descricao: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Descreva o objetivo do questionário para a Nova Brasília 1..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início
              </label>
              <input
                type="date"
                value={formQuestionario.data_inicio}
                onChange={(e) => setFormQuestionario(prev => ({...prev, data_inicio: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim
              </label>
              <input
                type="date"
                value={formQuestionario.data_fim}
                onChange={(e) => setFormQuestionario(prev => ({...prev, data_fim: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentView('questionarios')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={salvarQuestionario}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Questionário
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SimpleComponent = ({ title, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Icon className="mr-2 h-6 w-6" />
        {title} - {currentUser?.igreja}
      </h2>
      <p className="text-gray-600">Esta funcionalidade está sendo desenvolvida especificamente para a {currentUser?.igreja}.</p>
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-600">
        💡 <strong>Em breve:</strong> Funcionalidades personalizadas para cada igreja
      </div>
    </div>
  );

  const Navigation = () => {
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'membros', label: 'Membros', icon: Users },
      { id: 'questionarios', label: 'Questionários', icon: HelpCircle },
      { id: 'automacao', label: '🤖 Automação', icon: Bot }, // NOVO ITEM DE MENU
      { id: 'upload', label: 'Importar Dados', icon: Upload },
      { id: 'pdf', label: 'PDF Semanal', icon: FileImage },
      { id: 'perfis', label: 'Perfis', icon: Shield },
      { id: 'configuracoes', label: 'Configurações', icon: Settings }
    ];

    const filteredItems = menuItems.filter(item => {
      if (currentUser?.perfil === 'grupo') {
        return ['dashboard', 'membros', 'questionarios', 'automacao', 'upload'].includes(item.id);
      }
      if (currentUser?.perfil === 'igreja') {
        return ['dashboard', 'membros', 'questionarios', 'automacao', 'upload', 'pdf'].includes(item.id);
      }
      return true; // Admin vê tudo
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
                <p className="text-gray-500">{currentUser?.funcao} - {currentUser?.igreja}</p>
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

  const renderCurrentView = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'membros':
        return <SimpleComponent title="Gestão de Membros" icon={Users} />;
      case 'questionarios':
        return <ListaQuestionarios />;
      case 'criar-questionario':
        return <CriarQuestionario />;
      case 'automacao': // NOVO CASE PARA AUTOMAÇÃO
        return <AutomationComponent />;
      case 'respostas':
        return <SimpleComponent title="Respostas do Questionário" icon={MessageSquare} />;
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
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {message.text}
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
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                  Sistema Online
                </span>
                {configLoading && (
                  <span className="flex items-center text-blue-600">
                    <div className="h-2 w-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                    Conectando Supabase...
                  </span>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
