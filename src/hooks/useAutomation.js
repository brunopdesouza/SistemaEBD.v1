// src/hooks/useAutomation.js
import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../lib/supabase';

// ============================================================
// HOOK PRINCIPAL DE AUTOMAÇÃO
// ============================================================

export const useAutomation = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar lista de jobs
  const loadJobs = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const data = await dataService.getJobs(filters);
      setJobs(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Erro carregando jobs:', err);
    }
  }, []);

  // Iniciar extração de PDF
  const startExtraction = useCallback(async (pdfId, excelId) => {
    try {
      setLoading(true);
      setError(null);

      const job = await dataService.createJob('extraction', {
        pdf_file_id: pdfId,
        excel_file_id: excelId,
        extract_questions: true,
        extract_answers: true,
        igreja: 'Nova Brasília 1'
      }, [pdfId, excelId]);

      // Simular processamento (será substituído por chamada real à API Python)
      setTimeout(async () => {
        await dataService.updateJob(job.id, {
          status: 'executando',
          progresso: 25,
          mensagem: 'Processando PDF da Nova Brasília 1...',
          logs: ['Iniciando extração', 'Lendo arquivo PDF', 'Identificando perguntas']
        });

        setTimeout(async () => {
          await dataService.updateJob(job.id, {
            status: 'executando',
            progresso: 75,
            mensagem: 'Extraindo dados para membros...',
            logs: [
              'Perguntas identificadas: 15',
              'Processando respostas por categoria',
              'Distribuindo para membros da Nova Brasília 1'
            ]
          });

          setTimeout(async () => {
            await dataService.updateJob(job.id, {
              status: 'concluido',
              progresso: 100,
              mensagem: 'Extração concluída com sucesso!',
              tempo_fim: new Date().toISOString(),
              resultado: {
                perguntas_extraidas: 15,
                respostas_processadas: 45,
                participantes_nova_brasilia: 30,
                igreja: 'Nova Brasília 1'
              },
              logs: [
                'Extração finalizada',
                'Dados salvos para Nova Brasília 1',
                'Processo concluído com sucesso'
              ]
            });
            await loadJobs();
          }, 2000);
        }, 3000);
      }, 1000);

      await loadJobs();
      return job;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJobs]);

  // Iniciar automação de preenchimento
  const startAutomation = useCallback(async (excelId) => {
    try {
      setLoading(true);
      setError(null);

      const job = await dataService.createJob('automation', {
        excel_file_id: excelId,
        target_website: 'https://www.igrejacristamaranata.org.br/ebd/participacoes/',
        automation_type: 'form_filling',
        igreja: 'Nova Brasília 1'
      }, [excelId]);

      // Simular automação (será substituído por chamada real ao Python)
      setTimeout(async () => {
        await dataService.updateJob(job.id, {
          status: 'executando',
          progresso: 20,
          mensagem: 'Abrindo navegador e carregando portal...',
          logs: [
            'Iniciando Playwright',
            'Configurando navegador para Nova Brasília 1',
            'Carregando planilha de participantes'
          ]
        });

        setTimeout(async () => {
          await dataService.updateJob(job.id, {
            status: 'executando',
            progresso: 60,
            mensagem: 'Preenchendo formulários dos membros...',
            logs: [
              'Processando João Silva - Nova Brasília 1',
              'Processando Maria Santos - Nova Brasília 1',
              'Processando Pedro Costa - Nova Brasília 1'
            ]
          });

          setTimeout(async () => {
            await dataService.updateJob(job.id, {
              status: 'concluido',
              progresso: 100,
              mensagem: 'Automação da Nova Brasília 1 concluída!',
              tempo_fim: new Date().toISOString(),
              resultado: {
                formularios_preenchidos: 25,
                sucessos: 23,
                falhas: 2,
                tempo_total: '5 minutos',
                igreja: 'Nova Brasília 1',
                cpfs_processados: 25
              },
              logs: [
                'Todos os membros da Nova Brasília 1 processados',
                'Relatório de participação gerado',
                'Automação finalizada com sucesso'
              ]
            });
            await loadJobs();
          }, 4000);
        }, 3000);
      }, 1000);

      await loadJobs();
      return job;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJobs]);

  // Carregar jobs na inicialização
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    startExtraction,
    startAutomation,
    loadJobs
  };
};

// ============================================================
// HOOK PARA UPLOAD DE ARQUIVOS
// ============================================================

export const useFileUpload = () => {
  const [uploads, setUploads] = useState({});

  const uploadWithProgress = useCallback(async (file) => {
    const uploadId = Date.now().toString();
    
    // Inicializar estado do upload
    setUploads(prev => ({
      ...prev,
      [uploadId]: {
        file: file.name,
        progress: 0,
        status: 'uploading'
      }
    }));

    try {
      // Simular progresso de upload
      const updateProgress = (progress) => {
        setUploads(prev => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            progress
          }
        }));
      };

      // Simular upload com progresso
      for (let i = 0; i <= 100; i += 10) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload real para Supabase
      const uploadedFile = await dataService.uploadFile(file);

      // Sucesso
      setUploads(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: 'completed',
          progress: 100
        }
      }));

      return uploadedFile;
    } catch (error) {
      // Erro
      setUploads(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: 'error',
          error: error.message
        }
      }));
      throw error;
    }
  }, []);

  const clearUpload = useCallback((uploadId) => {
    setUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[uploadId];
      return newUploads;
    });
  }, []);

  return {
    uploads,
    uploadWithProgress,
    clearUpload
  };
};
