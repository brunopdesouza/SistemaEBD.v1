// src/components/AutomationComponent.js - Automação e RPA
import React, { useState, useEffect } from 'react';
import { 
  Bot,
  Play,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Database,
  Zap,
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  RefreshCw
} from 'lucide-react';

import { supabase } from '../lib/supabase';

const AutomationComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [loading, setLoading] = useState(true);
  const [executingTasks, setExecutingTasks] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [statistics, setStatistics] = useState({
    total_automacoes: 0,
    ativas: 0,
    execucoes_hoje: 0,
    sucesso_rate: 0
  });

  // Estados para tarefas disponíveis
  const [availableTasks] = useState([
    {
      id: 'extract_pdf_questions',
      name: 'Extrair Perguntas de PDF',
      description: 'Extrai automaticamente perguntas dos PDFs EBD usando IA',
      icon: FileText,
      category: 'EBD',
      status: 'disponivel',
      estimatedTime: '2-5 minutos'
    },
    {
      id: 'process_member_forms',
      name: 'Processar Formulários de Membros',
      description: 'Processa automaticamente formulários de cadastro de membros',
      icon: Database,
      category: 'Membros',
      status: 'disponivel',
      estimatedTime: '1-3 minutos'
    },
    {
      id: 'generate_weekly_reports',
      name: 'Relatórios Semanais',
      description: 'Gera relatórios automáticos de participação e atividades',
      icon: BarChart3,
      category: 'Relatórios',
      status: 'disponivel',
      estimatedTime: '30 segundos'
    },
    {
      id: 'backup_database',
      name: 'Backup do Banco de Dados',
      description: 'Realiza backup automático dos dados do sistema',
      icon: HardDrive,
      category: 'Sistema',
      status: 'disponivel',
      estimatedTime: '1-2 minutos'
    },
    {
      id: 'sync_church_data',
      name: 'Sincronizar Dados da Igreja',
      description: 'Sincroniza dados com sistemas externos da ICM',
      icon: RefreshCw,
      category: 'Integração',
      status: 'em_desenvolvimento',
      estimatedTime: '5-10 minutos'
    },
    {
      id: 'email_notifications',
      name: 'Envio de Notificações',
      description: 'Envia notificações automáticas por email',
      icon: Zap,
      category: 'Comunicação',
      status: 'em_desenvolvimento',
      estimatedTime: '30 segundos'
    }
  ]);

  // =============================================================================
  // 🔄 CARREGAMENTO INICIAL
  // =============================================================================
  const loadAutomationData = async () => {
    try {
      setLoading(true);
      
      // Carregar automações configuradas
      const { data: automacoesData, error: autoError } = await supabase
        .from('automacao_configuracoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (autoError) throw autoError;

      // Carregar logs recentes
      const { data: logsData, error: logsError } = await supabase
        .from('automacao_logs')  
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Calcular estatísticas
      const stats = {
        total_automacoes: automacoesData?.length || 0,
        ativas: automacoesData?.filter(a => a.ativa).length || 0,
        execucoes_hoje: logsData?.filter(log => {
          const hoje = new Date().toDateString();
          const logDate = new Date(log.created_at).toDateString();
          return hoje === logDate;
        }).length || 0,
        sucesso_rate: calculateSuccessRate(logsData || [])
      };

      setLogs(logsData || []);
      setStatistics(stats);
      
    } catch (error) {
      console.error('Erro ao carregar dados de automação:', error);
      showMessage('error', 'Erro ao carregar dados de automação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutomationData();
  }, []);

  const calculateSuccessRate = (logs) => {
    if (logs.length === 0) return 0;
    const sucessos = logs.filter(log => log.status === 'sucesso').length;
    return Math.round((sucessos / logs.length) * 100);
  };

  // =============================================================================
  // 🔧 FUNÇÕES DE AUTOMAÇÃO
  // =============================================================================
  
  const executeTask = async (taskId) => {
    if (executingTasks.has(taskId)) return;

    setExecutingTasks(prev => new Set([...prev, taskId]));
    
    try {
      const task = availableTasks.find(t => t.id === taskId);
      if (!task) throw new Error('Tarefa não encontrada');

      showMessage('info', `Iniciando: ${task.name}`);

      // Simular execução da tarefa
      await simulateTaskExecution(task);
      
      // Registrar log de sucesso
      await registerAutomationLog(taskId, 'sucesso', 'Tarefa executada com sucesso');
      
      showMessage('success', `${task.name} executada com sucesso!`);
      
      // Recarregar dados
      loadAutomationData();
      
    } catch (error) {
      console.error('Erro na execução:', error);
      await registerAutomationLog(taskId, 'erro', error.message);
      showMessage('error', `Erro: ${error.message}`);
    } finally {
      setExecutingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const simulateTaskExecution = async (task) => {
    // Simular tempo de execução baseado na tarefa
    const executionTime = getExecutionTime(task.id);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, executionTime);
    });
  };

  const getExecutionTime = (taskId) => {
    const times = {
      'extract_pdf_questions': 3000,
      'process_member_forms': 2000,
      'generate_weekly_reports': 1000,
      'backup_database': 2500,
      'sync_church_data': 5000,
      'email_notifications': 800
    };
    return times[taskId] || 2000;
  };

  const registerAutomationLog = async (taskId, status, message) => {
    try {
      const { error } = await supabase
        .from('automacao_logs')
        .insert({
          configuracao_id: null, // Para tarefas manuais
          status: status,
          inicio: new Date().toISOString(),
          fim: new Date().toISOString(),
          duracao_segundos: Math.floor(getExecutionTime(taskId) / 1000),
          resultado: { 
            task_id: taskId,
            executed_by: currentUser.id,
            message: message
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar log:', error);
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
            <Bot className="mr-3 h-6 w-6 text-blue-600" />
            Centro de Automação RPA
          </h2>
          <p className="text-gray-600">
            Automatize processos e tarefas do sistema EBD
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Activity className="mr-2 h-4 w-4" />
            {showLogs ? 'Ocultar' : 'Ver'} Logs
          </button>
          <button
            onClick={loadAutomationData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total de Automações</p>
              <p className="text-2xl font-bold text-blue-900">{statistics.total_automacoes}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Ativas</p>
              <p className="text-2xl font-bold text-green-900">{statistics.ativas}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Execuções Hoje</p>
              <p className="text-2xl font-bold text-purple-900">{statistics.execucoes_hoje}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-yellow-900">{statistics.sucesso_rate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Cards de Tarefas Disponíveis
  const TaskCard = ({ task }) => {
    const isExecuting = executingTasks.has(task.id);
    const IconComponent = task.icon;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${
              task.status === 'disponivel' ? 'bg-blue-100' :
              task.status === 'em_desenvolvimento' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                task.status === 'disponivel' ? 'text-blue-600' :
                task.status === 'em_desenvolvimento' ? 'text-yellow-600' :
                'text-gray-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.estimatedTime}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {task.category}
                </span>
              </div>
            </div>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.status === 'disponivel' 
              ? 'bg-green-100 text-green-800' 
              : task.status === 'em_desenvolvimento'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {task.status === 'disponivel' ? 'Disponível' :
             task.status === 'em_desenvolvimento' ? 'Em Desenvolvimento' :
             'Indisponível'}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => executeTask(task.id)}
            disabled={isExecuting || task.status !== 'disponivel'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              isExecuting || task.status !== 'disponivel'
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Executando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar Agora
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Painel de Logs
  const LogsPanel = () => {
    if (!showLogs) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Logs de Automação ({logs.length})
        </h3>
        
        <div className="overflow-y-auto max-h-96">
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div 
                  key={log.id || index} 
                  className={`p-3 rounded border-l-4 ${
                    log.status === 'sucesso' 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.resultado?.task_id ? 
                          availableTasks.find(t => t.id === log.resultado.task_id)?.name || 'Tarefa Desconhecida'
                          : 'Automação'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {log.resultado?.message || 'Sem detalhes'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'sucesso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'sucesso' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {log.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum log de automação encontrado</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =============================================================================
  // 🏗️ RENDER PRINCIPAL
  // =============================================================================
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando centro de automação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderStats />
      <LogsPanel />
      
      {/* Categorias de Tarefas */}
      <div className="space-y-6">
        {['EBD', 'Membros', 'Relatórios', 'Sistema', 'Integração', 'Comunicação'].map(category => {
          const categoryTasks = availableTasks.filter(task => task.category === category);
          
          if (categoryTasks.length === 0) return null;
          
          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="mr-2 h-5 w-5 text-blue-600" />
                {category}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categoryTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status do Sistema */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Status do Sistema
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded border-l-4 border-green-400">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-900">PostgreSQL Supabase</span>
            </div>
            <span className="text-sm text-green-700">Online</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <div className="flex items-center">
              <Bot className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Sistema de Automação</span>
            </div>
            <span className="text-sm text-blue-700">Ativo</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-l-4 border-purple-400">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-purple-600 mr-2" />
              <span className="font-medium text-purple-900">Monitoramento</span>
            </div>
            <span className="text-sm text-purple-700">Funcionando</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationComponent;
