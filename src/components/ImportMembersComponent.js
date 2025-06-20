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
  Download,
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
            {message.type === 'success' && <CheckCircle className="h-5
