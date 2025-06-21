// src/components/ImportMembersComponent.js - Importação de Membros
import React, { useState, useRef } from 'react';
import { 
  Upload,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Loader2,
  FileSpreadsheet,
  Database,
  AlertTriangle,
  Check
} from 'lucide-react';

import { arquivosService, utils } from '../lib/supabase';

const ImportMembersComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS
  // =============================================================================
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const fileInputRef = useRef(null);

  // Formatos aceitos
  const acceptedFormats = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel (.xlsx)',
    'application/vnd.ms-excel': 'Excel (.xls)',
    'text/csv': 'CSV',
    'application/pdf': 'PDF'
  };

  // =============================================================================
  // 🔧 FUNÇÕES DE UPLOAD E PROCESSAMENTO
  // =============================================================================
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validar tipo de arquivo
    if (!Object.keys(acceptedFormats).includes(file.type)) {
      showMessage('error', 'Formato de arquivo não suportado. Use Excel, CSV ou PDF.');
      return;
    }

    // Validar tamanho (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', 'Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setImportResults(null);
    setValidationErrors([]);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload do arquivo para Supabase
      const uploadedFile = await arquivosService.upload(
        selectedFile,
        'importacao_membros',
        currentUser.id
      );

      console.log('Arquivo enviado:', uploadedFile.id);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Processar conteúdo do arquivo
      await processFileContent(selectedFile);
      
      showMessage('success', 'Arquivo processado com sucesso!');
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      showMessage('error', error.message || 'Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const processFileContent = async (file) => {
    // Simular processamento de dados
    const mockData = generateMockPreviewData();
    setPreviewData(mockData);
    
    // Validar dados
    const errors = validateImportData(mockData.rows);
    setValidationErrors(errors);
    
    setShowPreview(true);
  };

  const generateMockPreviewData = () => {
    return {
      headers: ['Nome Completo', 'Email', 'Telefone', 'Situação', 'Grupo'],
      rows: [
        ['João Silva Santos', 'joao@email.com', '(27) 99999-1234', 'Ativo', 'Grupo 1'],
        ['Maria Oliveira', 'maria@email.com', '(27) 98888-5678', 'Ativo', 'Grupo 1'],
        ['Pedro Santos', 'pedro@email.com', '(27) 97777-9012', 'Visitante', 'Grupo 2'],
        ['Ana Costa', '', '(27) 96666-3456', 'Ativo', 'Grupo 1'], // Email vazio - erro
        ['Carlos Pereira', 'carlos@email.com', 'telefone-inválido', 'Ativo', 'Grupo 3'] // Telefone inválido
      ],
      totalRows: 5,
      validRows: 3,
      invalidRows: 2
    };
  };

  const validateImportData = (rows) => {
    const errors = [];
    
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque linha 1 é header e index começa em 0
      
      // Validar nome
      if (!row[0] || row[0].trim().length < 3) {
        errors.push({
          row: rowNumber,
          field: 'Nome',
          message: 'Nome deve ter pelo menos 3 caracteres'
        });
      }
      
      // Validar email
      if (row[1] && !utils.validateEmail(row[1])) {
        errors.push({
          row: rowNumber,
          field: 'Email',
          message: 'Email inválido'
        });
      }
      
      // Validar telefone
      if (row[2] && !row[2].match(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)) {
        errors.push({
          row: rowNumber,
          field: 'Telefone',
          message: 'Formato de telefone inválido. Use: (27) 99999-1234'
        });
      }
    });
    
    return errors;
  };

  const executeImport = async () => {
    if (!previewData || validationErrors.length > 0) {
      showMessage('error', 'Corrija os erros antes de importar');
      return;
    }

    setIsProcessing(true);
    
    try {
      const results = {
        total: previewData.totalRows,
        success: previewData.validRows,
        errors: previewData.invalidRows,
        details: []
      };

      // Simular importação dos dados válidos
      for (let i = 0; i < previewData.rows.length; i++) {
        const row = previewData.rows[i];
        
        try {
          // Só importar se não tiver erros nesta linha
          const hasErrors = validationErrors.some(error => error.row === i + 2);
          
          if (!hasErrors && row[0] && row[0].trim()) {
            const membroData = {
              nome_completo: row[0],
              email: row[1] || null,
              telefone: row[2] || null,
              situacao: row[3] || 'ativo',
              igreja_id: currentUser.igreja_id,
              grupo_id: currentUser.perfil_acesso === 'grupo' ? currentUser.grupo_id : null
            };

            // Simular criação do membro
            console.log('Dados do membro:', membroData);
            // await membrosService.criar(membroData, currentUser.id);
            
            results.details.push({
              row: i + 2,
              name: row[0],
              status: 'success',
              message: 'Importado com sucesso'
            });
          } else {
            results.details.push({
              row: i + 2,
              name: row[0] || 'Nome inválido',
              status: 'error',
              message: 'Dados inválidos'
            });
          }
        } catch (error) {
          results.details.push({
            row: i + 2,
            name: row[0] || 'Erro',
            status: 'error',
            message: error.message
          });
        }
      }

      setImportResults(results);
      setShowResults(true);
      setShowPreview(false);
      
      showMessage('success', `Importação concluída: ${results.success} membros importados`);
      
    } catch (error) {
      console.error('Erro na importação:', error);
      showMessage('error', 'Erro durante a importação');
    } finally {
      setIsProcessing(false);
    }
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================
  
  // Área de Upload
  const UploadArea = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Upload className="mr-2 h-6 w-6" />
        Importação de Membros
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <FileSpreadsheet className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {acceptedFormats[selectedFile.type]}
              </p>
            </div>
            
            {isProcessing && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                    Processando...
                  </>
                ) : (
                  'Processar Arquivo'
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewData(null);
                  setImportResults(null);
                  setValidationErrors([]);
                }}
                disabled={isProcessing}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arraste um arquivo aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-600">
                Formatos aceitos: Excel (.xlsx, .xls), CSV, PDF
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Tamanho máximo: 10MB
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Selecionar Arquivo
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
            />
          </div>
        )}
      </div>
      
      {/* Formatos aceitos */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Formatos Suportados:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(acceptedFormats).map(([mime, name]) => (
            <div key={mime} className="flex items-center text-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modal de Preview
  const PreviewModal = () => {
    if (!showPreview || !previewData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Preview da Importação
                </h3>
                <p className="text-gray-600 mt-1">
                  {previewData.totalRows} registros encontrados • 
                  {previewData.validRows} válidos • 
                  {previewData.invalidRows} com erros
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Erros de Validação */}
            {validationErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Erros de Validação ({validationErrors.length})
                </h4>
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      Linha {error.row}, {error.field}: {error.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Tabela de Preview */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    {previewData.headers.map((header, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.rows.map((row, rowIndex) => {
                    const hasError = validationErrors.some(error => error.row === rowIndex + 2);
                    return (
                      <tr key={rowIndex} className={hasError ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {cell || <span className="text-gray-400">-</span>}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasError ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Erro
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Válido
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {validationErrors.length > 0 
                  ? 'Corrija os erros antes de importar'
                  : 'Dados validados e prontos para importar'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeImport}
                  disabled={validationErrors.length > 0 || isProcessing}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    validationErrors.length > 0 || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Importar {previewData.validRows} Membros
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Resultados
  const ResultsModal = () => {
    if (!showResults || !importResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Resultados da Importação
                </h3>
                <p className="text-gray-600 mt-1">
                  {importResults.success} de {importResults.total} registros importados com sucesso
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedFile(null);
                  setPreviewData(null);
                  setImportResults(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Sucesso</p>
                    <p className="text-2xl font-bold text-green-900">{importResults.success}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-red-600">Erros</p>
                    <p className="text-2xl font-bold text-red-900">{importResults.errors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{importResults.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mensagem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importResults.details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.row}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {detail.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {detail.status === 'success' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sucesso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Erro
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {detail.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template de Download
  const DownloadTemplate = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Download className="mr-2 h-5 w-5" />
        Template de Importação
      </h3>
      
      <p className="text-gray-600 mb-4">
        Baixe o template para organizar seus dados no formato correto:
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Colunas obrigatórias:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Nome Completo</strong> - Nome completo do membro</li>
          <li>• <strong>Email</strong> - Email válido (opcional)</li>
          <li>• <strong>Telefone</strong> - Formato: (27) 99999-1234</li>
          <li>• <strong>Situação</strong> - Ativo, Inativo ou Visitante</li>
          <li>• <strong>Grupo</strong> - Grupo de assistência</li>
        </ul>
      </div>
      
      <button
        onClick={() => showMessage('info', 'Template de download será disponibilizado em breve')}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
      >
        <Download className="mr-2 h-4 w-4" />
        Baixar Template Excel
      </button>
    </div>
  );

  // =============================================================================
  // 🏗️ RENDER PRINCIPAL
  // =============================================================================
  
  return (
    <div className="space-y-6">
      <UploadArea />
      <DownloadTemplate />
      
      {/* Modais */}
      <PreviewModal />
      <ResultsModal />
    </div>
  );
};

export default ImportMembersComponent;
