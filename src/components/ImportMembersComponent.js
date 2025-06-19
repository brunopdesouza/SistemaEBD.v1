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
  Download,
  RefreshCw
} from 'lucide-react';
import { dataService } from '../lib/supabase';

const ImportMembersComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================
  // PROCESSAR ARQUIVO EXCEL
  // ============================================================
  
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    
    try {
      // Simular leitura do Excel (em produção, usar uma biblioteca como xlsx)
      const reader = new FileReader();
      reader.onload = (e) => {
        // Aqui você integraria com uma biblioteca como 'xlsx' para ler o Excel
        // Por now, vamos simular dados baseados no nome do arquivo
        const simulatedData = generateSimulatedMemberData();
        setParsedData(simulatedData);
        setPreviewData(simulatedData.slice(0, 5)); // Mostrar apenas 5 primeiros
        setShowPreview(true);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erro processando arquivo:', error);
    }
  };

  // Simular dados de membros (em produção, ler do Excel real)
  const generateSimulatedMemberData = () => {
    return [
      {
        nome: 'João Silva Santos',
        cpf: '123.456.789-10',
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99999-1111',
        igreja: 'Nova Brasília 1',
        grupo_assistencia: 'Grupo 1 - Adultos',
        endereco: 'Rua das Flores, 123 - Nova Brasília',
        data_nascimento: '1980-05-15',
        observacoes: 'Membro ativo'
      },
      {
        nome: 'Maria Santos Silva',
        cpf: '987.654.321-00',
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Obreiro',
        telefone: '(27) 99999-2222',
        igreja: 'Nova Brasília 1',
        grupo_assistencia: 'Grupo 1 - Adultos',
        endereco: 'Rua das Palmeiras, 456 - Nova Brasília',
        data_nascimento: '1985-08-20',
        observacoes: 'Obreiro dedicado'
      },
      {
        nome: 'Pedro Costa Lima',
        cpf: '456.789.123-45',
        sexo: 'M',
        classe: 'Jovem',
        situacao: 'Membro',
        telefone: '(27) 99999-3333',
        igreja: 'Nova Brasília 1',
        grupo_assistencia: 'Grupo 2 - Jovens',
        endereco: 'Rua dos Lírios, 789 - Nova Brasília',
        data_nascimento: '2000-12-10',
        observacoes: 'Jovem participativo'
      },
      {
        nome: 'Ana Paula Oliveira',
        cpf: '789.123.456-78',
        sexo: 'F',
        classe: 'Jovem',
        situacao: 'Membro',
        telefone: '(27) 99999-4444',
        igreja: 'Nova Brasília 1',
        grupo_assistencia: 'Grupo 2 - Jovens',
        endereco: 'Rua das Rosas, 321 - Nova Brasília',
        data_nascimento: '1998-03-25',
        observacoes: 'Jovem líder'
      },
      {
        nome: 'José Mendes Filho',
        cpf: '321.654.987-12',
        sexo: 'M',
        classe: 'Criança',
        situacao: 'Membro',
        telefone: '(27) 99999-5555',
        igreja: 'Nova Brasília 1',
        grupo_assistencia: 'Grupo 4 - Crianças',
        endereco: 'Rua dos Girassóis, 654 - Nova Brasília',
        data_nascimento: '2015-07-08',
        observacoes: 'Criança participativa'
      }
    ];
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
      duplicates: 0
    };

    try {
      for (let i = 0; i < parsedData.length; i++) {
        const member = parsedData[i];
        
        try {
          // Verificar se já existe (por CPF)
          const existing = await dataService.getMembros({ 
            search: member.cpf.replace(/[^0-9]/g, '') 
          });
          
          if (existing && existing.length > 0) {
            results.duplicates++;
            continue;
          }

          // Criar membro
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
      
      // Limpar dados após importação
      setTimeout(() => {
        setParsedData([]);
        setPreviewData([]);
        setShowPreview(false);
        setSelectedFile(null);
      }, 3000);

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

  const FileUploadArea = () => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
      {!selectedFile ? (
        <div>
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Importar Membros do Excel
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecione o arquivo Excel com os dados dos membros da Nova Brasília 1
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo Excel
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
          Preview dos Membros - Nova Brasília 1
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {parsedData.length} membros encontrados (mostrando primeiros 5)
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.cpf}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.classe}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.situacao}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.grupo_assistencia}</td>
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
        Resultado da Importação
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {importResults.errors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
          <div className="space-y-1">
            {importResults.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600">
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
          Importar Membros - Nova Brasília 1
        </h2>
        <p className="opacity-90">
          Importe os dados dos membros do arquivo Excel para o sistema
        </p>
      </div>

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
              <UserPlus className="h-5 w-5 mr-2" />
              {importing ? 'Importando...' : `Importar ${parsedData.length} Membros`}
            </button>
            
            <button
              onClick={() => {
                setParsedData([]);
                setPreviewData([]);
                setShowPreview(false);
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

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">📋 Instruções:</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1.</strong> Prepare o arquivo Excel com as colunas: Nome, CPF, Classe, Situação, Telefone, Grupo, Endereço</p>
          <p><strong>2.</strong> Todos os membros serão automaticamente associados à <strong>Nova Brasília 1</strong></p>
          <p><strong>3.</strong> CPFs duplicados serão ignorados para evitar cadastros em duplicata</p>
          <p><strong>4.</strong> Após a importação, os membros estarão prontos para a automação EBD</p>
        </div>
      </div>
    </div>
  );
};

export default ImportMembersComponent;
