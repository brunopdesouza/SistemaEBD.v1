// src/components/ImportMembersComponent.js
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download,
  Database,
  Loader2,
  FileSpreadsheet,
  Check
} from 'lucide-react';

// Import dos serviços reais do Supabase
import { membrosService, organizacaoService, supabase } from '../lib/supabase';

const ImportMembersComponent = ({ currentUser, showMessage }) => {
  // =============================================================================
  // 🎯 ESTADOS PRINCIPAIS - SEM DADOS MOCKADOS
  // =============================================================================
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dados, setDados] = useState([]);
  const [dadosValidados, setDadosValidados] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    total_membros: 0,
    importados_hoje: 0,
    ultima_importacao: null
  });

  // =============================================================================
  // 🔄 CARREGAMENTO DE DADOS REAIS
  // =============================================================================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('📥 Carregando dados para importação...');

      // Carregar igrejas e grupos reais
      const [igrejasData, gruposData] = await Promise.all([
        organizacaoService.listarIgrejas(),
        organizacaoService.listarGrupos()
      ]);

      setIgrejas(igrejasData);
      setGrupos(gruposData);

      // Buscar estatísticas de membros
      const { data: membrosCount, error: countError } = await supabase
        .from('membros')
        .select('*', { count: 'exact' });

      if (!countError) {
        setEstatisticas(prev => ({
          ...prev,
          total_membros: membrosCount?.length || 0
        }));
      }

      // Buscar última importação dos logs
      const { data: ultimaImportacao } = await supabase
        .from('logs_sistema')
        .select('timestamp')
        .eq('tipo_operacao', 'IMPORTACAO_MEMBROS')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (ultimaImportacao) {
        setEstatisticas(prev => ({
          ...prev,
          ultima_importacao: ultimaImportacao.timestamp
        }));
      }

      console.log(`✅ ${igrejasData.length} igrejas e ${gruposData.length} grupos carregados`);

    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
      showMessage?.('error', 'Erro ao carregar dados para importação');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // 🛠️ FUNÇÕES DE IMPORTAÇÃO
  // =============================================================================

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    processFile(uploadedFile);
  };

  const processFile = async (file) => {
    try {
      setLoading(true);
      console.log('📄 Processando arquivo:', file.name);

      const text = await file.text();
      
      // Processar CSV
      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const processedData = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const item = { id: index + 1 };
            
            headers.forEach((header, i) => {
              item[header] = values[i] || '';
            });
            
            return item;
          });

        setDados(processedData);
        console.log(`✅ ${processedData.length} registros processados do CSV`);
      }
      
      // Processar JSON
      else if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        const processedData = Array.isArray(jsonData) ? jsonData : [jsonData];
        setDados(processedData);
        console.log(`✅ ${processedData.length} registros processados do JSON`);
      }
      
      else {
        throw new Error('Formato de arquivo não suportado');
      }

      setStep(2);
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      showMessage?.('error', `Erro ao processar arquivo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validarDados = async () => {
    try {
      setLoading(true);
      console.log('🔍 Validando dados para importação...');

      const dadosValidos = dados.map(item => {
        const errors = [];
        
        // Validações obrigatórias
        if (!item.nome_completo && !item.nome) {
          errors.push('Nome é obrigatório');
        }
        
        if (item.email && !/\S+@\S+\.\S+/.test(item.email)) {
          errors.push('Email inválido');
        }

        // Mapear campos para estrutura do banco
        return {
          ...item,
          nome_completo: item.nome_completo || item.nome || '',
          email: item.email || null,
          celular: item.celular || item.telefone || null,
          igreja_id: currentUser?.igreja_id || null,
          grupo_id: currentUser?.grupo_id || null,
          situacao: 'ativo',
          errors: errors,
          valid: errors.length === 0
        };
      });

      setDadosValidados(dadosValidos);
      setStep(3);
      
      const validCount = dadosValidos.filter(d => d.valid).length;
      const invalidCount = dadosValidos.length - validCount;
      
      console.log(`✅ Validação concluída: ${validCount} válidos, ${invalidCount} com erro`);
      
      if (invalidCount > 0) {
        showMessage?.('warning', `${invalidCount} registros com problemas encontrados`);
      }

    } catch (error) {
      console.error('❌ Erro na validação:', error);
      showMessage?.('error', 'Erro ao validar dados');
    } finally {
      setLoading(false);
    }
  };

  const importarMembros = async () => {
    try {
      setLoading(true);
      console.log('💾 Iniciando importação para PostgreSQL...');

      const dadosParaImportar = dadosValidados.filter(d => d.valid);
      
      if (dadosParaImportar.length === 0) {
        throw new Error('Nenhum dado válido para importar');
      }

      // Preparar dados para inserção
      const membrosParaInserir = dadosParaImportar.map(item => ({
        nome_completo: item.nome_completo,
        email: item.email,
        celular: item.celular,
        telefone: item.telefone || item.celular,
        genero: item.genero || item.sexo,
        data_nascimento: item.data_nascimento,
        estado_civil: item.estado_civil,
        profissao: item.profissao,
        endereco_completo: item.endereco || item.endereco_completo,
        cidade: item.cidade,
        estado: item.estado || item.uf,
        cep: item.cep,
        igreja_id: currentUser?.igreja_id,
        grupo_id: currentUser?.grupo_id,
        funcao_igreja: item.funcao || 'Membro',
        situacao: 'ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Inserir no banco usando lotes
      const batchSize = 50;
      let totalImportados = 0;

      for (let i = 0; i < membrosParaInserir.length; i += batchSize) {
        const batch = membrosParaInserir.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('membros')
          .insert(batch)
          .select();

        if (error) {
          console.error('Erro no lote:', error);
          throw error;
        }

        totalImportados += data?.length || 0;
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} importado: ${data?.length} membros`);
      }

      // Registrar log da importação
      await supabase.rpc('inserir_log_basico', {
        p_tipo_operacao: 'IMPORTACAO_MEMBROS',
        p_detalhes: {
          arquivo: file.name,
          total_processados: dados.length,
          total_importados: totalImportados,
          usuario: currentUser?.nome,
          igreja: currentUser?.igreja
        },
        p_usuario_id: currentUser?.id
      });

      setStep(4);
      showMessage?.('success', `${totalImportados} membros importados com sucesso!`);
      
      // Atualizar estatísticas
      setEstatisticas(prev => ({
        ...prev,
        total_membros: prev.total_membros + totalImportados,
        importados_hoje: prev.importados_hoje + totalImportados,
        ultima_importacao: new Date().toISOString()
      }));

      console.log(`🎉 Importação concluída: ${totalImportados} membros salvos no PostgreSQL`);

    } catch (error) {
      console.error('❌ Erro na importação:', error);
      showMessage?.('error', `Erro na importação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetImportacao = () => {
    setFile(null);
    setDados([]);
    setDadosValidados([]);
    setStep(1);
  };

  // =============================================================================
  // 🎨 COMPONENTES DE INTERFACE
  // =============================================================================

  // Cards de estatísticas
  const CardsEstatisticas = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Membros</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.total_membros}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Importados Hoje</p>
            <p className="text-2xl font-bold text-gray-800">{estatisticas.importados_hoje}</p>
          </div>
          <Upload className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Última Importação</p>
            <p className="text-sm font-bold text-gray-800">
              {estatisticas.ultima_importacao 
                ? new Date(estatisticas.ultima_importacao).toLocaleDateString('pt-BR')
                : 'Nunca'
              }
            </p>
          </div>
          <Database className="h-8 w-8 text-purple-500" />
        </div>
      </div>
    </div>
  );

  // Etapa 1: Upload do arquivo
  const EtapaUpload = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">1. Selecionar Arquivo</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arraste e solte seu arquivo aqui
        </p>
        <p className="text-gray-600 mb-4">
          Ou clique para selecionar arquivo
        </p>
        
        <input
          type="file"
          accept=".csv,.json,.xlsx"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
        >
          Selecionar Arquivo
        </label>
        
        <div className="mt-4 text-sm text-gray-500">
          Formatos suportados: CSV, JSON, Excel (.xlsx)
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Campos Esperados:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
          <span>• nome_completo</span>
          <span>• email</span>
          <span>• celular</span>
          <span>• genero</span>
          <span>• data_nascimento</span>
          <span>• cidade</span>
        </div>
      </div>
    </div>
  );

  // Etapa 2: Preview dos dados
  const EtapaPreview = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">2. Visualizar Dados ({dados.length} registros)</h3>
        <button
          onClick={validarDados}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Validar Dados
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {dados.length > 0 && Object.keys(dados[0]).map(key => (
                <th key={key} className="p-3 text-left border-b text-sm font-medium text-gray-700">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.slice(0, 5).map((item, index) => (
              <tr key={index} className="border-b">
                {Object.values(item).map((value, i) => (
                  <td key={i} className="p-3 text-sm text-gray-600">
                    {String(value).substring(0, 50)}
                    {String(value).length > 50 && '...'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dados.length > 5 && (
        <p className="text-sm text-gray-500 mt-2">
          Mostrando 5 de {dados.length} registros
        </p>
      )}
    </div>
  );

  // Etapa 3: Validação
  const EtapaValidacao = () => {
    const validCount = dadosValidados.filter(d => d.valid).length;
    const invalidCount = dadosValidados.length - validCount;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">3. Validação dos Dados</h3>
          <button
            onClick={importarMembros}
            disabled={loading || validCount === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Importar para PostgreSQL
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-lg font-bold text-green-800">{validCount}</p>
                <p className="text-sm text-green-600">Registros Válidos</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-lg font-bold text-red-800">{invalidCount}</p>
                <p className="text-sm text-red-600">Registros com Erro</p>
              </div>
            </div>
          </div>
        </div>

        {invalidCount > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-red-900 mb-2">Registros com Problemas:</h4>
            <div className="max-h-64 overflow-y-auto">
              {dadosValidados.filter(d => !d.valid).map((item, index) => (
                <div key={index} className="bg-red-50 p-3 rounded border border-red-200 mb-2">
                  <p className="font-medium">Registro {index + 1}: {item.nome_completo}</p>
                  <ul className="text-sm text-red-600 ml-4">
                    {item.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Etapa 4: Sucesso
  const EtapaSucesso = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Importação Concluída!</h3>
      <p className="text-gray-600 mb-6">
        Os membros foram importados com sucesso para o PostgreSQL
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{dados.length}</p>
          <p className="text-sm text-blue-600">Total Processados</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {dadosValidados.filter(d => d.valid).length}
          </p>
          <p className="text-sm text-green-600">Importados</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{estatisticas.total_membros}</p>
          <p className="text-sm text-purple-600">Total no Sistema</p>
        </div>
      </div>

      <button
        onClick={resetImportacao}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Nova Importação
      </button>
    </div>
  );

  // =============================================================================
  // 🎨 RENDER PRINCIPAL
  // =============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">📥 Importação de Membros</h2>
        <p className="opacity-90">
          Importar membros para o PostgreSQL - {currentUser?.igreja}
        </p>
        <div className="mt-2 text-sm opacity-75">
          Sistema conectado ao banco de dados - Dados salvos em tempo real
        </div>
      </div>

      {/* Cards de estatísticas */}
      <CardsEstatisticas />

      {/* Progresso */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso da Importação</span>
          <span className="text-sm text-gray-500">Etapa {step} de 4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Conteúdo baseado na etapa */}
      {step === 1 && <EtapaUpload />}
      {step === 2 && <EtapaPreview />}
      {step === 3 && <EtapaValidacao />}
      {step === 4 && <EtapaSucesso />}

      {/* Botões de ação */}
      {step > 1 && step < 4 && (
        <div className="flex justify-between">
          <button
            onClick={resetImportacao}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportMembersComponent;
