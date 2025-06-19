// src/components/ImportMembersComponent.js
import React, { useState } from 'react';
import { 
  Upload, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet,
  Eye,
  UserPlus,
  Info,
  RefreshCw,
  Zap
} from 'lucide-react';
import { dataService } from '../lib/supabase';
import { useExcelReader } from '../hooks/useExcelReader';

const ImportMembersComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState(null);

  const { readExcelFile, loading, error, detectImportPattern, getPatternInfo } = useExcelReader();

  // ============================================================
  // PROCESSAR ARQUIVO EXCEL COM DETECÇÃO DE PADRÃO
  // ============================================================
  
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    
    try {
      // Detectar padrão do arquivo
      const pattern = detectImportPattern(file.name);
      const patternInfo = getPatternInfo(file.name);
      setDetectedPattern(patternInfo);

      // Ler dados do arquivo
      const data = await readExcelFile(file);
      setParsedData(data);
      setPreviewData(data.slice(0, 8)); // Mostrar até 8 registros
      setShowPreview(true);

    } catch (error) {
      console.error('Erro processando arquivo:', error);
      alert('Erro ao processar arquivo: ' + error.message);
    }
  };

  // ============================================================
  // IMPORTAR MEMBROS PARA O BANCO
  // ============================================================
  
  const handleImportMembers = async () => {
    if (parsedData.length === 0) {
      alert('Nenhum dado para importar');
      return;
    }

    setImporting(true);
    const results = {
      total: parsedData.length,
      success: 0,
      errors: [],
      duplicates: 0,
      pattern: detectedPattern?.name || 'Padrão Geral'
    };

    try {
      for (let i = 0; i < parsedData.length; i++) {
        const member = parsedData[i];
        
        try {
          // Verificar se já existe (por CPF)
          const cpfNumerico = member.cpf.replace(/[^0-9]/g, '');
          const existing = await dataService.getMembros({ 
            search: cpfNumerico
          });
          
          if (existing && existing.length > 0) {
            results.duplicates++;
            continue;
          }

          // Criar membro no Supabase
          await dataService.createMembro({
            ...member,
            ativo: true
          });
          
          results.success++;
        } catch (error) {
          results.errors.push({
            member: member.nome,
            error: error.message
          });
        }
      }

      setImportResults(results);
      
      // Limpar dados após importação bem-sucedida
      if (results.success > 0) {
        setTimeout(() => {
          setParsedData([]);
          setPreviewData([]);
          setShowPreview(false);
          setSelectedFile(null);
          setDetectedPattern(null);
        }, 5000);
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro durante a importação: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  // ============================================================
  // COMPONENTES DE UI
  // ============================================================

  const PatternDetectionCard = ({ pattern }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900">
            Padrão Detectado: {pattern.name}
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            {pattern.description}
          </p>
          <div className="mt-2">
            <p className="text-xs text-blue-600">
              <strong>Campos esperados:</strong> {pattern.expectedFields.join(', ')}
            </p>
            <p className="text-xs text-blue-600">
              <strong>Membros estimados:</strong> ~{pattern.memberCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const FileUploadArea = () => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
      {!selectedFile ? (
        <div>
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Importar Membros - Nova Brasília I
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sistema detecta automaticamente o padrão do arquivo Excel
          </p>
          
          <div className="mb-4 text-xs text-gray-500">
            <p><strong>Padrões suportados:</strong></p>
            <p>• Lista de Participantes (oficial do grupo)</p>
            <p>• Cadastro Completo (dados detalhados)</p>
            <p>• Importação Simples (dados básicos)</p>
            <p>• Padrão Geral (mix de dados)</p>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
            id="file-upload"
            disabled={loading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-6 py-2 rounded-lg cursor-pointer transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Processando...' : 'Selecionar Arquivo Excel'}
          </label>
        </div>
      ) : (
        <div className="text-green-600">
          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">{selectedFile.name}</p>
          <p className="text-sm text-gray-600">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          <button
            onClick={() => {
              setSelectedFile(null);
              setParsedData([]);
              setPreviewData([]);
              setShowPreview(false);
              setDetectedPattern(null);
            }}
            className="mt-2 text-red-600 hover:text-red-700 text-sm"
          >
            Remover arquivo
          </button>
        </div>
      )}
    </div>
  );

  const PreviewTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Preview dos Membros - Nova Brasília I
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {parsedData.length} membros encontrados (mostrando primeiros {Math.min(8, parsedData.length)})
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Situação</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.cpf}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.classe === 'Criança' ? 'bg-yellow-100 text-yellow-800' :
                    member.classe === 'Jovem' || member.classe === 'Adolescente' ? 'bg-blue-100 text-blue-800' :
                    member.classe === 'Terceira Idade' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {member.classe}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.situacao.includes('Responsável') ? 'bg-red-100 text-red-800' :
                    member.situacao.includes('Secretário') ? 'bg-orange-100 text-orange-800' :
                    member.situacao === 'Diácono' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.situacao}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.grupo_assistencia}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.telefone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ImportResults = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
        Resultado da Importação - {importResults.pattern}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <div className="text-2xl font-bold text-blue-800">{importResults.total}</div>
          <div className="text-sm text-blue-600">Total Processados</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="text-2xl font-bold text-green-800">{importResults.success}</div>
          <div className="text-sm text-green-600">Membros Importados</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <div className="text-2xl font-bold text-yellow-800">{importResults.duplicates}</div>
          <div className="text-sm text-yellow-600">Duplicados Ignorados</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-2xl font-bold text-red-800">{importResults.errors.length}</div>
          <div className="text-sm text-red-600">Erros</div>
        </div>
      </div>

      {importResults.success > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-medium">
            ✅ {importResults.success} membros da Nova Brasília I foram importados com sucesso!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Agora você pode usar a automação EBD com estes membros.
          </p>
        </div>
      )}

      {importResults.errors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {importResults.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                • {error.member}: {error.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Users className="mr-3 h-8 w-8" />
          Importar Membros - Nova Brasília I
        </h2>
        <p className="opacity-90">
          Sistema inteligente de importação com detecção automática de padrões
        </p>
      </div>

      {/* Detecção de Padrão */}
      {detectedPattern && <PatternDetectionCard pattern={detectedPattern} />}

      {/* Upload Area */}
      <FileUploadArea />

      {/* Preview */}
      {showPreview && (
        <div className="space-y-4">
          <PreviewTable />
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleImportMembers}
              disabled={importing || parsedData.length === 0}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {importing ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              {importing ? 'Importando...' : `Importar ${parsedData.length} Membros`}
            </button>
            
            <button
              onClick={() => {
                setParsedData([]);
                setPreviewData([]);
                setShowPreview(false);
                setDetectedPattern(null);
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {importResults && <ImportResults />}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Erro:</span>
            <span className="ml-1">{error}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Padrões de Importação Suportados:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p><strong>📋 Lista de Participantes:</strong></p>
            <p className="text-xs">Baseado na lista oficial do grupo de assistência com dados reais dos membros da Nova Brasília I</p>
          </div>
          <div>
            <p><strong>📝 Cadastro Completo:</strong></p>
            <p className="text-xs">Dados detalhados incluindo endereço, telefones e informações completas</p>
          </div>
          <div>
            <p><strong>⚡ Importação Simples:</strong></p>
            <p className="text-xs">Dados básicos para importação rápida com informações mínimas necessárias</p>
          </div>
          <div>
            <p><strong>🔧 Padrão Geral:</strong></p>
            <p className="text-xs">Mix de diferentes tipos de dados, adaptável a various formatos</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded text-sm">
          <p><strong>💡 Dica:</strong> O sistema detecta automaticamente o padrão baseado no nome do arquivo e estrutura dos dados.</p>
        </div>
      </div>
    </div>
  );
};

export default ImportMembersComponent;
