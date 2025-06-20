// src/config/ebdConfig.js
// Configurações baseadas no sistema EBD existente da Igreja Cristã Maranata

export const EBD_CONFIG = {
  // Configurações globais do sistema
  SISTEMA: {
    nome: "Sistema EBD - Igreja Cristã Maranata",
    versao: "1.0.0",
    timezone: "America/Sao_Paulo", // GMT-3
    idiomas_suportados: ["pt", "en", "es", "it"]
  },

  // Períodos de participação
  PERIODO_PARTICIPACAO: {
    inicio: { dia: 0, hora: 11, minuto: 0 }, // Domingo 11:00
    fim: { dia: 4, hora: 23, minuto: 59 },   // Quinta 23:59
    ativo: true
  },

  // Limites e validações
  VALIDACOES: {
    contribuicao: {
      min_caracteres: 10,
      max_caracteres: 3000,
      obrigatoria: true
    },
    cpf: {
      obrigatorio_brasil: true,
      mascara: "###.###.###-##"
    },
    telefone: {
      mascaras_brasil: ["(##) ####-####", "(##) #####-####"],
      internacional: true
    },
    email: {
      obrigatorio: true,
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  }
};

// Denominações religiosas
export const DENOMINACOES = [
  { id: 3, descricao: "Católica", ativo: true, ordem: 1 },
  { id: 4, descricao: "Assembleia", ativo: true, ordem: 2 },
  { id: 5, descricao: "Batista", ativo: true, ordem: 3 },
  { id: 6, descricao: "Congregação Cristã", ativo: true, ordem: 4 },
  { id: 7, descricao: "Universal", ativo: true, ordem: 5 },
  { id: 8, descricao: "Quadrangular", ativo: true, ordem: 6 },
  { id: 9, descricao: "Adventista", ativo: true, ordem: 7 },
  { id: 10, descricao: "Testemunhas de Jeová", ativo: true, ordem: 8 },
  { id: 11, descricao: "Luterana", ativo: true, ordem: 9 },
  { id: 12, descricao: "Presbiteriana", ativo: true, ordem: 10 },
  { id: 13, descricao: "Deus é Amor", ativo: true, ordem: 11 },
  { id: 14, descricao: "Metodista", ativo: true, ordem: 12 },
  { id: 15, descricao: "Casa de Oração", ativo: true, ordem: 13 },
  { id: 16, descricao: "Outra Denominação", ativo: true, ordem: 14 },
  { id: 17, descricao: "Não Informado", ativo: true, ordem: 15 },
  { id: 18, descricao: "Metodista Wesleyana", ativo: true, ordem: 16 },
  { id: 19, descricao: "Espírita", ativo: true, ordem: 17 },
  { id: 20, descricao: "Mundial", ativo: true, ordem: 18 },
  { id: 21, descricao: "Membro ICM - Brasil", ativo: true, ordem: 19 },
  { id: 22, descricao: "Membro ICM - Exterior", ativo: true, ordem: 20 }
];

// Funções na igreja
export const FUNCOES_IGREJA = [
  { id: 1, descricao: "Pastor", nivel: "lideranca", ativo: true },
  { id: 2, descricao: "Evangelista", nivel: "lideranca", ativo: true },
  { id: 3, descricao: "Diácono", nivel: "lideranca", ativo: true },
  { id: 4, descricao: "Obreiro", nivel: "ministerio", ativo: true },
  { id: 5, descricao: "Professor", nivel: "ensino", ativo: true },
  { id: 6, descricao: "Responsável do Grupo", nivel: "lideranca", ativo: true },
  { id: 7, descricao: "Secretário do Grupo", nivel: "administrativo", ativo: true },
  { id: 8, descricao: "Outra Função", nivel: "outros", ativo: true },
  { id: 9, descricao: "Membro", nivel: "membro", ativo: true }
];

// Trabalhos e ministérios
export const TRABALHOS_MINISTERIOS = [
  { id: 1, descricao: "EBD - Escola Bíblica Dominical", departamento: "ensino", ativo: true },
  { id: 2, descricao: "Mocidade", departamento: "juventude", ativo: true },
  { id: 3, descricao: "CIAs - Crianças", departamento: "infantil", ativo: true },
  { id: 4, descricao: "Grupo de Louvor", departamento: "musica", ativo: true },
  { id: 5, descricao: "Evangelismo", departamento: "missoes", ativo: true },
  { id: 6, descricao: "Visitação", departamento: "pastoral", ativo: true },
  { id: 7, descricao: "Secretaria", departamento: "administrativo", ativo: true },
  { id: 8, descricao: "Tesouraria", departamento: "administrativo", ativo: true },
  { id: 9, descricao: "Patrimônio", departamento: "administrativo", ativo: true },
  { id: 10, descricao: "Comunicação", departamento: "midia", ativo: true }
];

// Categorias de participação
export const CATEGORIAS_PARTICIPACAO = [
  { 
    id: 1, 
    descricao: "Sugestão",
    multilingual: {
      pt: "Sugestão",
      en: "Suggestion", 
      es: "Sugerencia",
      it: "Suggerimento"
    },
    cor: "#3498db",
    ativo: true
  },
  { 
    id: 2, 
    descricao: "Participação",
    multilingual: {
      pt: "Participação",
      en: "Participation", 
      es: "Participación",
      it: "Partecipazione"
    },
    cor: "#2ecc71",
    ativo: true
  },
  { 
    id: 3, 
    descricao: "Dúvidas",
    multilingual: {
      pt: "Dúvidas",
      en: "Doubt(s)", 
      es: "Dudas",
      it: "Dubbi"
    },
    cor: "#f39c12",
    ativo: true
  },
  { 
    id: 4, 
    descricao: "Experiência",
    multilingual: {
      pt: "Experiência",
      en: "Experience", 
      es: "Experiencia",
      it: "Esperienza"
    },
    cor: "#9b59b6",
    ativo: true
  }
];

// Países para formulário exterior
export const PAISES = [
  { id: 1, descricao: "Estados Unidos", codigo: "US", continente: "america_norte", ativo: true },
  { id: 2, descricao: "Canadá", codigo: "CA", continente: "america_norte", ativo: true },
  { id: 3, descricao: "México", codigo: "MX", continente: "america_norte", ativo: true },
  { id: 4, descricao: "Argentina", codigo: "AR", continente: "america_sul", ativo: true },
  { id: 5, descricao: "Chile", codigo: "CL", continente: "america_sul", ativo: true },
  { id: 6, descricao: "Uruguai", codigo: "UY", continente: "america_sul", ativo: true },
  { id: 7, descricao: "Paraguai", codigo: "PY", continente: "america_sul", ativo: true },
  { id: 8, descricao: "Bolívia", codigo: "BO", continente: "america_sul", ativo: true },
  { id: 9, descricao: "Peru", codigo: "PE", continente: "america_sul", ativo: true },
  { id: 10, descricao: "Equador", codigo: "EC", continente: "america_sul", ativo: true },
  { id: 11, descricao: "Colômbia", codigo: "CO", continente: "america_sul", ativo: true },
  { id: 12, descricao: "Venezuela", codigo: "VE", continente: "america_sul", ativo: true },
  { id: 13, descricao: "Portugal", codigo: "PT", continente: "europa", ativo: true },
  { id: 14, descricao: "Espanha", codigo: "ES", continente: "europa", ativo: true },
  { id: 15, descricao: "França", codigo: "FR", continente: "europa", ativo: true },
  { id: 16, descricao: "Itália", codigo: "IT", continente: "europa", ativo: true },
  { id: 17, descricao: "Reino Unido", codigo: "GB", continente: "europa", ativo: true },
  { id: 18, descricao: "Alemanha", codigo: "DE", continente: "europa", ativo: true },
  { id: 19, descricao: "Suíça", codigo: "CH", continente: "europa", ativo: true },
  { id: 20, descricao: "Japão", codigo: "JP", continente: "asia", ativo: true }
];

// Estados brasileiros
export const ESTADOS_BRASIL = [
  { sigla: "AC", nome: "Acre", regiao: "Norte" },
  { sigla: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { sigla: "AP", nome: "Amapá", regiao: "Norte" },
  { sigla: "AM", nome: "Amazonas", regiao: "Norte" },
  { sigla: "BA", nome: "Bahia", regiao: "Nordeste" },
  { sigla: "CE", nome: "Ceará", regiao: "Nordeste" },
  { sigla: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { sigla: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { sigla: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { sigla: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { sigla: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { sigla: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { sigla: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { sigla: "PA", nome: "Pará", regiao: "Norte" },
  { sigla: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { sigla: "PR", nome: "Paraná", regiao: "Sul" },
  { sigla: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { sigla: "PI", nome: "Piauí", regiao: "Nordeste" },
  { sigla: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { sigla: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { sigla: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { sigla: "RO", nome: "Rondônia", regiao: "Norte" },
  { sigla: "RR", nome: "Roraima", regiao: "Norte" },
  { sigla: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { sigla: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { sigla: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { sigla: "TO", nome: "Tocantins", regiao: "Norte" }
];

// Grupos de assistência da Nova Brasília I
export const GRUPOS_ASSISTENCIA = [
  { 
    id: 1, 
    nome: "Grupo 1 - Adultos", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 2, 
    nome: "Grupo 2 - Jovens", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 3, 
    nome: "Grupo 3 - Adolescentes", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 4, 
    nome: "Grupo 4 - Crianças", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 5, 
    nome: "Grupo 5 - Terceira Idade", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 6, 
    nome: "Grupo 6 - Casais", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  },
  { 
    id: 7, 
    nome: "Grupo 7 - Solteiros", 
    responsavel: "João Silva", 
    secretario: "Maria Santos",
    igreja: "Nova Brasília I",
    ativo: true
  }
];

// Textos multilíngues
export const TEXTOS_SISTEMA = {
  campos: {
    nome: {
      pt: "Nome Completo",
      en: "Full Name", 
      es: "Nombre Completo",
      it: "Nome Completo"
    },
    email: {
      pt: "E-mail",
      en: "Email",
      es: "Correo Electrónico", 
      it: "Email"
    },
    telefone: {
      pt: "Telefone",
      en: "Phone",
      es: "Teléfono",
      it: "Telefono"
    },
    cidade: {
      pt: "Cidade",
      en: "City",
      es: "Ciudad",
      it: "Città"
    },
    estado: {
      pt: "Estado",
      en: "State",
      es: "Estado",
      it: "Stato"
    },
    pais: {
      pt: "País",
      en: "Country",
      es: "País",
      it: "Paese"
    },
    denominacao: {
      pt: "Denominação",
      en: "Denomination",
      es: "Denominación",
      it: "Denominazione"
    },
    funcao: {
      pt: "Função",
      en: "Function",
      es: "Función",
      it: "Funzione"
    },
    igreja: {
      pt: "Igreja",
      en: "Church",
      es: "Iglesia",
      it: "Chiesa"
    },
    pastor: {
      pt: "Pastor",
      en: "Pastor",
      es: "Pastor",
      it: "Pastore"
    }
  },
  mensagens: {
    periodo_encerrado: {
      pt: "Período de participação encerrado! O período de Participações da Escola Bíblica Dominical é sempre das 11h de Domingo até 23h59 de Quinta-feira.",
      en: "Participation period closed! The participation period for Sunday School is always from 11:00 AM on Sunday to 11:59 PM on Thursday (Brasilia time GMT-3).",
      es: "¡Período de participación cerrado! El período de participaciones de la Escuela Dominical es siempre de las 11:00 a.m. del domingo al 23:59 p.m. del jueves (hora de Brasilia GMT-3).",
      it: "Periodo di partecipazione chiuso! Il periodo di partecipazione della Scuola Domenicale è sempre dalle 11:00 di domenica alle 23:59 di giovedì (ora di Brasilia GMT-3)."
    },
    aceite_termo: {
      pt: "Li e estou de Acordo com o Termo",
      en: "I have read and agree to the Term",
      es: "He leído y estoy de acuerdo con el Término",
      it: "Ho letto e sono d'accordo con il Termine"
    },
    enviar: {
      pt: "Enviar",
      en: "Send",
      es: "Enviar",
      it: "Inviare"
    },
    sucesso_participacao: {
      pt: "Participação registrada com sucesso!",
      en: "Participation registered successfully!",
      es: "¡Participación registrada con éxito!",
      it: "Partecipazione registrata con successo!"
    }
  }
};

// Regras de negócio
export const REGRAS_NEGOCIO = {
  formulario_brasil: {
    cpf_obrigatorio: true,
    consulta_automatica_membro: true,
    preenchimento_automatico_membro: true
  },
  formulario_exterior: {
    pais_obrigatorio: true,
    igreja_pastor_obrigatorio: true,
    telefone_internacional: true
  },
  validacoes: {
    uma_participacao_por_ebd: true,
    moderacao_automatica: false,
    aprovacao_admin: true
  },
  limites: {
    participacoes_por_ip_dia: 5,
    tamanho_maximo_contribuicao: 3000,
    tempo_minimo_entre_participacoes: 60 // segundos
  }
};

// Funções utilitárias
export const UTILS = {
  // Validar CPF brasileiro
  validarCPF: (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  },

  // Verificar período de participação
  verificarPeriodoParticipacao: () => {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0=domingo, 4=quinta
    const hora = agora.getHours();
    
    // Domingo às 11h até Quinta às 23h59
    if (diaSemana === 0 && hora >= 11) return true;
    if (diaSemana >= 1 && diaSemana <= 3) return true;
    if (diaSemana === 4 && hora <= 23) return true;
    
    return false;
  },

  // Formatar telefone brasileiro
  formatarTelefoneBrasil: (telefone) => {
    const limpo = telefone.replace(/\D/g, '');
    if (limpo.length === 11) {
      return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (limpo.length === 10) {
      return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  },

  // Obter texto multilíngue
  obterTexto: (chave, idioma = 'pt') => {
    const caminho = chave.split('.');
    let texto = TEXTOS_SISTEMA;
    
    for (const parte of caminho) {
      texto = texto[parte];
      if (!texto) return chave;
    }
    
    return texto[idioma] || texto.pt || chave;
  }
};

export default {
  EBD_CONFIG,
  DENOMINACOES,
  FUNCOES_IGREJA,
  TRABALHOS_MINISTERIOS,
  CATEGORIAS_PARTICIPACAO,
  PAISES,
  ESTADOS_BRASIL,
  GRUPOS_ASSISTENCIA,
  TEXTOS_SISTEMA,
  REGRAS_NEGOCIO,
  UTILS
};
