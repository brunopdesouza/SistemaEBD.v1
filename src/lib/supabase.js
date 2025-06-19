// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// FUNÇÃO PARA LIMPAR NOMES DE ARQUIVO
// ============================================================
const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
    .replace(/_{2,}/g, '_') // Remove múltiplos underscores
    .replace(/^_+|_+$/g, '') // Remove underscores do início e fim
    .toLowerCase()
    .substring(0, 100) // Limita tamanho do nome
}

// ============================================================
// SERVIÇOS DE DADOS INTEGRADOS AO SEU SISTEMA ATUAL
// ============================================================

export const dataService = {
  // ============================================================
  // CONFIGURAÇÕES (para listas dropdown)
  // ============================================================
  
  async getConfig() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('chave, valor')
        .eq('publico', true)
      
      if (error) throw error
      
      // Converter para objeto
      const config = {}
      data.forEach(item => {
        config[item.chave] = JSON.parse(item.valor)
      })
      
      return config
    } catch (error) {
      console.error('Erro getConfig:', error)
      // Retornar fallback
      return {
        igrejas: ['Nova Brasília 1', 'ICM Central', 'ICM Vila Nova'],
        funcoes: ['Pastor', 'Evangelista', 'Diácono', 'Membro'],
        grupos_assistencia: ['Grupo 1 - Adultos', 'Grupo 2 - Jovens']
      }
    }
  },

  // ============================================================
  // ESTATÍSTICAS (para Dashboard)
  // ============================================================
  
  async getEstatisticas() {
    try {
      const { data, error } = await supabase
        .from('estatisticas')
        .select('*')
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro getEstatisticas:', error)
      // Retornar dados padrão
      return {
        total_usuarios: 1,
        total_membros: 3,
        total_igrejas: 6,
        total_grupos: 7,
        questionarios_ativos: 1,
        total_respostas: 2
      }
    }
  },

  // ============================================================
  // MEMBROS (para gestão)
  // ============================================================
  
  async getMembros(filters = {}) {
    let query = supabase
      .from('membros')
      .select('*')
      .eq('ativo', true)
    
    // Aplicar filtros
    if (filters.igreja) {
      query = query.eq('igreja', filters.igreja)
    }
    
    if (filters.grupo_assistencia) {
      query = query.eq('grupo_assistencia', filters.grupo_assistencia)
    }
    
    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query.order('nome')
    
    if (error) throw error
    return data
  },

  async createMembro(membro) {
    const { data, error } = await supabase
      .from('membros')
      .insert(membro)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateMembro(id, updates) {
    const { data, error } = await supabase
      .from('membros')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ============================================================
  // QUESTIONÁRIOS (integração com seu sistema atual)
  // ============================================================
  
  async getQuestionarios(filters = {}) {
    try {
      let query = supabase
        .from('questionarios')
        .select(`
          *,
          perguntas(*)
        `)
        .eq('ativo', true)
      
      if (filters.igreja) {
        query = query.eq('igreja', filters.igreja)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro getQuestionarios:', error)
      return []
    }
  },

  async createQuestionario(questionario) {
    // Criar questionário
    const { data: novoQuestionario, error: questionarioError } = await supabase
      .from('questionarios')
      .insert({
        titulo: questionario.titulo,
        descricao: questionario.descricao,
        data_inicio: questionario.data_inicio,
        data_fim: questionario.data_fim,
        grupo_target: questionario.grupo_target,
        igreja: questionario.igreja || 'Nova Brasília 1'
      })
      .select()
      .single()
    
    if (questionarioError) throw questionarioError

    // Criar perguntas se existirem
    if (questionario.perguntas && questionario.perguntas.length > 0) {
      const perguntas = questionario.perguntas.map(pergunta => ({
        questionario_id: novoQuestionario.id,
        numero: pergunta.numero || 1,
        texto: pergunta.texto,
        tipo: pergunta.tipo || 'multipla_escolha',
        opcoes: pergunta.opcoes || [],
        obrigatoria: pergunta.obrigatoria !== false
      }))

      const { error: perguntasError } = await supabase
        .from('perguntas')
        .insert(perguntas)

      if (perguntasError) throw perguntasError
    }

    return novoQuestionario
  },

  // ============================================================
  // USUÁRIOS E AUTENTICAÇÃO (simulada - integra com seu login atual)
  // ============================================================
  
  async createProfile(userData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(userData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro createProfile:', error)
      return null
    }
  },

  async getProfile(email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) return null // Usuário não existe
      return data
    } catch (error) {
      console.error('Erro getProfile:', error)
      return null
    }
  },

  // ============================================================
  // UPLOAD DE ARQUIVOS - VERSÃO CORRIGIDA
  // ============================================================
  
  async uploadFile(file, bucket = 'uploads') {
    try {
      // Limpar nome do arquivo
      const cleanFileName = sanitizeFileName(file.name)
      const fileName = `${Date.now()}_${cleanFileName}`
      
      console.log('Upload:', {
        original: file.name,
        cleaned: cleanFileName,
        final: fileName
      })
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)
      
      if (error) {
        console.error('Erro no storage upload:', error)
        throw error
      }

      // Registrar no banco
      const { data: arquivo, error: dbError } = await supabase
        .from('arquivos')
        .insert({
          nome_original: file.name,
          nome_arquivo: fileName,
          tipo_arquivo: file.type,
          tamanho_bytes: file.size,
          bucket: bucket,
          url_download: data.path
        })
        .select()
        .single()

      if (dbError) {
        console.error('Erro salvando arquivo no banco:', dbError)
        throw dbError
      }
      
      return arquivo
    } catch (error) {
      console.error('Erro completo no upload:', error)
      throw new Error(`Erro no upload: ${error.message}`)
    }
  },

  async getFileUrl(path, bucket = 'uploads') {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // ============================================================
  // JOBS DE AUTOMAÇÃO
  // ============================================================
  
  async createJob(tipo, configuracao = {}, arquivos_input = []) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          tipo,
          configuracao,
          arquivos_input
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro createJob:', error)
      throw error
    }
  },

  async updateJob(jobId, updates) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro updateJob:', error)
      throw error
    }
  },

  async getJobs(filters = {}) {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
      
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
        .order('tempo_inicio', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro getJobs:', error)
      return []
    }
  }
}

// ============================================================
// HOOK PERSONALIZADO PARA INTEGRAÇÃO FÁCIL
// ============================================================

export const useSupabaseData = () => {
  const [config, setConfig] = useState({
    igrejas: ['Nova Brasília 1'], // fallback
    funcoes: ['Pastor', 'Membro'],
    grupos_assistencia: ['Grupo 1 - Adultos']
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await dataService.getConfig()
        setConfig(configData)
      } catch (err) {
        console.error('Erro carregando configurações:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  return { config, loading, error }
}
