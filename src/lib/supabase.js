// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Serviços de dados
export const dataService = {
  // Estatísticas
  async getEstatisticas() {
    try {
      const { data, error } = await supabase
        .from('estatisticas')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Retornar dados demo se der erro
      return {
        total_usuarios: 1,
        total_membros: 16, // Baseado na Nova Brasília 1
        total_igrejas: 6,
        total_grupos: 7
      };
    }
  },

  // Questionários
  async getQuestionarios() {
    try {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar questionários:', error);
      return [];
    }
  },

  async createQuestionario(questionario) {
    try {
      const { data, error } = await supabase
        .from('questionarios')
        .insert([questionario])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar questionário:', error);
      throw error;
    }
  },

  // Perfis
  async createProfile(profile) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([profile])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  },

  // Membros
  async getMembers() {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      return [];
    }
  },

  async createMember(member) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .insert([member])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      throw error;
    }
  },

  async bulkInsertMembers(members) {
    try {
      const { data, error } = await supabase
        .from('membros')
        .insert(members)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao inserir membros em lote:', error);
      throw error;
    }
  },

  // Configurações
  async getConfig() {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*');
      
      if (error) throw error;
      
      // Transformar array em objeto
      const config = {};
      data?.forEach(item => {
        config[item.chave] = item.valor;
      });
      
      return config;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {};
    }
  }
};

// Hook para dados do Supabase
export const useSupabaseData = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await dataService.getConfig();
        setConfig({
          igrejas: configData.igrejas || [
            'ICM Central',
            'ICM Vila Nova', 
            'ICM Jardim das Flores',
            'ICM Centro',
            'ICM Bairro Alto',
            'Nova Brasília 1'
          ],
          funcoes: configData.funcoes || [
            'Pastor',
            'Evangelista',
            'Diácono', 
            'Obreiro',
            'Professor',
            'Responsável do Grupo',
            'Secretário do Grupo',
            'Líder de Grupo',
            'Membro'
          ],
          grupos_assistencia: configData.grupos_assistencia || [
            'Grupo 1 - Adultos',
            'Grupo 2 - Jovens',
            'Grupo 3 - Adolescentes', 
            'Grupo 4 - Crianças',
            'Grupo 5 - Terceira Idade',
            'Grupo 6 - Casais',
            'Grupo 7 - Solteiros'
          ]
        });
      } catch (error) {
        console.error('Erro carregando configurações:', error);
        // Usar valores padrão se der erro
        setConfig({
          igrejas: ['Nova Brasília 1', 'ICM Central'],
          funcoes: ['Pastor', 'Membro'],
          grupos_assistencia: ['Grupo 1 - Adultos', 'Grupo 2 - Jovens']
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading };
};
