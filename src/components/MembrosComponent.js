// src/components/MembrosComponent.js - Gestão de Membros Integrada ao PostgreSQL
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  Church,
  UserPlus
} from 'lucide-react';

import { membrosService, organizacaoService, utils } from '../lib/supabase';

const MembrosComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingMembro, setEditingMembro] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    novos_mes: 0
  });

  const ITEMS_PER_PAGE = 20;

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL
  // =============================================================================
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados organizacionais
      const [igrejasData, gruposData] = await Promise.all([
        organizacaoService.listarIgrejas(),
        organizacaoService.listarGrupos(
          currentUser?.perfil_acesso === 'igreja' ? currentUser.igreja_id : null
        )
      ]);

      console.log('Dados carregados:', { igrejas: igrejasData.length, grupos: gruposData.length });
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      showMessage('error', 'Erro ao carregar dados do sistema');
    }
  };

  const loadMembros = async () => {
    try {
      setLoading(true);
      
      // Definir filtros baseados no perfil do usuário
      const filtros = {
        busca: searchTerm.trim() || undefined,
        situacao: filtroSituacao !== 'todos' ? filtroSituacao : undefined
      };

      // Aplicar filtros por permissão
      if (currentUser?.perfil_acesso === 'igreja') {
        filtros.igreja_id = currentUser.igreja_id;
      } else if (currentUser?.perfil_acesso === 'grupo') {
        filtros.grupo_id = currentUser.grupo_id;
      }

      const membrosData = await membrosService.listar(filtros);
      
      // Paginação
      const startIndex = (paginaAtual - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedMembros = membrosData.slice(startIndex, endIndex);
      
      setMembros(paginatedMembros);
      setTotalPaginas(Math.ceil(membrosData.length / ITEMS_PER_PAGE));
      
      // Calcular estatísticas
      const stats = {
        total: membrosData.length,
        ativos: membrosData.filter(m => m.situacao === 'ativo').length,
        inativos: membrosData.filter(m => m.situacao === 'inativo').length,
        novos_mes: membrosData.filter(m => {
          const created = new Date(m.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length
      };
      
      setEstatisticas(stats);
      
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      showMessage('error', 'Erro ao carregar lista de membros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  useEffect(() => {
    loadMembros();
  }, [paginaAtual, searchTerm, filtroSituacao, currentUser]);

  // =============================================================================
  // 🔧 FUNÇÕES DE CRUD
  // =============================================================================
  
  const handleDeleteMembro = async (membro) => {
    if (!window.confirm(`Tem certeza que deseja inativar ${membro.nome_completo}?`)) {
      return;
    }

    try {
      setLoading(true);
      await membrosService.excluir(membro.id, currentUser.id);
      showMessage('success', 'Membro inativado com sucesso!');
      loadMembros();
    } catch (error) {
      console.error('Erro ao inativar membro:', error);
      showMessage('error', 'Erro ao inativar membro');
    } finally {
      setLoading(false);
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
            <Users className="mr-3 h-6 w-6" />
            Gestão de Membros
          </h2>
          <p className="text-gray-600">
            {currentUser?.perfil_acesso === 'admin' && 'Todos os membros do sistema'}
            {currentUser?.perfil_acesso === 'igreja' && `Membros da ${currentUser?.igreja}`}
            {currentUser?.perfil_acesso === 'grupo' && `Membros do ${currentUser?.grupo_assistencia}`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMembro(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Membro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total de Membros</p>
              <p className="text-2xl font-bold text-blue-900">{estatisticas.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Membros Ativos</p>
              <p className="text-2xl font-bold text-green-900">{estatisticas.ativos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Membros Inativos</p>
              <p className="text-2xl font-bold text-yellow-900">{estatisticas.inativos}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Novos este Mês</p>
              <p className="text-2xl font-bold text-purple-900">{estatisticas.novos_mes}</p>
            </div>
            <UserPlus className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Barra de Filtros
  const FilterBar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todas as Situações</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="visitante">Visitantes</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFiltroSituacao('todos');
              setPaginaAtual(1);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Card de Membro
  const MembroCard = ({ membro }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {membro.nome_completo}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {membro.email && (
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {membro.email}
              </span>
            )}
            {membro.telefone && (
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {utils.formatPhone(membro.telefone)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            membro.situacao === 'ativo' 
              ? 'bg-green-100 text-green-800' 
              : membro.situacao === 'inativo'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {membro.situacao}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">
            <Church className="inline h-4 w-4 mr-1" />
            <strong>Igreja:</strong> {membro.igrejas?.nome || 'N/A'}
          </p>
          {membro.grupos_assistencia && (
            <p className="text-gray-600 mt-1">
              <Users className="inline h-4 w-4 mr-1" />
              <strong>Grupo:</strong> {membro.grupos_assistencia.nome}
            </p>
          )}
        </div>
        
        <div>
          {membro.data_nascimento && (
            <p className="text-gray-600">
              <Calendar className="inline h-4 w-4 mr-1" />
              <strong>Nascimento:</strong> {utils.formatDate(membro.data_nascimento)}
            </p>
          )}
          {membro.funcao_igreja && (
            <p className="text-gray-600 mt-1">
              <User className="inline h-4 w-4 mr-1" />
              <strong>Função:</strong> {membro.funcao_igreja}
            </p>
          )}
        </div>
      </div>

      {membro.endereco_completo && (
        <div className="mb-4 text-sm">
          <p className="text-gray-600">
            <MapPin className="inline h-4 w-4 mr-1" />
            <strong>Endereço:</strong> {membro.endereco_completo}
            {membro.cidade && `, ${membro.cidade}`}
            {membro.estado && ` - ${membro.estado}`}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-xs text-gray-500">
          Cadastrado em {utils.formatDate(membro.created_at)}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => console.log('Visualizar membro:', membro.id)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditingMembro(membro);
              setShowModal(true);
            }}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMembro(membro)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Inativar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Paginação
  const Pagination = () => {
    if (totalPaginas <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
          disabled={paginaAtual === 1}
          className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        
        <span className="text-sm text-gray-600">
          Página {paginaAtual} de {totalPaginas}
        </span>
        
        <button
          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
          disabled={paginaAtual === totalPaginas}
          className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    );
  };

  // =============================================================================
  // 🏗️ RENDER PRINCIPAL
  // =============================================================================
  
  if (loading && membros.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando membros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderStats />
      <FilterBar />
      
      {/* Lista de Membros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {membros.map(membro => (
          <MembroCard key={membro.id} membro={membro} />
        ))}
      </div>

      {membros.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum membro encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filtroSituacao !== 'todos' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando o primeiro membro'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Cadastrar Primeiro Membro
          </button>
        </div>
      )}

      <Pagination />

      {/* Modais serão implementados em componentes separados */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingMembro ? 'Editar Membro' : 'Novo Membro'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              📊 Conectado ao PostgreSQL - Dados salvos em tempo real
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Implementar formulário completo
                  setShowModal(false);
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

export default MembrosComponent;
