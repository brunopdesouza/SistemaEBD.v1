// src/components/AutomationComponent.js
import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Clock,
  TrendingUp,
  RefreshCw,
  Bot
} from 'lucide-react';
import { useAutomation, useFileUpload } from '../hooks/useAutomation';

const AutomationComponent = () => {
  const { 
    jobs, 
    loading: automationLoading, 
    error: automationError,
    startExtraction, 
    startAutomation,
    loadJobs 
  } = useAutomation();
  
  const { uploads, uploadWithProgress, clearUpload } = useFileUpload();
  const [selectedFiles, setSelectedFiles] = useState({ pdf: null, excel: null });

  // ============================================================
  // MANIPULAÇÃO DE UPLOAD
  // ============================================================

  const handleFileSelect = async (type, file) => {
    if (!file) return;

    try {
      const uploadedFile = await uploadWithProgress(file);
      setSelectedFiles(prev => ({
        ...prev,
        [type]: uploadedFile
      }));
    } catch (error) {
      console.error(`Erro no upload ${type}:`, error);
    }
  };

  // ============================================================
  // AÇÕES DE AUTOMAÇÃO
  // ============================================================

  const handleStartExtraction = async () => {
    if (!selectedFiles.pdf || !selectedFiles.excel) {
      alert('Selecione ambos os arquivos primeiro');
      return;
    }

    try {
      await startExtraction(selectedFiles.pdf.id, selectedFiles.excel.id);
    } catch (error) {
      console.error('Erro iniciando extração:', error);
    }
  };

  const handleStartAutomation = async () => {
    if (!selectedFiles.excel) {
      alert('Selecione a planilha Excel primeiro');
      return;
    }

    try {
      await startAutomation(selectedFiles.excel.id);
    } catch (error) {
      console.error('Erro iniciando automação:', error);
    }
  };

  // ============================================================
  // COMPONENTES DE UI
  // ============================================================

  const FileUploadCard = ({ type, title, accept, icon: Icon }) => {
    const isUploaded = selectedFiles[type];
    const uploadStates = Object.values(uploads).filter(u => 
      u.file.toLowerCase().includes(type === 'pdf' ? '.pdf' : '.xlsx') ||
      u.file.toLowerCase().includes(type === 'pdf' ? '.pdf' : '.xls')
    );
    const currentUpload = uploadStates[uploadStates.length - 1];

    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <div className="text-center">
          <Icon className={`h-12 w-12 mx-auto mb-4 ${
            isUploaded ? 'text-green-500' : 
            currentUpload?.status === 'error' ? 'text-red-500' : 'text-gray-400'
          }`} />
          
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          
          {!isUploaded && !currentUpload && (
            <div>
              <input
                type="file"
                accept={accept}
                onChange={(e) => handleFileSelect(type, e.target.files[0])}
                className="hidden"
                id={`upload-${type}`}
              />
              <label
                htmlFor={`upload-${type}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block"
              >
                Selecionar Arquivo
              </label>
            </div>
          )}

          {currentUpload && currentUpload.status === 'uploading' && (
            <div className="space-y-2">
              <div className="text-blue-600 font-medium">Enviando...</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentUpload.progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">{currentUpload.progress}%</div>
            </div>
          )}

          {currentUpload && currentUpload.status === 'error' && (
            <div className="text-red-600">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm mb-2">{currentUpload.error}</p>
              <button
                onClick={() => clearUpload(Object.keys(uploads).find(id => uploads[id] === currentUpload))}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {isUploaded && (
            <div className="text-green-600">
              <CheckCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">{isUploaded.nome_original}</p>
              <p className="text-sm text-gray-600">
                {(isUploaded.tamanho_bytes / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                onClick={() => setSelectedFiles(prev => ({ ...prev, [type]: null }))}
                className="mt-2 text-red-600 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'concluido': return 'text-green-800 bg-green-100 border-green-200';
        case 'erro': return 'text-red-800 bg-red-100 border-red-200';
        case 'executando': return 'text-blue-800 bg-blue-100 border-blue-200';
        default: return 'text-gray-800 bg-gray-100 border-gray-200';
      }
    };

    const getTypeLabel = (tipo) => {
      switch (tipo) {
        case 'extraction': return '📖 Extração de Perguntas';
        case 'automation': return '🤖 Automação EBD Nova Brasília 1';
        default: return tipo;
      }
    };

    return (
      <div className={`p-4 rounded-lg border-l-4 ${
        job.status === 'concluido' ? 'border-green-500 bg-green-50' :
        job.status === 'erro' ? 'border-red-500 bg-red-50' : 
        job.status === 'executando' ? 'border-blue-500 bg-blue-50' : 'border-gray-500 bg-gray-50'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">
              {getTypeLabel(job.tipo)}
            </h4>
            <p className="text-sm text-gray-600">
              {new Date(job.tempo_inicio).toLocaleString('pt-BR')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status.toUpperCase()}
          </span>
        </div>

        {job.mensagem && (
          <p className="text-sm text-gray-700 mb-2">{job.mensagem}</p>
        )}

        {job.progresso !== null && job.status === 'executando' && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso</span>
              <span>{job.progresso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${job.progresso}%` }}
              ></div>
            </div>
          </div>
        )}

        {job.resultado && (
          <div className="mt-3 p-3 bg-white rounded border">
            <h5 className="font-medium mb-2">📊 Resultados Nova Brasília 1:</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(job.resultado).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {job.logs && job.logs.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Ver logs ({job.logs.length})
            </summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono max-h-32 overflow-y-auto">
              {job.logs.map((log, index) => (
                <div key={index} className="text-gray-700">{log}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Bot className="mr-3 h-8 w-8" />
          🤖 Automação EBD - Nova Brasília 1
        </h2>
        <p className="opacity-90">
          Automatize a extração de perguntas dos PDFs e o preenchimento de formulários para os membros da Nova Brasília 1
        </p>
      </div>

      {/* Mensagem de Erro Global */}
      {automationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Erro:</span>
            <span className="ml-1">{automationError}</span>
          </div>
        </div>
      )}

      {/* Upload de Arquivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadCard
          type="pdf"
          title="PDF com Perguntas e Respostas da EBD"
          accept=".pdf"
          icon={FileText}
        />
        <FileUploadCard
          type="excel"
          title="Planilha de Participantes (Nova Brasília 1)"
          accept=".xlsx,.xls"
          icon={Upload}
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleStartExtraction}
          disabled={!selectedFiles.pdf || !selectedFiles.excel || automationLoading}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <FileText className="h-4 w-4 mr-2" />
          {automationLoading ? 'Iniciando...' : 'Extrair Perguntas do PDF'}
        </button>

        <button
          onClick={handleStartAutomation}
          disabled={!selectedFiles.excel || automationLoading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="h-4 w-4 mr-2" />
          {automationLoading ? 'Iniciando...' : 'Automação Nova Brasília 1'}
        </button>

        <button
          onClick={loadJobs}
          className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Lista
        </button>
      </div>

      {/* Estatísticas Rápidas */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Total de Processos', 
              value: jobs.length, 
              icon: TrendingUp, 
              color: 'text-blue-600' 
            },
            { 
              label: 'Concluídos', 
              value: jobs.filter(j => j.status === 'concluido').length, 
              icon: CheckCircle, 
              color: 'text-green-600' 
            },
            { 
              label: 'Em Execução', 
              value: jobs.filter(j => j.status === 'executando').length, 
              icon: Clock, 
              color: 'text-blue-600' 
            },
            { 
              label: 'Com Erro', 
              value: jobs.filter(j => j.status === 'erro').length, 
              icon: AlertCircle, 
              color: 'text-red-600' 
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Jobs */}
      {jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">📋 Histórico de Automações</h3>
            <span className="text-sm text-gray-600">
              {jobs.length} processo{jobs.length !== 1 ? 's' : ''} Nova Brasília 1
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {jobs.length === 0 && !automationLoading && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma automação executada ainda
          </h3>
          <p className="text-gray-600">
            Envie os arquivos da Nova Brasília 1 e execute os processos de automação para ver o histórico aqui.
          </p>
        </div>
      )}
    </div>
  );
};

export default AutomationComponent;
