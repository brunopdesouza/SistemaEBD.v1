// src/components/QuestionariosComponent.js
import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  Users,
  BarChart3,
  Search,
  Filter,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Download
} from 'lucide-react';

// Import dos serviços
import { ebdService } from '../lib/supabase';

const QuestionariosComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [questionarios, setQuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    ano: new Date().getFullYear()
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    total_questionarios: 0,
    questionarios_ativos: 0,
    total_participacoes: 0,
    taxa_participacao: 0
  });

  // Formulário de questionário
  const [formQuestionario, setFormQuestionario] = useState({
    titulo: '',
    subtitulo: '',
    periodo: '',
    ano: new Date().getFullYear(),
    trimestre: 1,
    data_inicio: '',
    data_fim: '',
    total_licoes: 12,
    status: 'ativo'
  });

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL
  // =============================================================================
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar questionários e estatísticas
      const [questionariosData, estatisticasData] = await Promise.all([
        ebdService.listarQuestionarios(filtros),
        ebdService.estatisticas()
      ]);
      
      setQuestionarios(questionariosData);
      setEstatisticas(estatisticasData);
      
      console.log(`✅ ${questionariosData.length} questionários carregados`);
      
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      showMessage('error', 'Erro ao carregar questionários');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    loadData();
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: '',
      ano: new Date().getFullYear()
    });
    setTimeout(() => loadData(), 100);
  };

  // =============================================================================
  // 📝 CRUD DE QUESTIONÁRIOS
  // =============================================================================
  
  const criarQuestionario = async () => {
    try {
      if (!formQuestionario.titulo.trim()) {
        showMessage('error', 'Digite o título do questionário');
        return;
      }

      const novoQuestionario = await ebdService.criarQuestionario(
        formQuestionario, 
        currentUser?.id || 'demo-user-id'
      );

      setQuestionarios(prev => [novoQuestionario, ...prev]);
      setShowModal(false);
      resetForm();
      showMessage('success', 'Questionário criado com sucesso!');
      
      // Atualizar estatísticas
      loadData();

    } catch (error) {
      console.error('Erro ao criar questionário:', error);
      showMessage('error', 'Erro ao criar questionário');
    }
  };

  const resetForm = () => {
    setFormQuestionario({
      titulo: '',
      subtitulo: '',
      periodo: '',
      ano: new Date().getFullYear(),
      trimestre: 1,
      data_inicio: '',
      data_fim: '',
      total_licoes: 12,
      status: 'ativo'
    });
    setQuestionarioSelecionado(null);
    setModoEdicao(false);
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================
  
  // Barra de filtros
  const BarraFiltros = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar questionários..."
            value={filtros.busca}
            onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <select
          value={filtros.status}
          onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
        </select>

        {/* Ano */}
        <select
          value={filtros.ano}
          onChange={(e) => setFiltros({...filtros, ano: parseInt(e.target.value)})}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </button>
          <button
            onClick={limparFiltros}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </button>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Questionário
        </button>
      </div>
    </div>
  );

  // Cards de estatísticas
  const CardsEstatisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Questionários</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_questionarios}</p>
          </div>
          <HelpCircle className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Questionários Ativos</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.questionarios_ativos}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Participações</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_participacoes}</p>
          </div>
          <Users className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Taxa Participação</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.taxa_participacao}%</p>
          </div>
          <BarChart3 className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </div>
  );

  // Lista de questionários
  const ListaQuestionarios = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span>Carregando questionários...</span>
          </div>
        </div>
      );
    }

    if (questionarios.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum questionário encontrado</h3>
          <p className="text-gray-600 mb-4">
            {filtros.busca ? 'Tente ajustar os filtros de busca' : 'Nenhum questionário cadastrado ainda'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Primeiro Questionário
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            Questionários EBD ({questionarios.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {questionarios.map(questionario => (
            <div key={questionario.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                {/* Informações do questionário */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {questionario.titulo}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {questionario.subtitulo || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    {/* Período */}
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {questionario.periodo || `${questionario.ano || new Date().getFullYear()}`}
                        </span>
                      </div>
                      {questionario.data_inicio && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="ml-6">
                            {new Date(questionario.data_inicio).toLocaleDateString('pt-BR')}
                            {questionario.data_fim && 
                              ` - ${new Date(questionario.data_fim).toLocaleDateString('pt-BR')}`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lições */}
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{questionario.total_licoes || 0} lições</span>
                      </div>
                      {questionario.trimestre && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="ml-6">{questionario.trimestre}º Trimestre</span>
                        </div>
                      )}
                    </div>

                    {/* Arquivo PDF */}
                    <div className="space-y-1">
                      {questionario.arquivos?.nome_original ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="truncate">{questionario.arquivos.nome_original}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-400">
                          <Upload className="h-4 w-4 mr-2" />
                          <span>Nenhum arquivo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Data de criação */}
                  <div className="mt-2 text-xs text-gray-500">
                    Criado em: {new Date(questionario.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Ações e status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    questionario.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : questionario.status === 'inativo'
                      ? 'bg-red-100 text-red-800'
                      : questionario.status === 'pendente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {questionario.status || 'pendente'}
                  </span>

                  <button
                    onClick={() => {
                      setQuestionarioSelecionado(questionario);
                      setModoEdicao(false);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setQuestionarioSelecionado(questionario);
                      setFormQuestionario({
                        titulo: questionario.titulo,
                        subtitulo: questionario.subtitulo || '',
                        periodo: questionario.periodo || '',
                        ano: questionario.ano || new Date().getFullYear(),
                        trimestre: questionario.trimestre || 1,
                        data_inicio: questionario.data_inicio || '',
                        data_fim: questionario.data_fim || '',
                        total_licoes: questionario.total_licoes || 12,
                        status: questionario.status || 'ativo'
                      });
                      setModoEdicao(true);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir "${questionario.titulo}"?`)) {
                        showMessage('info', 'Funcionalidade de exclusão em desenvolvimento');
                      }
                    }}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modal de criação/edição/visualização
  const ModalQuestionario = () => {
    if (!showModal) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (modoEdicao && questionarioSelecionado) {
        // TODO: Implementar edição
        showMessage('info', 'Funcionalidade de edição em desenvolvimento');
      } else {
        criarQuestionario();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {modoEdicao ? 'Editar Questionário' : 
                 questionarioSelecionado ? 'Detalhes do Questionário' : 
                 'Novo Questionário EBD'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {questionarioSelecionado && !modoEdicao ? (
              // Modo visualização
              <div className="space-y-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold">{questionarioSelecionado.titulo}</h4>
                  <p className="text-gray-600">{questionarioSelecionado.subtitulo}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-3">Informações Gerais</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Período:</strong> {questionarioSelecionado.periodo || 'Não definido'}</p>
                      <p><strong>Ano:</strong> {questionarioSelecionado.ano}</p>
                      <p><strong>Trimestre:</strong> {questionarioSelecionado.trimestre}º</p>
                      <p><strong>Total de Lições:</strong> {questionarioSelecionado.total_licoes}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          questionarioSelecionado.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {questionarioSelecionado.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-3">Datas e Arquivo</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Data Início:</strong> {
                        questionarioSelecionado.data_inicio 
                          ? new Date(questionarioSelecionado.data_inicio).toLocaleDateString('pt-BR')
                          : 'Não definida'
                      }</p>
                      <p><strong>Data Fim:</strong> {
                        questionarioSelecionado.data_fim 
                          ? new Date(questionarioSelecionado.data_fim).toLocaleDateString('pt-BR')
                          : 'Não definida'
                      }</p>
                      <p><strong>Arquivo PDF:</strong> {
                        questionarioSelecionado.arquivos?.nome_original || 'Nenhum arquivo'
                      }</p>
                      <p><strong>Criado em:</strong> {
                        new Date(questionarioSelecionado.created_at).toLocaleDateString('pt-BR')
                      }</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      <strong>Sistema em Desenvolvimento:</strong> Funcionalidades de perguntas, respostas e participações serão implementadas em breve.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => {
                      setFormQuestionario({
                        titulo: questionarioSelecionado.titulo,
                        subtitulo: questionarioSelecionado.subtitulo || '',
                        periodo: questionarioSelecionado.periodo || '',
                        ano: questionarioSelecionado.ano || new Date().getFullYear(),
                        trimestre: questionarioSelecionado.trimestre || 1,
                        data_inicio: questionarioSelecionado.data_inicio || '',
                        data_fim: questionarioSelecionado.data_fim || '',
                        total_licoes: questionarioSelecionado.total_licoes || 12,
                        status: questionarioSelecionado.status || 'ativo'
                      });
                      setModoEdicao(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              // Modo criação/edição
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Título */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Questionário *
                    </label>
                    <input
                      type="text"
                      required
                      value={formQuestionario.titulo}
                      onChange={(e) => setFormQuestionario({...formQuestionario, titulo: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Avaliação EBD - 1º Trimestre 2025"
                    />
                  </div>

                  {/* Subtítulo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição/Subtítulo
                    </label>
                    <textarea
                      value={formQuestionario.subtitulo}
                      onChange={(e) => setFormQuestionario({...formQuestionario, subtitulo: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Descreva o objetivo e conteúdo do questionário..."
                    />
                  </div>

                  {/* Período */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período
                    </label>
                    <input
                      type="text"
                      value={formQuestionario.periodo}
                      onChange={(e) => setFormQuestionario({...formQuestionario, periodo: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 1º Trimestre 2025"
                    />
                  </div>

                  {/* Ano */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano *
                    </label>
                    <select
                      required
                      value={formQuestionario.ano}
                      onChange={(e) => setFormQuestionario({...formQuestionario, ano: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2026}>2026</option>
                    </select>
                  </div>

                  {/* Trimestre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trimestre
                    </label>
                    <select
                      value={formQuestionario.trimestre}
                      onChange={(e) => setFormQuestionario({...formQuestionario, trimestre: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1º Trimestre</option>
                      <option value={2}>2º Trimestre</option>
                      <option value={3}>3º Trimestre</option>
                      <option value={4}>4º Trimestre</option>
                    </select>
                  </div>

                  {/* Total de Lições */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total de Lições
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formQuestionario.total_licoes}
                      onChange={(e) => setFormQuestionario({...formQuestionario, total_licoes: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Data Início */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={formQuestionario.data_inicio}
                      onChange={(e) => setFormQuestionario({...formQuestionario, data_inicio: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Data Fim */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      value={formQuestionario.data_fim}
                      onChange={(e) => setFormQuestionario({...formQuestionario, data_fim: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formQuestionario.status}
                      onChange={(e) => setFormQuestionario({...formQuestionario, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {modoEdicao ? 'Salvar Alterações' : 'Criar Questionário'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // 🎨 RENDER PRINCIPAL
  // =============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">📚 Questionários EBD</h2>
        <p className="opacity-90">
          Gestão completa dos questionários da Escola Bíblica Dominical
        </p>
        <div className="mt-2 text-sm opacity-75">
          Sistema conectado ao PostgreSQL - {currentUser?.igreja}
        </div>
      </div>

      {/* Cards de estatísticas */}
      <CardsEstatisticas />

      {/* Barra de filtros */}
      <BarraFiltros />

      {/* Lista de questionários */}
      <ListaQuestionarios />

      {/* Modal */}
      <ModalQuestionario />
    </div>
  );
};

export default QuestionariosComponent;
