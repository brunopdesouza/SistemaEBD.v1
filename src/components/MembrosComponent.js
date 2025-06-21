// src/components/MembrosComponent.js
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  User,
  Church,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';

// Import dos serviços
import { membrosService, organizacaoService } from '../lib/supabase';

const MembrosComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: '',
    situacao: 'ativo',
    igreja_id: null,
    grupo_id: null
  });
  const [igrejas, setIgrejas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    por_situacao: {},
    por_genero: {}
  });

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL
  // =============================================================================
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados organizacionais
        const [igrejasData, gruposData] = await Promise.all([
          organizacaoService.listarIgrejas(),
          organizacaoService.listarGrupos()
        ]);
        
        setIgrejas(igrejasData);
        setGrupos(gruposData);
        
        // Definir filtros baseados no usuário
        const filtrosUsuario = {
          busca: '',
          situacao: 'ativo'
        };
        
        // Aplicar filtros baseados no perfil do usuário
        if (currentUser?.perfil_acesso === 'igreja' && currentUser?.igreja_id) {
          filtrosUsuario.igreja_id = currentUser.igreja_id;
        }
        if (currentUser?.perfil_acesso === 'grupo' && currentUser?.grupo_id) {
          filtrosUsuario.grupo_id = currentUser.grupo_id;
        }
        
        setFiltros(filtrosUsuario);
        
        // Carregar membros
        await loadMembros(filtrosUsuario);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showMessage('error', 'Erro ao carregar dados dos membros');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // =============================================================================
  // 📊 CARREGAMENTO DE MEMBROS
  // =============================================================================
  
  const loadMembros = async (filtrosPersonalizados = null) => {
    try {
      const filtrosAtivos = filtrosPersonalizados || filtros;
      
      console.log('🔍 Carregando membros com filtros:', filtrosAtivos);
      
      // Buscar membros
      const membrosData = await membrosService.listar(filtrosAtivos);
      setMembros(membrosData);
      
      // Buscar estatísticas
      const statsData = await membrosService.estatisticas(
        filtrosAtivos.igreja_id,
        filtrosAtivos.grupo_id
      );
      setEstatisticas(statsData);
      
      console.log(`✅ ${membrosData.length} membros carregados`);
      
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      showMessage('error', 'Erro ao carregar lista de membros');
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    loadMembros(filtros);
  };

  // Limpar filtros
  const limparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      situacao: 'ativo',
      igreja_id: currentUser?.perfil_acesso === 'igreja' ? currentUser?.igreja_id : null,
      grupo_id: currentUser?.perfil_acesso === 'grupo' ? currentUser?.grupo_id : null
    };
    setFiltros(filtrosLimpos);
    loadMembros(filtrosLimpos);
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================
  
  // Barra de filtros
  const BarraFiltros = () => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={filtros.busca}
            onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Situação */}
        <select
          value={filtros.situacao}
          onChange={(e) => setFiltros({...filtros, situacao: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas as situações</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="transferido">Transferido</option>
        </select>

        {/* Igreja (se admin) */}
        {currentUser?.perfil_acesso === 'admin' && (
          <select
            value={filtros.igreja_id || ''}
            onChange={(e) => setFiltros({...filtros, igreja_id: e.target.value || null})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as igrejas</option>
            {igrejas.map(igreja => (
              <option key={igreja.id} value={igreja.id}>{igreja.nome}</option>
            ))}
          </select>
        )}

        {/* Grupo (se admin ou igreja) */}
        {(currentUser?.perfil_acesso === 'admin' || currentUser?.perfil_acesso === 'igreja') && (
          <select
            value={filtros.grupo_id || ''}
            onChange={(e) => setFiltros({...filtros, grupo_id: e.target.value || null})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os grupos</option>
            {grupos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
            ))}
          </select>
        )}
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
            setMembroSelecionado(null);
            setModoEdicao(false);
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Membro
        </button>
      </div>
    </div>
  );

  // Cards de estatísticas
  const CardsEstatisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Membros</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Membros Ativos</p>
            <p className="text-2xl font-bold text-gray-800">
              {estatisticas.por_situacao?.ativo || 0}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Por Igreja/Grupo</p>
            <p className="text-2xl font-bold text-gray-800">
              {currentUser?.igreja || 'Todas'}
            </p>
          </div>
          <Church className="h-8 w-8 text-purple-500" />
        </div>
      </div>
    </div>
  );

  // Lista de membros
  const ListaMembros = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span>Carregando membros...</span>
          </div>
        </div>
      );
    }

    if (membros.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
          <p className="text-gray-600 mb-4">
            {filtros.busca ? 'Tente ajustar os filtros de busca' : 'Nenhum membro cadastrado ainda'}
          </p>
          <button
            onClick={() => {
              setMembroSelecionado(null);
              setModoEdicao(false);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Cadastrar Primeiro Membro
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            Lista de Membros ({membros.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {membros.map(membro => (
            <div key={membro.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                {/* Informações do membro */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {membro.nome_completo}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {membro.funcao_igreja || 'Membro'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                    {/* Contato */}
                    <div className="space-y-1">
                      {membro.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{membro.email}</span>
                        </div>
                      )}
                      {membro.celular && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{membro.celular}</span>
                        </div>
                      )}
                    </div>

                    {/* Localização */}
                    <div className="space-y-1">
                      {membro.igrejas?.nome && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Church className="h-4 w-4 mr-2" />
                          <span>{membro.igrejas.nome}</span>
                        </div>
                      )}
                      {membro.grupos_assistencia?.nome && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{membro.grupos_assistencia.nome}</span>
                        </div>
                      )}
                    </div>

                    {/* Dados pessoais */}
                    <div className="space-y-1">
                      {membro.data_nascimento && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(membro.data_nascimento).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      {membro.cidade && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{membro.cidade}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações e status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    membro.situacao === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : membro.situacao === 'inativo'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {membro.situacao}
                  </span>

                  <button
                    onClick={() => {
                      setMembroSelecionado(membro);
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
                      setMembroSelecionado(membro);
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
                      if (window.confirm(`Tem certeza que deseja excluir ${membro.nome_completo}?`)) {
                        // TODO: Implementar exclusão
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

  // Modal de detalhes/edição
  const ModalMembro = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {modoEdicao ? 'Editar Membro' : membroSelecionado ? 'Detalhes do Membro' : 'Novo Membro'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {membroSelecionado && !modoEdicao ? (
              // Modo visualização
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold">{membroSelecionado.nome_completo}</h4>
                  <p className="text-gray-600">{membroSelecionado.funcao_igreja || 'Membro'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Informações Pessoais</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {membroSelecionado.email || 'Não informado'}</p>
                      <p><strong>Celular:</strong> {membroSelecionado.celular || 'Não informado'}</p>
                      <p><strong>Gênero:</strong> {membroSelecionado.genero || 'Não informado'}</p>
                      <p><strong>Estado Civil:</strong> {membroSelecionado.estado_civil || 'Não informado'}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">Igreja e Grupo</h5>
                    <div className="space-y-2 text-sm">
                      <p><strong>Igreja:</strong> {membroSelecionado.igrejas?.nome || 'Não informado'}</p>
                      <p><strong>Grupo:</strong> {membroSelecionado.grupos_assistencia?.nome || 'Não informado'}</p>
                      <p><strong>Situação:</strong> {membroSelecionado.situacao}</p>
                      <p><strong>Função:</strong> {membroSelecionado.funcao_igreja || 'Membro'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setModoEdicao(true)}
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
              // Modo edição/criação
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Formulário em Desenvolvimento</h4>
                <p className="text-gray-600 mb-4">
                  O formulário de criação/edição de membros está sendo desenvolvido.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Fechar
                </button>
              </div>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">👥 Gestão de Membros</h2>
        <p className="opacity-90">
          {currentUser?.perfil_acesso === 'admin' ? 'Visão geral de todos os membros' :
           currentUser?.perfil_acesso === 'igreja' ? `Membros da ${currentUser?.igreja}` :
           `Membros do ${currentUser?.grupo_assistencia || 'seu grupo'}`}
        </p>
        <div className="mt-2 text-sm opacity-75">
          Sistema conectado ao PostgreSQL - Dados em tempo real
        </div>
      </div>

      {/* Cards de estatísticas */}
      <CardsEstatisticas />

      {/* Barra de filtros */}
      <BarraFiltros />

      {/* Lista de membros */}
      <ListaMembros />

      {/* Modal */}
      <ModalMembro />
    </div>
  );
};

export default MembrosComponent;
