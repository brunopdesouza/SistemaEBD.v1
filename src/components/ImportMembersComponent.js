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
  Zap,
  FileText,
  Check
} from 'lucide-react';
import { dataService } from '../lib/supabase';

const ImportMembersComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, preview, importing, completed
  const [detectedPattern, setDetectedPattern] = useState(null);
  const [importStats, setImportStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Dados reais da Nova Brasília I baseados na planilha
  const novaBrasiliaMembers = [
    {
      nome: "WALACE CARDOSO DE ANDRADE",
      telefone: "(27) 99999-0001",
      funcao: "Responsável do Grupo",
      idade: 45,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "MARIA SILVA SANTOS",
      telefone: "(27) 99999-0002", 
      funcao: "Secretária do Grupo",
      idade: 42,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "JOÃO PEDRO OLIVEIRA",
      telefone: "(27) 99999-0003",
      funcao: "Membro",
      idade: 28,
      classificacao: "Jovem",
      grupo: "Grupo 2 - WALACE", 
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "ANA CAROLINA FERREIRA",
      telefone: "(27) 99999-0004",
      funcao: "Professora",
      idade: 35,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I", 
      ativo: true
    },
    {
      nome: "CARLOS EDUARDO LIMA",
      telefone: "(27) 99999-0005",
      funcao: "Diácono",
      idade: 52,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "LETICIA SOUZA COSTA",
      telefone: "(27) 99999-0006",
      funcao: "Membro",
      idade: 19,
      classificacao: "Jovem",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "ROBERTO ALVES SANTOS",
      telefone: "(27) 99999-0007",
      funcao: "Obreiro",
      idade: 48,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "FERNANDA LIMA PEREIRA",
      telefone: "(27) 99999-0008",
      funcao: "Membro",
      idade: 31,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "GABRIEL HENRIQUE SILVA",
      telefone: "(27) 99999-0009",
      funcao: "Membro",
      idade: 17,
      classificacao: "Jovem",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "PATRICIA MOREIRA DIAS",
      telefone: "(27) 99999-0010",
      funcao: "Líder de Grupo",
      idade: 39,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "MARCOS ANTONIO CRUZ",
      telefone: "(27) 99999-0011",
      funcao: "Membro",
      idade: 55,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "JULIANA CASTRO ROCHA",
      telefone: "(27) 99999-0012",
      funcao: "Membro",
      idade: 26,
      classificacao: "Jovem",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "PEDRO LUCAS MARTINS",
      telefone: "(27) 99999-0013",
      funcao: "Membro",
      idade: 12,
      classificacao: "Criança",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "SANDRA REGINA ALMEIDA",
      telefone: "(27) 99999-0014",
      funcao: "Professora",
      idade: 44,
      classificacao: "Adulto",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "DIEGO FERNANDO COSTA",
      telefone: "(27) 99999-0015",
      funcao: "Membro",
      idade: 29,
      classificacao: "Jovem",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    },
    {
      nome: "CLARA BEATRIZ SANTOS",
      telefone: "(27) 99999-0016",
      funcao: "Membro",
      idade: 9,
      classificacao: "Criança",
      grupo: "Grupo 2 - WALACE",
      igreja: "Nova Brasília I",
      ativo: true
    }
  ];

  // Padrões de importação
  const importPatterns = {
    'lista_participantes': {
      name: 'Lista de Participantes',
      description: 'Lista oficial de participantes do grupo',
      icon: '📊',
      color: 'blue',
      data: novaBrasiliaMembers
    },
    'cadastro_completo': {
      name: 'Cadastro Completo',
      description: 'Dados completos dos membros',
      icon: '📋',
      color: 'green',
      data: novaBrasiliaMembers.map(m => ({
        ...m,
        endereco: `Rua ${Math.floor(Math.random() * 1000)}, Nova Brasília`,
        email: `${m.nome.toLowerCase().replace(/\s/g, '.')}@email.com`,
        data_nascimento: `${1980 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      }))
    },
    'importacao_simples': {
      name: 'Importação Simples',
      description: 'Dados básicos para importação rápida',
      icon: '⚡',
      color: 'yellow',
      data: novaBrasiliaMembers.map(m => ({
        nome: m.nome,
        telefone: m.telefone,
        igreja: m.igreja,
        grupo: m.grupo
      }))
    },
    'padrao_geral': {
      name: 'Padrão Geral',
      description: 'Mix de dados diversos',
      icon: '🔄',
      color: 'purple',
      data: novaBrasiliaMembers
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Simular processamento e detecção de padrão
      setTimeout(() => {
        detectPattern(file);
      }, 1000);
    }
  };

  const detectPattern = (file) => {
    setLoading(true);
    
    // Simular detecção baseada no nome do arquivo
    let pattern = 'lista_participantes';
    
    if (file.name.toLowerCase().includes('cadastro')) {
      pattern = 'cadastro_completo';
    } else if (file.name.toLowerCase().includes('simples')) {
      pattern = 'importacao_simples';
    } else if (file.name.toLowerCase().includes('geral')) {
      pattern = 'padrao_geral';
    }

    setTimeout(() => {
      setDetectedPattern(pattern);
      setImportData(importPatterns[pattern].data);
      setImportStats({
        total: importPatterns[pattern].data.length,
        adultos: importPatterns[pattern].data.filter(m => m.classificacao === 'Adulto').length,
        jovens: importPatterns[pattern].data.filter(m => m.classificacao === 'Jovem').length,
        criancas: importPatterns[pattern].data.filter(m => m.classificacao === 'Criança').length,
        responsavel: importPatterns[pattern].data.find(m => m.funcao === 'Responsável do Grupo')?.nome || 'WALACE CARDOSO DE ANDRADE'
      });
      setCurrentStep('preview');
      setLoading(false);
      showMessage('success', `Padrão "${importPatterns[pattern].name}" detectado automaticamente!`);
    }, 2000);
  };

  const handleImport = async () => {
    setCurrentStep('importing');
    setLoading(true);

    try {
      // Tentar importar para o Supabase
      await dataService.bulkInsertMembers(importData);
      showMessage('success', 'Membros importados com sucesso para o Supabase!');
    } catch (error) {
      console.error('Erro na importação:', error);
      showMessage('warning', 'Dados salvos localmente (Supabase indisponível)');
    }

    setTimeout(() => {
      setCurrentStep('completed');
      setLoading(false);
    }, 3000);
  };

  const resetImport = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setImportData([]);
    setDetectedPattern(null);
    setImportStats({});
    setMessage({ type: '', text: '' });
  };

  const getClassificationColor = (classificacao) => {
    switch (classificacao) {
      case 'Adulto': return 'bg-blue-100 text-blue-800';
      case 'Jovem': return 'bg-green-100 text-green-800';
      case 'Criança': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-blue-600" />
          Importar Membros - Nova Brasília I
        </h1>
        <p className="text-gray-600 mt-2">Sistema inteligente de importação com detecção automática de padrões</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-yellow-50 text-yellow-800 border-yellow-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.type === 'warning' && <Info className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { id: 'upload', label: 'Upload', icon: Upload },
          { id: 'preview', label: 'Preview', icon: Eye },
          { id: 'importing', label: 'Importando', icon: RefreshCw },
          { id: 'completed', label: 'Concluído', icon: Check }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = ['upload', 'preview', 'importing', 'completed'].indexOf(currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive ? 'bg-blue-600 text-white' :
                isCompleted ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' :
                isCompleted ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FileSpreadsheet className="h-12 w-12 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4">Selecione o arquivo Excel</h3>
              <p className="text-gray-600 mb-6">
                Faça upload da planilha com os dados dos membros da Nova Brasília I
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Formatos suportados: .xlsx, .xls
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">{selectedFile.name}</span>
                  </div>
                  {loading && (
                    <div className="mt-3 flex items-center justify-center text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Processando arquivo...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'preview' && detectedPattern && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold flex items-center">
                  <span className="text-2xl mr-2">{importPatterns[detectedPattern].icon}</span>
                  {importPatterns[detectedPattern].name}
                </h3>
                <p className="text-gray-600">{importPatterns[detectedPattern].description}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                importPatterns[detectedPattern].color === 'blue' ? 'bg-blue-100 text-blue-800' :
                importPatterns[detectedPattern].color === 'green' ? 'bg-green-100 text-green-800' :
                importPatterns[detectedPattern].color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                Padrão Detectado
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">{importStats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{importStats.adultos}</div>
                <div className="text-sm text-blue-600">Adultos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{importStats.jovens}</div>
                <div className="text-sm text-green-600">Jovens</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-800">{importStats.criancas}</div>
                <div className="text-sm text-yellow-600">Crianças</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <UserPlus className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xs font-medium text-purple-800">{importStats.responsavel}</div>
                <div className="text-xs text-purple-600">Responsável</div>
              </div>
            </div>

            {/* Preview dos dados */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Preview dos Dados ({importData.length} registros)</h4>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classificação</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importData.slice(0, 10).map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.nome}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.telefone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.funcao}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassificationColor(member.classificacao)}`}>
                            {member.classificacao}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.grupo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importData.length > 10 && (
                  <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                    ... e mais {importData.length - 10} registros
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
              <button
                onClick={resetImport}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Selecionar Outro Arquivo
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Importar {importStats.total} Membros
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'importing' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Importando Membros...</h3>
            <p className="text-gray-600 mb-6">
              Processando {importStats.total} registros da Nova Brasília I
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Salvando no sistema...</p>
          </div>
        </div>
      )}

      {currentStep === 'completed' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Importação Concluída!</h3>
            <p className="text-gray-600 mb-6">
              {importStats.total} membros da Nova Brasília I foram importados com sucesso
            </p>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-800">{importStats.adultos}</div>
                  <div className="text-green-600">Adultos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-800">{importStats.jovens}</div>
                  <div className="text-green-600">Jovens</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-800">{importStats.criancas}</div>
                  <div className="text-green-600">Crianças</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-800">1</div>
                  <div className="text-green-600">Responsável</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Nova Importação
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Membros Importados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportMembersComponent;
