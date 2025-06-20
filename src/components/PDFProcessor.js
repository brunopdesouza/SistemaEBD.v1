import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const PDFProcessor = ({ onPDFProcessed, userProfile }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [validationResults, setValidationResults] = useState(null);

  // Configuração do dropzone
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Verificar arquivos rejeitados
    if (rejectedFiles.length > 0) {
      toast.error('Apenas arquivos PDF são aceitos!');
      return;
    }

    // Validar tamanho dos arquivos (máximo 10MB)
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande (máximo 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        status: 'pending',
        progress: 0,
        extractedText: null,
        questions: []
      }))]);
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 5
  });

  // Processar PDF e extrair texto
  const processPDF = async (fileItem) => {
    try {
      setProcessing(true);
      
      // Simular progresso
      const updateProgress = (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress } : f
        ));
      };

      updateProgress(20);

      // Preparar FormData para upload
      const formData = new FormData();
      formData.append('pdf', fileItem.file);
      formData.append('igreja_id', userProfile.igreja_id);
      formData.append('usuario_id', userProfile.id);
      formData.append('semana', getCurrentWeek());
      formData.append('ano', new Date().getFullYear());

      updateProgress(40);

      // Enviar para API de processamento
      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${userProfile.token}`
        }
      });

      updateProgress(70);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      
      updateProgress(90);

      // Extrair perguntas do texto
      const questions = await extractQuestionsFromText(result.extractedText);
      
      updateProgress(100);

      // Atualizar estado do arquivo
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'completed',
          extractedText: result.extractedText,
          questions: questions,
          pdfId: result.pdfId
        } : f
      ));

      setExtractedQuestions(prev => [...prev, ...questions]);
      toast.success(`PDF ${fileItem.file.name} processado com sucesso!`);

      // Notificar componente pai
      if (onPDFProcessed) {
        onPDFProcessed({
          fileId: fileItem.id,
          pdfId: result.pdfId,
          questions: questions,
          extractedText: result.extractedText
        });
      }

    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
      ));
      toast.error(`Erro ao processar ${fileItem.file.name}: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Extrair perguntas do texto usando regex
  const extractQuestionsFromText = async (text) => {
    try {
      // Padrões para identificar perguntas
      const questionPatterns = [
        /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs, // Padrão: "1. Pergunta"
        /PERGUNTA\s*(\d+)[:\s]*(.+?)(?=PERGUNTA\s*\d+|$)/gis, // Padrão: "PERGUNTA 1: texto"
        /(\d+)\)\s*(.+?)(?=\d+\)|$)/gs, // Padrão: "1) Pergunta"
      ];

      const questions = [];
      let questionNumber = 1;

      for (const pattern of questionPatterns) {
        const matches = [...text.matchAll(pattern)];
        
        if (matches.length > 0) {
          matches.forEach(match => {
            const [, number, questionText] = match;
            
            if (questionText && questionText.trim().length > 10) {
              questions.push({
                id: `q_${Date.now()}_${questionNumber}`,
                numero: parseInt(number) || questionNumber,
                texto: questionText.trim(),
                tipo: detectQuestionType(questionText),
                opcoes: extractOptions(questionText),
                posicao: match.index,
                confianca: calculateConfidence(questionText)
              });
              questionNumber++;
            }
          });
          break; // Usar apenas o primeiro padrão que encontrar resultados
        }
      }

      return questions;
    } catch (error) {
      console.error('Erro ao extrair perguntas:', error);
      return [];
    }
  };

  // Detectar tipo de pergunta
  const detectQuestionType = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('verdadeiro') && lowerText.includes('falso')) {
      return 'verdadeiro_falso';
    }
    if (lowerText.includes('múltipla escolha') || /[a-d]\)/gi.test(text)) {
      return 'multipla_escolha';
    }
    if (lowerText.includes('complete') || lowerText.includes('preencha')) {
      return 'completar';
    }
    if (text.includes('?')) {
      return 'dissertativa';
    }
    return 'outros';
  };

  // Extrair opções de resposta
  const extractOptions = (text) => {
    const optionPatterns = [
      /[a-d]\)\s*(.+?)(?=[a-d]\)|$)/gis,
      /\([a-d]\)\s*(.+?)(?=\([a-d]\)|$)/gis,
      /[a-d][\.-]\s*(.+?)(?=[a-d][\.-]|$)/gis
    ];

    for (const pattern of optionPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 1) {
        return matches.map((match, index) => ({
          letra: String.fromCharCode(97 + index), // a, b, c, d
          texto: match[1].trim()
        }));
      }
    }
    return [];
  };

  // Calcular confiança da extração
  const calculateConfidence = (text) => {
    let confidence = 0.5;
    
    if (text.length > 20) confidence += 0.1;
    if (text.includes('?')) confidence += 0.1;
    if (/\d+/.test(text)) confidence += 0.1;
    if (text.split(' ').length > 5) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  };

  // Obter semana atual
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  // Remover arquivo
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('Arquivo removido');
  };

  // Validar perguntas extraídas
  const validateQuestions = async () => {
    try {
      setProcessing(true);
      
      const validation = {
        totalQuestions: extractedQuestions.length,
        validQuestions: extractedQuestions.filter(q => q.confianca > 0.7).length,
        duplicates: findDuplicateQuestions(),
        missingNumbers: findMissingNumbers(),
        lowConfidence: extractedQuestions.filter(q => q.confianca < 0.5)
      };

      setValidationResults(validation);
      toast.success('Validação concluída!');
    } catch (error) {
      toast.error('Erro na validação');
    } finally {
      setProcessing(false);
    }
  };

  const findDuplicateQuestions = () => {
    const seen = new Set();
    return extractedQuestions.filter(q => {
      const normalized = q.texto.toLowerCase().trim();
      if (seen.has(normalized)) return true;
      seen.add(normalized);
      return false;
    });
  };

  const findMissingNumbers = () => {
    const numbers = extractedQuestions.map(q => q.numero).sort((a, b) => a - b);
    const missing = [];
    for (let i = 1; i <= Math.max(...numbers); i++) {
      if (!numbers.includes(i)) missing.push(i);
    }
    return missing;
  };

  // Renderizar status do arquivo
  const renderFileStatus = (fileItem) => {
    switch (fileItem.status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processamento de PDFs
        </h2>
        <p className="text-gray-600">
          Faça upload dos questionários semanais em PDF para extração automática de perguntas
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive 
              ? 'Solte os arquivos aqui...' 
              : 'Arraste PDFs aqui ou clique para selecionar'
            }
          </p>
          <p className="text-sm text-gray-500">
            Aceita múltiplos arquivos PDF (máximo 10MB cada)
          </p>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Arquivos Carregados ({files.length})
          </h3>
          
          <div className="space-y-3">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {renderFileStatus(fileItem)}
                  <div>
                    <p className="font-medium text-gray-900">{fileItem.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileItem.status === 'pending' && (
                    <button
                      onClick={() => processPDF(fileItem)}
                      disabled={processing}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Processar'}
                    </button>
                  )}
                  
                  {fileItem.status === 'completed' && (
                    <div className="flex space-x-1">
                      <button className="text-blue-600 hover:text-blue-700 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 p-1">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remover
                  </button>
                </div>

                {/* Barra de Progresso */}
                {fileItem.progress > 0 && fileItem.progress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {extractedQuestions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Perguntas Extraídas ({extractedQuestions.length})
                </h4>
                <button
                  onClick={validateQuestions}
                  disabled={processing}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar'}
                </button>
              </div>

              {/* Resumo das Perguntas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-xl font-bold text-blue-900">{extractedQuestions.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Alta Confiança</p>
                  <p className="text-xl font-bold text-green-900">
                    {extractedQuestions.filter(q => q.confianca > 0.7).length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Revisar</p>
                  <p className="text-xl font-bold text-yellow-900">
                    {extractedQuestions.filter(q => q.confianca < 0.5).length}
                  </p>
                </div>
              </div>

              {/* Resultados da Validação */}
              {validationResults && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Resultados da Validação</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Perguntas válidas: {validationResults.validQuestions}/{validationResults.totalQuestions}</p>
                    {validationResults.duplicates.length > 0 && (
                      <p className="text-yellow-600">• {validationResults.duplicates.length} perguntas duplicadas encontradas</p>
                    )}
                    {validationResults.missingNumbers.length > 0 && (
                      <p className="text-yellow-600">• Números faltando: {validationResults.missingNumbers.join(', ')}</p>
                    )}
                    {validationResults.lowConfidence.length > 0 && (
                      <p className="text-red-600">• {validationResults.lowConfidence.length} perguntas com baixa confiança</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFProcessor;
