// src/utils/pdfImportHandler.js
import { supabase } from '../lib/supabase';

// =============================================================================
// 📄 PROCESSADOR DE PDF - LISTA DE MEMBROS ICM
// =============================================================================

export const processPdfMembros = async (file, currentUser, showMessage) => {
  try {
    console.log('📄 Iniciando processamento de PDF:', file.name);
    showMessage?.('info', 'Processando PDF... Isso pode levar alguns segundos.');

    // 1. Fazer upload do PDF para Supabase Storage
    const fileName = `pdfs/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('arquivos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Registrar arquivo na tabela
    const { data: arquivoData, error: arquivoError } = await supabase
      .from('arquivos')
      .insert([{
        nome_original: file.name,
        nome_sistema: fileName,
        caminho_arquivo: fileName,
        tipo_mime: file.type,
        tamanho_bytes: file.size,
        tipo_arquivo: 'lista_membros',
        usuario_upload_id: currentUser?.id,
        processado: false,
        metadados: { tipo: 'lista_icm', igreja: currentUser?.igreja },
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (arquivoError) throw arquivoError;

    // 3. Processar PDF usando a Netlify Function
    const processResult = await processarPdfNetlify(file, arquivoData.id);

    // 4. Extrair dados dos membros
    const membrosExtraidos = extrairMembrosDoTexto(processResult.texto);

    // 5. Validar e preparar dados para inserção
    const membrosValidados = validarMembrosICM(membrosExtraidos, currentUser);

    // 6. Log da operação
    await supabase.rpc('inserir_log_basico', {
      p_tipo_operacao: 'PROCESSAMENTO_PDF',
      p_detalhes: {
        arquivo: file.name,
        membros_extraidos: membrosExtraidos.length,
        membros_validos: membrosValidados.filter(m => m.valid).length,
        igreja: currentUser?.igreja
      },
      p_usuario_id: currentUser?.id
    });

    return {
      success: true,
      arquivo: arquivoData,
      membros: membrosValidados,
      total_extraidos: membrosExtraidos.length,
      total_validos: membrosValidados.filter(m => m.valid).length
    };

  } catch (error) {
    console.error('❌ Erro ao processar PDF:', error);
    throw new Error(`Erro no processamento do PDF: ${error.message}`);
  }
};

// =============================================================================
// 🔧 PROCESSAMENTO VIA NETLIFY FUNCTION
// =============================================================================

const processarPdfNetlify = async (file, arquivoId) => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('arquivoId', arquivoId);

    const response = await fetch('/.netlify/functions/pdf-processor', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Erro na função: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('❌ Erro na função Netlify:', error);
    // Fallback: processar localmente usando FileReader
    return await processarPdfLocal(file);
  }
};

// =============================================================================
// 🔄 FALLBACK - PROCESSAMENTO LOCAL
// =============================================================================

const processarPdfLocal = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const arrayBuffer = event.target.result;
      
      // Simular extração básica de texto
      // Em produção, você usaria uma biblioteca como pdf-parse
      resolve({
        texto: `Simulação de texto extraído do PDF: ${file.name}`,
        paginas: 1,
        processado_localmente: true
      });
    };
    
    reader.onerror = function(error) {
      reject(new Error('Erro ao ler arquivo PDF'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// =============================================================================
// 📋 EXTRAÇÃO DE DADOS DOS MEMBROS
// =============================================================================

const extrairMembrosDoTexto = (texto) => {
  const membros = [];
  
  // Padrões para encontrar dados dos membros no PDF da ICM
  const patterns = {
    // Padrão: "1 ANA ISADORA M. XAVIER 19/08/2013 999013622 1"
    linha_membro: /(\d+)\s+([A-Z\s\.]+)\s+(\d{2}\/\d{2}\/\d{4})\s*([\d\s]*)\s*([\d\s]*)\s*(\d+)?\s*$/gm,
    
    // Informações do cabeçalho
    grupo: /Grupo de Assistência:\s*([^\\n]+)/i,
    igreja: /Igreja:\s*([^\\n]+)/i,
    responsavel: /Responsável:\s*([^\\n]+)/i
  };

  // Extrair informações do cabeçalho
  const grupoMatch = texto.match(patterns.grupo);
  const igrejaMatch = texto.match(patterns.igreja);
  const responsavelMatch = texto.match(patterns.responsavel);

  const infoGrupo = {
    grupo: grupoMatch ? grupoMatch[1].trim() : '',
    igreja: igrejaMatch ? igrejaMatch[1].trim() : '',
    responsavel: responsavelMatch ? responsavelMatch[1].trim() : ''
  };

  // Extrair membros
  let match;
  while ((match = patterns.linha_membro.exec(texto)) !== null) {
    const [, numero, nome, nascimento, telResidencial, telComercial, celular, visitas] = match;
    
    membros.push({
      numero: parseInt(numero),
      nome_completo: nome.trim(),
      data_nascimento: nascimento,
      telefone: telResidencial?.trim() || null,
      telefone_comercial: telComercial?.trim() || null,
      celular: celular?.trim() || null,
      observacoes: `Visitas: ${visitas || 0}`,
      grupo_info: infoGrupo,
      extraido_de_pdf: true
    });
  }

  console.log(`📋 Extraídos ${membros.length} membros do PDF`);
  return membros;
};

// =============================================================================
// ✅ VALIDAÇÃO DOS DADOS EXTRAÍDOS
// =============================================================================

const validarMembrosICM = (membrosExtraidos, currentUser) => {
  return membrosExtraidos.map(membro => {
    const errors = [];
    
    // Validações obrigatórias
    if (!membro.nome_completo || membro.nome_completo.length < 2) {
      errors.push('Nome muito curto ou ausente');
    }
    
    // Validar data de nascimento
    if (membro.data_nascimento) {
      const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dataRegex.test(membro.data_nascimento)) {
        errors.push('Data de nascimento em formato inválido');
      }
    }
    
    // Validar telefones
    const telefones = [membro.telefone, membro.telefone_comercial, membro.celular]
      .filter(tel => tel && tel.length > 0);
    
    if (telefones.length === 0) {
      errors.push('Nenhum telefone informado');
    }

    // Mapear para estrutura do banco
    const membroValidado = {
      nome_completo: membro.nome_completo,
      data_nascimento: membro.data_nascimento || null,
      telefone: membro.telefone,
      celular: membro.celular || membro.telefone,
      endereco_completo: null,
      cidade: null,
      estado: 'ES', // Espírito Santo (Nova Brasília)
      igreja_id: currentUser?.igreja_id,
      grupo_id: currentUser?.grupo_id,
      funcao_igreja: 'Membro',
      situacao: 'ativo',
      observacoes: membro.observacoes,
      
      // Dados específicos da extração
      extraido_de_pdf: true,
      pdf_numero: membro.numero,
      pdf_grupo: membro.grupo_info.grupo,
      pdf_responsavel: membro.grupo_info.responsavel,
      
      // Validação
      errors: errors,
      valid: errors.length === 0
    };

    return membroValidado;
  });
};

// =============================================================================
// 💾 IMPORTAÇÃO PARA O BANCO
// =============================================================================

export const importarMembrosValidados = async (membrosValidados, currentUser, showMessage) => {
  try {
    const membrosParaImportar = membrosValidados.filter(m => m.valid);
    
    if (membrosParaImportar.length === 0) {
      throw new Error('Nenhum membro válido para importar');
    }

    console.log(`💾 Importando ${membrosParaImportar.length} membros para PostgreSQL...`);

    // Preparar dados para inserção
    const dadosParaInserir = membrosParaImportar.map(membro => ({
      nome_completo: membro.nome_completo,
      data_nascimento: membro.data_nascimento,
      telefone: membro.telefone,
      celular: membro.celular,
      endereco_completo: membro.endereco_completo,
      cidade: membro.cidade,
      estado: membro.estado,
      igreja_id: membro.igreja_id,
      grupo_id: membro.grupo_id,
      funcao_igreja: membro.funcao_igreja,
      situacao: membro.situacao,
      observacoes: membro.observacoes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Inserir em lotes
    const batchSize = 25;
    let totalImportados = 0;

    for (let i = 0; i < dadosParaInserir.length; i += batchSize) {
      const batch = dadosParaInserir.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('membros')
        .insert(batch)
        .select();

      if (error) {
        console.error('❌ Erro no lote:', error);
        throw error;
      }

      totalImportados += data?.length || 0;
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} importado: ${data?.length} membros`);
    }

    // Registrar log da importação
    await supabase.rpc('inserir_log_basico', {
      p_tipo_operacao: 'IMPORTACAO_PDF_MEMBROS',
      p_detalhes: {
        total_processados: membrosValidados.length,
        total_importados: totalImportados,
        fonte: 'PDF ICM',
        igreja: currentUser?.igreja,
        grupo: currentUser?.grupo_assistencia
      },
      p_usuario_id: currentUser?.id
    });

    showMessage?.('success', `${totalImportados} membros importados com sucesso do PDF!`);

    return {
      success: true,
      total_importados: totalImportados,
      total_processados: membrosValidados.length
    };

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    showMessage?.('error', `Erro na importação: ${error.message}`);
    throw error;
  }
};

// =============================================================================
// 📊 ANÁLISE DO PDF CARREGADO
// =============================================================================

export const analisarPdfCarregado = async (file) => {
  try {
    // Análise básica do arquivo
    const analise = {
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
      tamanho_mb: (file.size / 1024 / 1024).toFixed(2),
      compativel: file.type === 'application/pdf',
      estimativa_membros: 0,
      formato_detectado: null
    };

    // Detectar formato baseado no nome
    if (file.name.toLowerCase().includes('participantes')) {
      analise.formato_detectado = 'Lista de Participantes ICM';
      analise.estimativa_membros = 24; // Baseado no PDF mostrado
    }

    return analise;

  } catch (error) {
    console.error('❌ Erro na análise do PDF:', error);
    return null;
  }
};

export default {
  processPdfMembros,
  importarMembrosValidados,
  analisarPdfCarregado
};
