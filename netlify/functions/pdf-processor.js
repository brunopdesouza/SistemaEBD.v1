const pdf = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Lidar com preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Verificar método HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método não permitido' })
      };
    }

    // Verificar autorização
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token de autorização necessário' })
      };
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar usuário no Supabase
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token inválido' })
      };
    }

    // Parse do body (multipart/form-data)
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content-Type deve ser multipart/form-data' })
      };
    }

    // Extrair dados do formulário
    const body = event.isBase64Encoded ? 
      Buffer.from(event.body, 'base64') : 
      Buffer.from(event.body);

    // Parse simples do multipart (para produção, usar biblioteca como 'busboy')
    const boundary = contentType.split('boundary=')[1];
    const parts = body.toString('binary').split(`--${boundary}`);
    
    let pdfBuffer = null;
    let metadata = {};

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data')) {
        const lines = part.split('\r\n');
        const disposition = lines.find(line => line.includes('Content-Disposition'));
        
        if (disposition && disposition.includes('name="pdf"')) {
          // Encontrar início dos dados binários
          const emptyLineIndex = lines.findIndex(line => line === '');
          if (emptyLineIndex !== -1) {
            const binaryData = lines.slice(emptyLineIndex + 1).join('\r\n');
            pdfBuffer = Buffer.from(binaryData, 'binary');
          }
        } else if (disposition) {
          // Extrair outros campos do formulário
          const nameMatch = disposition.match(/name="([^"]+)"/);
          if (nameMatch) {
            const fieldName = nameMatch[1];
            const emptyLineIndex = lines.findIndex(line => line === '');
            if (emptyLineIndex !== -1) {
              metadata[fieldName] = lines[emptyLineIndex + 1];
            }
          }
        }
      }
    }

    if (!pdfBuffer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Arquivo PDF não encontrado' })
      };
    }

    // Processar PDF
    const pdfData = await pdf(pdfBuffer);
    const extractedText = pdfData.text;

    // Extrair perguntas usando regex
    const questions = extractQuestionsFromText(extractedText);

    // Salvar no banco de dados
    const { data: questionarioData, error: questionarioError } = await supabase
      .from('questionarios_pdf')
      .insert({
        arquivo_nome: `questionario_${Date.now()}.pdf`,
        texto_extraido: extractedText,
        perguntas_identificadas: questions,
        data_processamento: new Date().toISOString(),
        status: 'processado',
        igreja_id: metadata.igreja_id,
        usuario_id: user.user.id,
        semana: parseInt(metadata.semana) || getCurrentWeek(),
        ano: parseInt(metadata.ano) || new Date().getFullYear(),
        metadados: {
          total_paginas: pdfData.numpages,
          total_perguntas: questions.length,
          confianca_media: questions.reduce((acc, q) => acc + q.confianca, 0) / questions.length || 0
        }
      })
      .select()
      .single();

    if (questionarioError) {
      console.error('Erro ao salvar questionário:', questionarioError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao salvar no banco de dados' })
      };
    }

    // Salvar perguntas individuais
    if (questions.length > 0) {
      const perguntasData = questions.map(q => ({
        questionario_id: questionarioData.id,
        numero_pergunta: q.numero,
        texto_pergunta: q.texto,
        opcoes_resposta: q.opcoes || [],
        tipo_pergunta: q.tipo,
        confianca: q.confianca,
        posicao_no_texto: q.posicao
      }));

      const { error: perguntasError } = await supabase
        .from('perguntas_extraidas')
        .insert(perguntasData);

      if (perguntasError) {
        console.error('Erro ao salvar perguntas:', perguntasError);
      }
    }

    // Log da operação
    await supabase
      .from('logs_sistema')
      .insert({
        tipo_operacao: 'processamento_pdf',
        usuario_id: user.user.id,
        igreja_id: metadata.igreja_id,
        detalhes: {
          arquivo_nome: questionarioData.arquivo_nome,
          total_perguntas: questions.length,
          total_paginas: pdfData.numpages,
          tamanho_arquivo: pdfBuffer.length
        },
        timestamp: new Date().toISOString(),
        status: 'sucesso'
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        pdfId: questionarioData.id,
        extractedText: extractedText,
        questions: questions,
        metadata: {
          totalPages: pdfData.numpages,
          totalQuestions: questions.length,
          averageConfidence: questions.reduce((acc, q) => acc + q.confianca, 0) / questions.length || 0
        }
      })
    };

  } catch (error) {
    console.error('Erro no processamento:', error);

    // Log do erro
    try {
      await supabase
        .from('logs_sistema')
        .insert({
          tipo_operacao: 'processamento_pdf',
          detalhes: {
            erro: error.message,
            stack: error.stack
          },
          timestamp: new Date().toISOString(),
          status: 'erro'
        });
    } catch (logError) {
      console.error('Erro ao salvar log:', logError);
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao processar PDF'
      })
    };
  }
};

// Função para extrair perguntas do texto
function extractQuestionsFromText(text) {
  const questions = [];
  
  // Padrões de regex para identificar perguntas
  const patterns = [
    {
      regex: /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs,
      type: 'numerada'
    },
    {
      regex: /PERGUNTA\s*(\d+)[:\s]*(.+?)(?=PERGUNTA\s*\d+|$)/gis,
      type: 'marcada'
    },
    {
      regex: /(\d+)\)\s*(.+?)(?=\d+\)|$)/gs,
      type: 'parenteses'
    }
  ];

  let questionNumber = 1;

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern.regex)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const [fullMatch, number, questionText] = match;
        
        if (questionText && questionText.trim().length > 10) {
          const cleanText = questionText.trim();
          
          questions.push({
            id: `q_${Date.now()}_${questionNumber}`,
            numero: parseInt(number) || questionNumber,
            texto: cleanText,
            tipo: detectQuestionType(cleanText),
            opcoes: extractOptions(cleanText),
            posicao: match.index,
            confianca: calculateConfidence(cleanText),
            padrao_usado: pattern.type
          });
          
          questionNumber++;
        }
      });
      break; // Usar apenas o primeiro padrão que encontrar resultados
    }
  }

  return questions;
}

// Detectar tipo de pergunta
function detectQuestionType(text) {
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
}

// Extrair opções de resposta
function extractOptions(text) {
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
}

// Calcular confiança da extração
function calculateConfidence(text) {
  let confidence = 0.5;
  
  // Fatores que aumentam a confiança
  if (text.length > 20) confidence += 0.1;
  if (text.includes('?')) confidence += 0.1;
  if (/\d+/.test(text)) confidence += 0.1;
  if (text.split(' ').length > 5) confidence += 0.1;
  if (/[A-Z]/.test(text.charAt(0))) confidence += 0.1;
  
  // Fatores que diminuem a confiança
  if (text.length < 10) confidence -= 0.2;
  if (!text.trim()) confidence = 0;
  
  return Math.max(0, Math.min(confidence, 1.0));
}

// Obter semana atual
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}
