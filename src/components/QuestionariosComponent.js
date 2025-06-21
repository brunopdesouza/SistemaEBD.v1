// src/components/QuestionariosComponent.js - Gestão de Questionários EBD
import React, { useState, useEffect } from 'react';
import { 
  HelpCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Upload,
  Save,
  X,
  Clock,
  Award
} from 'lucide-react';

import { ebdService, arquivosService, utils } from '../lib/supabase';

const QuestionariosComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [questionarios, setQuestionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);
  const [viewingQuestionario, setViewingQuestionario] = useState(null);
  const [perguntas, setPerguntas] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    pendentes: 0,
    processados: 0
  });

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL
  // =============================================================================
  useEffect(() => {
    loadQuestionarios();
  }, [searchTerm, filtroAno, filtroStatus]);

  const loadQuestionarios = async () => {
    try {
      setLoading(true);
      
      const filtros = {
        ano: filtroAno !== 'todos' ? filtroAno : undefined,
        status: filtroStatus !== 'todos' ? filtroStatus : undefined,
        busca: searchTerm.trim() || undefined
      };

      const data = await ebdService.listarQuestionarios(filtros);
      setQuestionarios(data);
      
      // Calcular estatísticas
      const stats = {
        total: data.length,
        ativos: data.filter(q => q.status === 'ativo').length,
        pendentes: data.filter(q => q.status === 'pendente').length,
        processados: data.filter(q => q.status === 'processado').length
      };
      
      setEstatisticas(stats);
      
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      showMessage('error', 'Erro ao carregar questionários');
    } finally {
      setLoading(false);
    }
  };

  const loadPerguntas = async (questionarioId) => {
    try {
      const perguntasData = await ebdService.buscarPerguntas(questionarioId);
      setPerguntas(perguntasData);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      showMessage('error', 'Erro ao carregar perguntas do questionário');
    }
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================
  
  // Cabeçalho com Estatísticas
  const HeaderStats = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="mr-3 h-6 w-6" />
            Questionários EBD
          </h2>
          <p className="text-gray-600">
            Gestão de questionários da Escola Bíblica Dominical
          </p>
        </div>
        <button
          onClick={() => {
            setEditingQuestionario(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Questionário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total de Questionários</p>
              <p className="text-2xl font-bold text-blue-900">{estatisticas.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Ativos</p>
              <p className="text-2xl font-bold text-green-900">{estatisticas.ativos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-900">{estatisticas.pendentes}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Processados</p>
              <p className="text-2xl font-bold text-purple-900">{estatisticas.processados}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Barra de Filtros
  const FilterBar = () => {
    const anosDisponiveis = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anosDisponiveis.push(i);
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar questionários por título ou período..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="processado">Processado</option>
              <option value="inativo">Inativo</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFiltroAno(new Date().getFullYear());
                setFiltroStatus('todos');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Card de Questionário
  const QuestionarioCard = ({ questionario }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {questionario.titulo}
          </h3>
          {questionario.subtitulo && (
            <p className="text-gray-600 mt-1">{questionario.subtitulo}</p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            {questionario.periodo && (
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {questionario.periodo}
              </span>
            )}
            {questionario.total_licoes && (
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {questionario.total_licoes} lições
              </span>
            )}
            {questionario.ano && (
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Ano {questionario.ano}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            questionario.status === 'ativo' 
              ? 'bg-green-100 text-green-800' 
              : questionario.status === 'processado'
              ? 'bg-blue-100 text-blue-800'
              : questionario.status === 'pendente'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {questionario.status || 'pendente'}
          </span>
        </div>
      </div>

      {/* Informações do período */}
      {(questionario.data_inicio || questionario.data_fim) && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <p className="text-gray-700">
            <strong>Período:</strong> 
            {questionario.data_inicio && ` ${utils.formatDate(questionario.data_inicio)}`}
            {questionario.data_fim && ` até ${utils.formatDate(questionario.data_fim)}`}
          </p>
        </div>
      )}

      {/* Arquivo PDF associado */}
      {questionario.arquivos && (
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-blue-800">
                <strong>Arquivo:</strong> {questionario.arquivos.nome_original}
              </span>
            </div>
            <span className="text-xs text-blue-600">
              {Math.round(questionario.arquivos.tamanho_bytes / 1024)} KB
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-xs text-gray-500">
          Criado em {utils.formatDate(questionario.created_at)}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewingQuestionario(questionario);
              loadPerguntas(questionario.id);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Visualizar perguntas"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditingQuestionario(questionario);
              setShowModal(true);
            }}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleExportQuestionario(questionario)}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="Exportar"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteQuestionario(questionario)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de Visualização de Perguntas
  const ViewModal = () => {
    if (!viewingQuestionario) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {viewingQuestionario.titulo}
                </h3>
                <p className="text-gray-600 mt-1">
                  {viewingQuestionario.subtitulo || 'Visualização de perguntas'}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingQuestionario(null);
                  setPerguntas([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {perguntas.length > 0 ? (
              <div className="space-y-4">
                {perguntas.map((pergunta, index) => (
                  <div key={pergunta.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-600">
                        Lição {pergunta.numero_licao} - Pergunta {pergunta.numero_pergunta}
                      </span>
                      {pergunta.categoria && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {pergunta.categoria}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 mb-3">{pergunta.texto_pergunta}</p>
                    
                    {pergunta.perguntas_respostas && pergunta.perguntas_respostas.length > 0 && (
                      <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                        <p className="text-sm font-medium text-green-800 mb-1">Resposta:</p>
                        <p className="text-sm text-green-700">
                          {pergunta.perguntas_respostas[0].texto_resposta}
                        </p>
                        {pergunta.perguntas_respostas[0].versiculo_referencia && (
                          <p className="text-xs text-green-600 mt-1 italic">
                            Referência: {pergunta.perguntas_respostas[0].versiculo_referencia}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma pergunta encontrada
                </h3>
                <p className="text-gray-600">
                  Este questionário ainda não possui perguntas cadastradas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // 🔧 FUNÇÕES DE AÇÃO
  // =============================================================================
  
  const handleExportQuestionario = async (questionario) => {
    try {
      showMessage('info', 'Funcionalidade de exportação será implementada em breve');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showMessage('error', 'Erro ao exportar questionário');
    }
  };

  const handleDeleteQuestionario = async (questionario) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${questionario.titulo}"?`)) {
      return;
    }

    try {
      showMessage('info', 'Funcionalidade de exclusão será implementada em breve');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      showMessage('error', 'Erro ao excluir questionário');
    }
  };

  // =============================================================================
  // 🏗️ RENDER PRINCIPAL
  // =============================================================================
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando questionários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderStats />
      <FilterBar />
      
      {/* Lista de Questionários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {questionarios.map(questionario => (
          <QuestionarioCard key={questionario.id} questionario={questionario} />
        ))}
      </div>

      {questionarios.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum questionário encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filtroStatus !== 'todos' || filtroAno !== 'todos'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando o primeiro questionário EBD'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Criar Primeiro Questionário
          </button>
        </div>
      )}

      {/* Modal de Visualização */}
      <ViewModal />

      {/* Modal de Edição (placeholder) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestionario ? 'Editar Questionário' : 'Novo Questionário'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              📊 Formulário completo será implementado na próxima versão
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingQuestionario(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingQuestionario(null);
                  showMessage('info', 'Formulário será implementado em breve');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionariosComponent;
