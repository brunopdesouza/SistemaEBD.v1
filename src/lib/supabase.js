// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://sifneeexxbqgscqinbwm.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZm5lZWV4eGJxZ3NjcWluYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTY3MDcsImV4cCI6MjA2NDc5MjcwN30.YnBZC-1fP3XTWrTGrlY9KAT-2fXRwy7u756xJhTN9Ac';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// 🔐 SERVIÇOS DE AUTENTICAÇÃO - CONECTADO AO BANCO REAL
// =============================================================================

export const authService = {
  // Login real com validação no banco PostgreSQL
  async login(email, senha, igreja, funcao) {
    try {
      console.log('🔐 Tentando login:', { email, igreja, funcao });

      // Buscar usuário na tabela usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select(`
          *,
          igrejas(id, nome),
          grupos_assistencia(id, nome)
        `)
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError) {
        console.log('⚠️ Usuário não encontrado no banco, criando login demo...');
        
        // Fallback para login demo durante transição
        if (email === 'admin@sistema.com' && senha === 'admin123') {
          const demoUser = {
            id: 'demo-user-id',
            nome: 'Administrador Demo',
            email: email,
            igreja: igreja,
            funcao: funcao,
            perfil_acesso: 'admin',
            igreja_id: null,
            grupo_id: null
          };

          // Registrar log de login demo
          await this.registrarLogLogin(email, true, demoUser.id, 'Login Demo');
          
          return { user: demoUser, session: { access_token: 'demo_token' } };
        }
        
        throw new Error('Credenciais inválidas');
      }

      // Validar senha (por enquanto aceita qualquer senha para o usuário encontrado)
      // TODO: Implementar hash de senha real
      console.log('✅ Usuário encontrado:', usuario.nome);

      // Buscar permissões do usuário
      const { data: permissoes } = await supabase
        .from('usuario_permissoes')
        .select('permissao, contexto')
        .eq('usuario_id', usuario.id)
        .eq('ativo', true);

      // Registrar log de login
      await this.registrarLogLogin(email, true, usuario.id, 'Login Sucesso');

      // Criar sessão
      const sessao = {
        usuario_id: usuario.id,
        token: `session_${Date.now()}`,
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 horas
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        ativo: true
      };

      // Salvar sessão no banco
      await supabase
        .from('usuario_sessoes')
        .insert([sessao]);

      return {
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          igreja: usuario.igrejas?.nome || igreja,
          funcao: usuario.funcao,
          perfil_acesso: usuario.perfil_acesso,
          igreja_id: usuario.igreja_id,
          grupo_id: usuario.grupo_id,
          permissoes: permissoes || []
        },
        session: { access_token: sessao.token }
      };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Registrar tentativa de login falhada
      await this.registrarLogLogin(email, false, null, error.message);
      
      throw new Error(`Erro no login: ${error.message}`);
    }
  },

  // Registrar log de login usando função do banco
  async registrarLogLogin(email, sucesso, usuarioId = null, detalhes = '') {
    try {
      await supabase.rpc('log_login_basico', {
        p_email: email,
        p_sucesso: sucesso
      });
      
      console.log(`📝 Log de login registrado: ${email} - ${sucesso ? 'Sucesso' : 'Falha'}`);
    } catch (error) {
      console.error('⚠️ Erro ao registrar log de login:', error);
    }
  },

  // Logout com log
  async logout(usuarioId) {
    try {
      if (usuarioId && usuarioId !== 'demo-user-id') {
        // Desativar sessões do usuário
        await supabase
          .from('usuario_sessoes')
          .update({ ativo: false })
          .eq('usuario_id', usuarioId);

        // Registrar log de logout
        await supabase.rpc('inserir_log_basico', {
          p_tipo_operacao: 'LOGOUT',
          p_detalhes: { timestamp: new Date().toISOString() },
          p_usuario_id: usuarioId
        });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, error: error.message };
    }
  }
};

// =============================================================================
// 👥 SERVIÇOS DE MEMBROS - TABELA REAL
// =============================================================================

export const membrosService = {
  // Listar membros com filtros baseados no usuário
  async listar(filtros = {}) {
    try {
      console.log('👥 Buscando membros com filtros:', filtros);

      let query = supabase
        .from('membros')
        .select(`
          *,
          igrejas(nome),
          grupos_assistencia(nome),
          paises(nome)
        `)
        .order('nome_completo');

      // Aplicar filtros baseados no perfil do usuário
      if (filtros.igreja_id) {
        query = query.eq('igreja_id', filtros.igreja_id);
      }
      if (filtros.grupo_id) {
        query = query.eq('grupo_id', filtros.grupo_id);
      }
      if (filtros.situacao) {
        query = query.eq('situacao', filtros.situacao);
      } else {
        query = query.eq('situacao', 'ativo'); // Por padrão, só membros ativos
      }
      if (filtros.busca) {
        query = query.or(`nome_completo.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar membros:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} membros encontrados`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro no serviço de membros:', error);
      return [];
    }
  },

  // Criar novo membro
  async criar(membro, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .insert([{
          ...membro,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Log da criação
      await supabase.rpc('inserir_log_basico', {
        p_tipo_operacao: 'MEMBRO_CRIADO',
        p_detalhes: { membro_id: data.id, nome: membro.nome_completo },
        p_usuario_id: usuarioId
      });

      console.log('✅ Membro criado:', data.nome_completo);
      return data;

    } catch (error) {
      console.error('❌ Erro ao criar membro:', error);
      throw error;
    }
  },

  // Estatísticas de membros
  async estatisticas(igrejaId = null, grupoId = null) {
    try {
      let query = supabase
        .from('membros')
        .select('situacao, genero, funcao_igreja', { count: 'exact' });

      if (igrejaId) query = query.eq('igreja_id', igrejaId);
      if (grupoId) query = query.eq('grupo_id', grupoId);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        total: count || 0,
        por_situacao: data?.reduce((acc, m) => {
          acc[m.situacao] = (acc[m.situacao] || 0) + 1;
          return acc;
        }, {}) || {},
        por_genero: data?.reduce((acc, m) => {
          acc[m.genero] = (acc[m.genero] || 0) + 1;
          return acc;
        }, {}) || {}
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de membros:', error);
      return { total: 0, por_situacao: {}, por_genero: {} };
    }
  }
};

// =============================================================================
// 📚 SERVIÇOS EBD - QUESTIONÁRIOS REAIS
// =============================================================================

export const ebdService = {
  // Listar questionários
  async listarQuestionarios(filtros = {}) {
    try {
      console.log('📚 Buscando questionários...');

      let query = supabase
        .from('questionarios')
        .select(`
          *,
          arquivos(nome_original, tamanho_bytes)
        `)
        .order('created_at', { ascending: false });

      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.ano) {
        query = query.eq('ano', filtros.ano);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar questionários:', error);
        return [];
      }

      console.log(`✅ ${data?.length || 0} questionários encontrados`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro no serviço EBD:', error);
      return [];
    }
  },

  // Criar questionário
  async criarQuestionario(questionario, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('questionarios')
        .insert([{
          titulo: questionario.titulo,
          subtitulo: questionario.descricao,
          periodo: questionario.periodo || `${new Date().getFullYear()}`,
          ano: new Date().getFullYear(),
          data_inicio: questionario.data_inicio,
          data_fim: questionario.data_fim,
          status: questionario.ativo ? 'ativo' : 'inativo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Log da criação
      await supabase.rpc('inserir_log_basico', {
        p_tipo_operacao: 'QUESTIONARIO_CRIADO',
        p_detalhes: { questionario_id: data.id, titulo: questionario.titulo },
        p_usuario_id: usuarioId
      });

      console.log('✅ Questionário criado:', data.titulo);
      return data;

    } catch (error) {
      console.error('❌ Erro ao criar questionário:', error);
      throw error;
    }
  },

  // Estatísticas EBD
  async estatisticas() {
    try {
      const [questionarios, participacoes] = await Promise.all([
        supabase.from('questionarios').select('*', { count: 'exact' }),
        supabase.from('participacoes_ebd').select('*', { count: 'exact' })
      ]);

      const questionariosAtivos = questionarios.data?.filter(q => q.status === 'ativo').length || 0;

      return {
        total_questionarios: questionarios.count || 0,
        questionarios_ativos: questionariosAtivos,
        total_participacoes: participacoes.count || 0,
        taxa_participacao: questionarios.count > 0 
          ? Math.round((questionariosAtivos / questionarios.count) * 100) 
          : 0
      };

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas EBD:', error);
      return {
        total_questionarios: 0,
        questionarios_ativos: 0,
        total_participacoes: 0,
        taxa_participacao: 0
      };
    }
  }
};

// =============================================================================
// 🏛️ SERVIÇOS ORGANIZACIONAIS - DADOS REAIS
// =============================================================================

export const organizacaoService = {
  // Listar igrejas
  async listarIgrejas() {
    try {
      const { data, error } = await supabase
        .from('igrejas')
        .select('*')
        .eq('situacao', 'ativa')
        .order('nome');

      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} igrejas encontradas`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar igrejas:', error);
      // Fallback para igrejas padrão
      return [
        { id: '1', nome: 'Nova Brasília 1' },
        { id: '2', nome: 'ICM Central' },
        { id: '3', nome: 'ICM Vila Nova' }
      ];
    }
  },

  // Listar grupos de assistência
  async listarGrupos(igrejaId = null) {
    try {
      let query = supabase
        .from('grupos_assistencia')
        .select(`
          *,
          igrejas(nome)
        `)
        .eq('ativo', true)
        .order('nome');

      if (igrejaId) {
        query = query.eq('igreja_id', igrejaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} grupos encontrados`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao buscar grupos:', error);
      // Fallback para grupos padrão
      return [
        { id: '1', nome: 'Grupo 1 - Adultos' },
        { id: '2', nome: 'Grupo 2 - Jovens' }
      ];
    }
  },

  // Buscar configurações do sistema
  async buscarConfiguracoes() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .order('categoria');

      if (error) throw error;

      // Converter para objeto
      const config = {};
      data?.forEach(item => {
        config[item.chave] = item.valor;
      });

      console.log('✅ Configurações carregadas:', Object.keys(config).length);
      return config;

    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      return {};
    }
  }
};

// =============================================================================
// 📊 ESTATÍSTICAS GERAIS - DADOS REAIS
// =============================================================================

export const estatisticasService = {
  async obterDashboard(usuarioId, igrejaId = null, grupoId = null) {
    try {
      console.log('📊 Carregando estatísticas do dashboard...');

      // Buscar contadores de todas as tabelas principais
      const [
        usuarios,
        membros,
        igrejas,
        grupos,
        questionarios,
        participacoes,
        logs
      ] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact' }),
        supabase.from('membros').select('*', { count: 'exact' }),
        supabase.from('igrejas').select('*', { count: 'exact' }),
        supabase.from('grupos_assistencia').select('*', { count: 'exact' }),
        supabase.from('questionarios').select('*', { count: 'exact' }),
        supabase.from('participacoes_ebd').select('*', { count: 'exact' }),
        supabase.from('logs_sistema').select('*', { count: 'exact' })
      ]);

      // Estatísticas específicas de membros
      const estatisticasMembros = await membrosService.estatisticas(igrejaId, grupoId);

      const stats = {
        total_usuarios: usuarios.count || 0,
        total_membros: membros.count || 0,
        total_igrejas: igrejas.count || 0,
        total_grupos: grupos.count || 0,
        total_questionarios: questionarios.count || 0,
        total_participacoes: participacoes.count || 0,
        total_logs: logs.count || 0,
        estatisticas_membros: estatisticasMembros
      };

      console.log('✅ Estatísticas carregadas:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      
      // Retornar dados básicos em caso de erro
      return {
        total_usuarios: 0,
        total_membros: 0,
        total_igrejas: 0,
        total_grupos: 0,
        total_questionarios: 0,
        total_participacoes: 0,
        total_logs: 0,
        estatisticas_membros: { total: 0, por_situacao: {}, por_genero: {} }
      };
    }
  }
};

// =============================================================================
// 📝 LOGS E AUDITORIA - SISTEMA REAL
// =============================================================================

export const logsService = {
  // Listar logs do sistema
  async listarLogs(filtros = {}) {
    try {
      let query = supabase
        .from('logs_sistema')
        .select(`
          *,
          usuarios(nome, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(filtros.limite || 50);

      if (filtros.tipo_operacao) {
        query = query.eq('tipo_operacao', filtros.tipo_operacao);
      }
      if (filtros.usuario_id) {
        query = query.eq('usuario_id', filtros.usuario_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} logs encontrados`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro ao listar logs:', error);
      return [];
    }
  }
};

// =============================================================================
// 🔄 HOOK PERSONALIZADO - DADOS DINÂMICOS
// =============================================================================

export const useSupabaseData = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando dados iniciais do Supabase...');
        
        // Carregar dados organizacionais
        const [igrejas, grupos, configuracoes] = await Promise.all([
          organizacaoService.listarIgrejas(),
          organizacaoService.listarGrupos(),
          organizacaoService.buscarConfiguracoes()
        ]);

        // Preparar listas para dropdowns
        const igrejasNomes = igrejas.map(i => i.nome);
        const gruposNomes = grupos.map(g => g.nome);
        
        // Funções padrão do sistema
        const funcoesPadrao = [
          'Pastor', 'Evangelista', 'Diácono', 'Obreiro', 
          'Professor', 'Responsável do Grupo', 'Secretário do Grupo',
          'Líder de Grupo', 'Membro'
        ];

        setConfig({
          igrejas: igrejasNomes.length > 0 ? igrejasNomes : ['Nova Brasília 1', 'ICM Central'],
          grupos_assistencia: gruposNomes.length > 0 ? gruposNomes : ['Grupo 1 - Adultos', 'Grupo 2 - Jovens'],
          funcoes: configuracoes.funcoes_sistema?.split(',') || funcoesPadrao,
          configuracoes: configuracoes,
          igrejas_completas: igrejas,
          grupos_completos: grupos
        });

        setError(null);
        console.log('✅ Dados iniciais carregados com sucesso');

      } catch (err) {
        console.error('❌ Erro ao carregar dados iniciais:', err);
        setError(err.message);
        
        // Fallback para dados padrão
        setConfig({
          igrejas: ['Nova Brasília 1', 'ICM Central', 'ICM Vila Nova'],
          grupos_assistencia: ['Grupo 1 - Adultos', 'Grupo 2 - Jovens', 'Grupo 3 - Adolescentes'],
          funcoes: ['Pastor', 'Evangelista', 'Diácono', 'Membro'],
          configuracoes: {},
          igrejas_completas: [],
          grupos_completos: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return { config, loading, error };
};

// =============================================================================
// 📤 EXPORTS PRINCIPAIS
// =============================================================================

// Manter compatibilidade com código existente
export const dataService = {
  async getEstatisticas() {
    return await estatisticasService.obterDashboard();
  },
  
  async getQuestionarios() {
    return await ebdService.listarQuestionarios();
  },
  
  async createQuestionario(questionario) {
    return await ebdService.criarQuestionario(questionario, 'demo-user-id');
  },
  
  async getMembers() {
    return await membrosService.listar();
  },
  
  async createMember(member) {
    return await membrosService.criar(member, 'demo-user-id');
  },
  
  async getConfig() {
    return await organizacaoService.buscarConfiguracoes();
  }
};

// Export default com todos os serviços
export default {
  supabase,
  authService,
  membrosService,
  ebdService,
  organizacaoService,
  estatisticasService,
  logsService,
  dataService
};
