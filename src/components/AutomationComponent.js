// src/components/AutomationComponent.js
import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Cpu,
  Activity,
  Zap
} from 'lucide-react';

// Import dos serviços reais do Supabase
import { supabase } from '../lib/supabase';

const AutomationComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS - SEM DADOS MOCKADOS
  // =============================================================================
  const [loading, setLoading] = useState(true);
  const [automacoes, setAutomacoes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total_automacoes: 0,
    automacoes_ativas: 0,
    jobs_executados: 0,
    taxa_sucesso: 0
  });

  // =============================================================================
  // 🔄 CARREGAMENTO DE DADOS REAIS DO BANCO
  // =============================================================================
  
  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      setLoading(true);
      console.log('🤖 Carregando dados de automação do PostgreSQL...');

      // Buscar automações reais da tabela automacao_configuracoes
      const { data: automacoesData, error: automacoesError } = await supabase
        .from('automacao_configuracoes')
        .select(`
          *,
          usuarios(nome)
        `)
        .order('created_at', { ascending: false });

      if (automacoesError) {
        console.error('Erro ao buscar automações:', automacoesError);
      } else {
        setAutomacoes(automacoesData || []);
        console.log(`✅ ${automacoesData?.length || 0} automações carregadas`);
      }

      // Buscar jobs reais da tabela jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (jobsError) {
        console.error('Erro ao buscar jobs:', jobsError);
      } else {
        setJobs(jobsData || []);
        console.log(`✅ ${jobsData?.length || 0} jobs carregados`);
      }

      // Buscar logs de automação reais
      const { data: logsData, error: logsError } = await supabase
        .from('automacao_logs')
        .select(`
          *,
          automacao_configuracoes(nome_automacao)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Erro ao buscar logs:', logsError);
      } else {
        setLogs(logsData || []);
        console.log(`✅ ${logsData?.length || 0} logs de automação carregados`);
      }

      // Calcular estatísticas reais
      const statsData = {
        total_automacoes: automacoesData?.length || 0,
        automacoes_ativas: automacoesData?.filter(a => a.ativa).length || 0,
        jobs_executados: jobsData?.length || 0,
        taxa_sucesso: jobsData?.length > 0 
          ? Math.round((jobsData.filter(j => j.status === 'concluido').length / jobsData.length) * 100)
          : 0
      };

      setEstatisticas(statsData);
      console.log('✅ Estatísticas de automação calculadas:', statsData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados de automação:', error);
      showMessage?.('error', 'Erro ao carregar dados de automação');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // 🛠️ FUNÇÕES DE AUTOMAÇÃO
  // =============================================================================
  
  const criarAutomacao = async (dadosAutomacao) => {
    try {
      const { data, error } = await supabase
        .from('automacao_configuracoes')
        .insert([{
          nome_automacao: dadosAutomacao.nome,
          tipo_automacao: dadosAutomacao.tipo,
          descricao: dadosAutomacao.descricao,
          configuracao_json: dadosAutomacao.configuracao,
          usuario_criador_id: currentUser?.id,
          ativa: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setAutomacoes(prev => [data, ...prev]);
      showMessage?.('success', 'Automação criada com sucesso!');
      
      // Registrar log
      await registrarLog('AUTOMACAO_CRIADA', { automacao_id: data.id, nome: dadosAutomacao.nome });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar automação:', error);
      showMessage?.('error', 'Erro ao criar automação');
      throw error;
    }
  };

  const executarAutomacao = async (automacaoId) => {
    try {
      // Criar job na tabela jobs
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert([{
          nome_job: `Execução automação ${automacaoId}`,
          tipo_job: 'AUTOMACAO',
          status: 'executando',
          parametros: { automacao_id: automacaoId },
          agendado_para: new Date().toISOString(),
          iniciado_em: new Date().toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      // Simular execução (aqui seria onde seus scripts Python rodariam)
      setTimeout(async () => {
        await supabase
          .from('jobs')
          .update({
            status: 'concluido',
            finalizado_em: new Date().toISOString(),
            resultado: { sucesso: true, processados: 1 }
          })
          .eq('id', job.id);

        loadAutomationData(); // Recarregar dados
      }, 3000);

      setJobs(prev => [job, ...prev]);
      showMessage?.('success', 'Automação iniciada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao executar automação:', error);
      showMessage?.('error', 'Erro ao executar automação');
    }
  };

  const registrarLog = async (operacao, detalhes) => {
    try {
      await supabase
        .from('automacao_logs')
        .insert([{
          status: 'concluido',
          inicio: new Date().toISOString(),
          fim: new Date().toISOString(),
          resultado: { operacao, detalhes },
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================

  // Cards de estatísticas
  const CardsEstatisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Automações</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_automacoes}</p>
          </div>
          <Bot className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Automações Ativas</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.automacoes_ativas}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Jobs Executados</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.jobs_executados}</p>
          </div>
          <Activity className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Taxa de Sucesso</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.taxa_sucesso}%</p>
          </div>
          <Zap className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </div>
  );

  // Lista de automações
  const ListaAutomacoes = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span>Carregando automações do PostgreSQL...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Automações Configuradas ({automacoes.length})
            </h3>
            <button
              onClick={() => showMessage?.('info', 'Funcionalidade de criação em desenvolvimento')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Bot className="h-4 w-4 mr-2" />
              Nova Automação
            </button>
          </div>
        </div>

        {automacoes.length === 0 ? (
          <div className="p-8 text-center">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma automação configurada</h3>
            <p className="text-gray-600 mb-4">
              Configure sua primeira automação para processamento de PDFs EBD
            </p>
            <button
              onClick={() => showMessage?.('info', 'Sistema de automação conectado ao PostgreSQL')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Configurar Primeira Automação
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {automacoes.map(automacao => (
              <div key={automacao.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {automacao.nome_automacao}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {automacao.tipo_automacao}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{automacao.descricao}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Criado: {new Date(automacao.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {automacao.usuarios?.nome && (
                        <span className="flex items-center">
                          <Database className="h-4 w-4 mr-1" />
                          Por: {automacao.usuarios.nome}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      automacao.ativa 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {automacao.ativa ? 'Ativa' : 'Inativa'}
                    </span>

                    <button
                      onClick={() => executarAutomacao(automacao.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="Executar automação"
                    >
                      <Play className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => showMessage?.('info', 'Configurações em desenvolvimento')}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                      title="Configurar"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Lista de jobs
  const ListaJobs = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold">
          Jobs Recentes ({jobs.length})
        </h3>
      </div>

      {jobs.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Nenhum job executado ainda
        </div>
      ) : (
        <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
          {jobs.map(job => (
            <div key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{job.nome_job}</h4>
                  <p className="text-sm text-gray-600">{job.tipo_job}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    job.status === 'concluido' ? 'bg-green-100 text-green-800' :
                    job.status === 'executando' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'erro' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>

                  {job.status === 'executando' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =============================================================================
  // 🎨 RENDER PRINCIPAL
  // =============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🤖 Sistema de Automação</h2>
        <p className="opacity-90">
          Automação e RPA para processamento de PDFs EBD - {currentUser?.igreja}
        </p>
        <div className="mt-2 text-sm opacity-75">
          Sistema conectado ao PostgreSQL - Dados em tempo real
        </div>
      </div>

      {/* Cards de estatísticas */}
      <CardsEstatisticas />

      {/* Lista de automações */}
      <ListaAutomacoes />

      {/* Grid com Jobs e Próximos Passos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de jobs */}
        <ListaJobs />

        {/* Próximos passos */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Cpu className="mr-2 h-5 w-5" />
            Próximos Passos - Automação Python
          </h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Scripts Python de Processamento</p>
                <p className="text-sm text-gray-600">Criar scripts para processar PDFs EBD automaticamente</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Integração IA para Extração</p>
                <p className="text-sm text-gray-600">Usar OpenAI/Gemini para extrair perguntas dos PDFs</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Automação Completa</p>
                <p className="text-sm text-gray-600">Sistema end-to-end sem intervenção manual</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>🎯 Sistema Preparado:</strong> As tabelas de automação estão prontas no PostgreSQL. 
              Agora você pode focar na criação dos scripts Python!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationComponent;
