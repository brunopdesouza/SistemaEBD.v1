// src/lib/supabase.js - Serviços Integrados do Sistema EBD
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// =============================================================================
// 🔧 CONFIGURAÇÃO DO SUPABASE
// =============================================================================
const supabaseUrl = 'https://sifneeexxbqgscqinbwm.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZm5lZWV4eGJxZ3NjcWluYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzI0ODMsImV4cCI6MjA1MDMwODQ4M30.Xu6mLZstXqgERLBXNmGkI5nh_P5wdwFGzBCJQKCRhqY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================================================
// 🔐 SERVIÇO DE AUTENTICAÇÃO
// =============================================================================
export const authService = {
  /**
   * Realizar login com validação completa
   */
  async login(email, senha, igreja, funcao) {
    try {
      console.log('🔐 Iniciando processo de login:', { email, igreja, funcao });

      // Buscar usuário no banco real
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select(`
          id, nome, email, funcao, perfil_acesso, ativo, ultimo_login,
          igreja_id, grupo_id,
          igrejas:igreja_id(id, nome),
          grupos_assistencia:grupo_id(id, nome, responsavel)
        `)
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (userError || !usuario) {
        console.error('❌ Usuário não encontrado:', userError);
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Validar senha (temporário - implementar hash depois)
      if (usuario.senha_hash !== senha) {
        console.error('❌ Senha incorreta');
        
        // Log de tentativa de login falhada
        await this.logLoginAttempt(email, false, null, 'senha_incorreta');
        throw new Error('Senha incorreta');
      }

      // Validar igreja e função
      if (usuario.igrejas?.nome !== igreja || usuario.funcao !== funcao) {
        console.error('❌ Dados de acesso não conferem');
        throw new Error('Igreja ou função não conferem com o cadastro');
      }

      // Criar sessão
      const sessaoToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { error: sessionError } = await supabase
        .from('usuario_sessoes')
        .insert({
          usuario_id: usuario.id,
          token: sessaoToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
          last_activity: new Date().toISOString(),
          ativo: true
        });

      if (sessionError) {
        console.error('❌ Erro ao criar sessão:', sessionError);
        throw new Error('Erro interno do sistema');
      }

      // Atualizar último login
      await supabase
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', usuario.id);

      // Log de login bem-sucedido
      await this.logLoginAttempt(email, true, usuario.id, 'sucesso');

      console.log('✅ Login realizado com sucesso:', usuario.nome);

      return {
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          funcao: usuario.funcao,
          perfil_acesso: usuario.perfil_acesso,
          igreja: usuario.igrejas?.nome,
          igreja_id: usuario.igreja_id,
          grupo_id: usuario.grupo_id,
          grupo_assistencia: usuario.grupos_assistencia?.nome
        },
        session: { token: sessaoToken }
      };

    } catch (error) {
      console.error('❌ Erro no processo de login:', error);
      throw error;
    }
  },

  /**
   * Realizar logout
   */
  async logout(usuarioId) {
    try {
      if (usuarioId) {
        // Desativar todas as sessões do usuário
        await supabase
          .from('usuario_sessoes')
          .update({ ativo: false })
          .eq('usuario_id', usuarioId);

        // Log de logout
        await supabase.rpc('log_generico', {
          tipo: 'LOGOUT',
          descricao: 'Usuário realizou logout',
          usuario_id: usuarioId
        });
      }
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  },

  /**
   * Log de tentativa de login
   */
  async logLoginAttempt(email, sucesso, usuarioId = null, detalhes = '') {
    try {
      await supabase.rpc('log_tentativa_login_real', {
        email: email,
        sucesso: sucesso,
        usuario_id: usuarioId,
        ip: '127.0.0.1', // Implementar detecção real depois
        detalhes: detalhes
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa de login:', error);
    }
  }
};

// =============================================================================
// 👥 SERVIÇO DE MEMBROS
// =============================================================================
export const membrosService = {
  /**
   * Listar membros com filtros
   */
  async listar(filtros = {}) {
    try {
      let query = supabase
        .from('membros')
        .select(`
          id, nome_completo, email, telefone, celular, data_nascimento,
          genero, estado_civil, profissao, endereco_completo, cidade, estado,
          situacao, funcao_igreja, observacoes, created_at,
          igrejas:igreja_id(id, nome),
          grupos_assistencia:grupo_id(id, nome, responsavel),
          paises:pais_id(nome)
        `)
        .order('nome_completo', { ascending: true });

      // Aplicar filtros
      if (filtros.igreja_id) {
        query = query.eq('igreja_id', filtros.igreja_id);
      }
      
      if (filtros.grupo_id) {
        query = query.eq('grupo_id', filtros.grupo_id);
      }
      
      if (filtros.situacao) {
        query = query.eq('situacao', filtros.situacao);
      }
      
      if (filtros.busca) {
        query = query.or(`nome_completo.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao listar membros:', error);
        throw new Error('Erro ao carregar membros');
      }

      console.log(`✅ ${data.length} membros carregados`);
      return data;
      
    } catch (error) {
      console.error('❌ Erro no serviço de membros:', error);
      throw error;
    }
  },

  /**
   * Buscar membro por ID
   */
  async buscarPorId(id) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select(`
          *, 
          igrejas:igreja_id(nome),
          grupos_assistencia:grupo_id(nome),
          paises:pais_id(nome)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      throw error;
    }
  },

  /**
   * Criar novo membro
   */
  async criar(dadosMembro, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .insert([dadosMembro])
        .select()
        .single();

      if (error) throw error;

      // Log da operação
      await supabase.rpc('log_generico', {
        tipo: 'CADASTRO_MEMBRO',
        descricao: `Novo membro cadastrado: ${dadosMembro.nome_completo}`,
        usuario_id: usuarioId
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw error;
    }
  },

  /**
   * Atualizar membro
   */
  async atualizar(id, dadosMembro, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .update(dadosMembro)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log da operação
      await supabase.rpc('log_generico', {
        tipo: 'ALTERACAO_MEMBRO',
        descricao: `Membro atualizado: ${dadosMembro.nome_completo || 'N/A'}`,
        usuario_id: usuarioId
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      throw error;
    }
  },

  /**
   * Excluir membro (soft delete)
   */
  async excluir(id, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .update({ situacao: 'inativo' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log da operação
      await supabase.rpc('log_generico', {
        tipo: 'EXCLUSAO_MEMBRO',
        descricao: `Membro inativado: ${data.nome_completo}`,
        usuario_id: usuarioId
      });

      return data;
    } catch (error) {
      console.error('Erro ao excluir membro:', error);
      throw error;
    }
  }
};

// =============================================================================
// 📚 SERVIÇO EBD (ESCOLA BÍBLICA DOMINICAL)
// =============================================================================
export const ebdService = {
  /**
   * Listar questionários
   */
  async listarQuestionarios(filtros = {}) {
    try {
      let query = supabase
        .from('questionarios')
        .select(`
          id, titulo, subtitulo, periodo, ano, trimestre,
          data_inicio, data_fim, total_licoes, status, created_at,
          arquivos:arquivo_pdf_id(nome_original, tamanho_bytes)
        `)
        .order('created_at', { ascending: false });

      if (filtros.ano) {
        query = query.eq('ano', filtros.ano);
      }
      
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros.limite) {
        query = query.limit(filtros.limite);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar questionários:', error);
      return [];
    }
  },

  /**
   * Buscar perguntas de um questionário
   */
  async buscarPerguntas(questionarioId) {
    try {
      const { data, error } = await supabase
        .from('perguntas')
        .select(`
          id, numero_licao, numero_pergunta, texto_pergunta,
          tipo_pergunta, categoria, dificuldade, pontuacao,
          perguntas_respostas:perguntas_respostas(texto_resposta, versiculo_referencia)
        `)
        .eq('questionario_id', questionarioId)
        .eq('ativa', true)
        .order('numero_licao')
        .order('numero_pergunta');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      return [];
    }
  },

  /**
   * Registrar participação EBD
   */
  async registrarParticipacao(participacao, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('participacoes_ebd')
        .insert([participacao])
        .select()
        .single();

      if (error) throw error;

      // Log da operação
      await supabase.rpc('log_generico', {
        tipo: 'PARTICIPACAO_EBD',
        descricao: `Nova participação EBD registrada`,
        usuario_id: usuarioId
      });

      return data;
    } catch (error) {
      console.error('Erro ao registrar participação:', error);
      throw error;
    }
  }
};

// =============================================================================
// 🏛️ SERVIÇO ORGANIZACIONAL
// =============================================================================
export const organizacaoService = {
  /**
   * Listar igrejas
   */
  async listarIgrejas() {
    try {
      const { data, error } = await supabase
        .from('igrejas')
        .select('id, nome, cidade, estado, pastor_responsavel')
        .eq('situacao', 'ativa')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar igrejas:', error);
      return [];
    }
  },

  /**
   * Listar grupos de assistência
   */
  async listarGrupos(igrejaId = null) {
    try {
      let query = supabase
        .from('grupos_assistencia')
        .select('id, nome, responsavel, tipo_grupo, ativo')
        .eq('ativo', true)
        .order('nome');

      if (igrejaId) {
        query = query.eq('igreja_id', igrejaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      return [];
    }
  }
};

// =============================================================================
// 📊 SERVIÇO DE ESTATÍSTICAS
// =============================================================================
export const estatisticasService = {
  /**
   * Obter dados do dashboard
   */
  async obterDashboard(usuarioId, igrejaId = null, grupoId = null) {
    try {
      // Buscar estatísticas baseadas no perfil do usuário
      const [
        usuariosCount,
        membrosCount,
        igrejasCount,
        gruposCount,
        questionariosCount,
        participacoesCount,
        logsCount
      ] = await Promise.all([
        // Total de usuários
        supabase.from('usuarios').select('id', { count: 'exact', head: true }),
        
        // Total de membros (filtrado por permissão)
        supabase.from('membros').select('id', { 
          count: 'exact', 
          head: true 
        }).eq(igrejaId ? 'igreja_id' : 'id', igrejaId || 'not.is.null'),
        
        // Total de igrejas
        supabase.from('igrejas').select('id', { count: 'exact', head: true }),
        
        // Total de grupos
        supabase.from('grupos_assistencia').select('id', { count: 'exact', head: true }),
        
        // Total de questionários
        supabase.from('questionarios').select('id', { count: 'exact', head: true }),
        
        // Total de participações
        supabase.from('participacoes_ebd').select('id', { count: 'exact', head: true }),
        
        // Total de logs
        supabase.from('logs_sistema').select('id', { count: 'exact', head: true })
      ]);

      return {
        total_usuarios: usuariosCount.count || 0,
        total_membros: membrosCount.count || 0,
        total_igrejas: igrejasCount.count || 0,
        total_grupos: gruposCount.count || 0,
        total_questionarios: questionariosCount.count || 0,
        total_participacoes: participacoesCount.count || 0,
        total_logs: logsCount.count || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total_usuarios: 0,
        total_membros: 0,
        total_igrejas: 0,
        total_grupos: 0,
        total_questionarios: 0,
        total_participacoes: 0,
        total_logs: 0
      };
    }
  }
};

// =============================================================================
// 🔧 HOOK CUSTOMIZADO - useSupabaseData
// =============================================================================
export const useSupabaseData = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        
        // Buscar configurações do sistema
        const { data: configuracoes, error: configError } = await supabase
          .from('configuracoes')
          .select('chave, valor, tipo');

        if (configError) throw configError;

        // Organizar configurações
        const configData = {};
        configuracoes?.forEach(config => {
          try {
            // Tentar parsear JSON, senão usar valor direto
            configData[config.chave] = config.tipo === 'json' 
              ? JSON.parse(config.valor) 
              : config.valor;
          } catch {
            configData[config.chave] = config.valor;
          }
        });

        // Buscar dados dinâmicos
        const [igrejas, grupos] = await Promise.all([
          organizacaoService.listarIgrejas(),
          organizacaoService.listarGrupos()
        ]);

        setConfig({
          ...configData,
          igrejas: igrejas.map(i => i.nome),
          grupos: grupos.map(g => g.nome),
          funcoes: ['Pastor', 'Evangelista', 'Presbítero', 'Diácono', 'Membro']
        });

        setError(null);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        setError(err);
        // Fallback para dados básicos
        setConfig({
          igrejas: ['Nova Brasília 1', 'ICM Central'],
          funcoes: ['Pastor', 'Evangelista', 'Membro']
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};

// =============================================================================
// 📁 SERVIÇO DE ARQUIVOS
// =============================================================================
export const arquivosService = {
  /**
   * Upload de arquivo
   */
  async upload(file, tipo = 'geral', usuarioId) {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${tipo}/${fileName}`;

      // Upload para o storage do Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Registrar no banco
      const { data: arquivo, error: dbError } = await supabase
        .from('arquivos')
        .insert({
          nome_original: file.name,
          nome_sistema: fileName,
          caminho_arquivo: uploadData.path,
          tipo_mime: file.type,
          tamanho_bytes: file.size,
          tipo_arquivo: tipo,
          usuario_upload_id: usuarioId,
          hash_arquivo: await this.generateFileHash(file)
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return arquivo;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  },

  /**
   * Gerar hash do arquivo
   */
  async generateFileHash(file) {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return `hash_${Date.now()}`;
    }
  }
};

// =============================================================================
// 🔄 FUNÇÕES UTILITÁRIAS
// =============================================================================
export const utils = {
  /**
   * Formatar data brasileira
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  },

  /**
   * Formatar telefone brasileiro
   */
  formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  },

  /**
   * Validar CPF
   */
  validateCPF(cpf) {
    if (!cpf) return false;
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  },

  /**
   * Validar email
   */
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
};

export default supabase;
