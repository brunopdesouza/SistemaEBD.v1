// src/hooks/useExcelReader.js
import { useState } from 'react';

export const useExcelReader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const readExcelFile = async (file) => {
    setLoading(true);
    setError(null);

    try {
      // Detectar padrão baseado no nome do arquivo
      const pattern = detectImportPattern(file.name);
      const data = await simulateExcelReading(file, pattern);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Detectar padrão de importação
  const detectImportPattern = (fileName) => {
    const name = fileName.toLowerCase();
    
    if (name.includes('grupo') || name.includes('participantes')) {
      return 'lista_participantes';
    } else if (name.includes('cadastro') || name.includes('membros')) {
      return 'cadastro_completo';
    } else if (name.includes('simples') || name.includes('basico')) {
      return 'importacao_simples';
    } else {
      return 'padrao_geral';
    }
  };

  // Simular leitura com diferentes padrões
  const simulateExcelReading = async (file, pattern) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let membros = [];

        switch (pattern) {
          case 'lista_participantes':
            membros = getListaParticipantesData();
            break;
          case 'cadastro_completo':
            membros = getCadastroCompletoData();
            break;
          case 'importacao_simples':
            membros = getImportacaoSimplesData();
            break;
          default:
            membros = getPadraoGeralData();
        }

        resolve(membros);
      }, 1500);
    });
  };

  // PADRÃO 1: Lista de Participantes (baseado no PDF que você enviou)
  const getListaParticipantesData = () => {
    return [
      {
        nome: 'ANA ISADORA M. XAVIER',
        cpf: generateCPF('19/08/2013'),
        sexo: 'F',
        classe: 'Criança',
        situacao: 'Membro',
        telefone: '(27) 99901-3622',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2013-08-19',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'APARECIDA P. C. CAMISÃO',
        cpf: generateCPF('01/12/1972'),
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99807-3818',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1972-12-01',
        observacoes: 'Tel. Residencial: (27) 3286-6217'
      },
      {
        nome: 'BRUNO PEREIRA SOUZA',
        cpf: generateCPF('12/05/1986'),
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99940-2022',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1986-05-12',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'FABIO GONÇALVES',
        cpf: generateCPF('12/02/1977'),
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99957-3838',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1977-02-12',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'FILIPY L. DAMACENA',
        cpf: generateCPF('23/02/1991'),
        sexo: 'M',
        classe: 'Jovem',
        situacao: 'Membro',
        telefone: '(27) 99634-2243',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1991-02-23',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'GABRIELA M. S. MONTEIRO',
        cpf: generateCPF('15/12/1984'),
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99574-7960',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1984-12-15',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'GLAUCIMAR M. SILVA',
        cpf: generateCPF('26/01/1971'),
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99986-7074',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1971-01-26',
        observacoes: 'Tel. Residencial: (27) 8801-0926'
      },
      {
        nome: 'JACIMARA M. XAVIER',
        cpf: generateCPF('01/09/1980'),
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99901-3622',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1980-09-01',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'JOSE CARLOS DAMACENA',
        cpf: generateCPF('18/04/1966'),
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99975-5080',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1966-04-18',
        observacoes: 'Lista de Participantes - Grupo 2'
      },
      {
        nome: 'JÚLIO CESAR B. VAZ',
        cpf: generateCPF('15/07/1952'),
        sexo: 'M',
        classe: 'Terceira Idade',
        situacao: 'Membro',
        telefone: '(27) 99999-8153',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 5 - Terceira Idade',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1952-07-15',
        observacoes: 'Membro da Terceira Idade'
      },
      {
        nome: 'WALACE C. ANDRADE',
        cpf: generateCPF('19/06/1965'),
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Responsável do Grupo',
        telefone: '(27) 99764-9776',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1965-06-19',
        observacoes: 'Responsável do Grupo 2 - Tel. Comercial: (27) 3386-3588'
      },
      {
        nome: 'GABRIEL GOMES CARMO',
        cpf: generateCPF('10/02/2018'),
        sexo: 'M',
        classe: 'Criança',
        situacao: 'Membro',
        telefone: '(27) 99999-3575',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 4 - Crianças',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2018-02-10',
        observacoes: 'Criança - Grupo 4'
      },
      {
        nome: 'ANDRÉ C. CAETANO',
        cpf: generateCPF('21/12/2004'),
        sexo: 'M',
        classe: 'Jovem',
        situacao: 'Membro',
        telefone: '(27) 99807-3818',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - Jovens',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2004-12-21',
        observacoes: 'Jovem - Tel. Residencial: (27) 3286-6217'
      },
      {
        nome: 'GUILHERME S. CARVALHO',
        cpf: generateCPF('03/04/2007'),
        sexo: 'M',
        classe: 'Adolescente',
        situacao: 'Membro',
        telefone: '(27) 99902-1268',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 3 - Adolescentes',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2007-04-03',
        observacoes: 'Adolescente - Grupo 3'
      },
      {
        nome: 'MANUELLA C. FREITAS',
        cpf: generateCPF('12/03/2007'),
        sexo: 'F',
        classe: 'Adolescente',
        situacao: 'Membro',
        telefone: '(27) 99242-0613',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 3 - Adolescentes',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2007-03-12',
        observacoes: 'Adolescente - Tel. Residencial: (27) 3344-3147'
      },
      {
        nome: 'REBECA M. XAVIER',
        cpf: generateCPF('25/08/2006'),
        sexo: 'F',
        classe: 'Adolescente',
        situacao: 'Membro',
        telefone: '(27) 99901-3622',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 3 - Adolescentes',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '2006-08-25',
        observacoes: 'Adolescente - Grupo 3'
      }
    ];
  };

  // PADRÃO 2: Cadastro Completo (mais detalhado)
  const getCadastroCompletoData = () => {
    return [
      {
        nome: 'WALACE CARDOSO DE ANDRADE',
        cpf: '123.456.789-10',
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Responsável do Grupo',
        telefone: '(27) 99764-9776',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Rua Principal, 100 - Nova Brasília I - ES',
        data_nascimento: '1965-06-19',
        observacoes: 'Responsável do Grupo 2 - Telefone Comercial: (27) 3386-3588'
      },
      {
        nome: 'SYMONE F. S. ANDRADE',
        cpf: '987.654.321-00',
        sexo: 'F',
        classe: 'Adulto',
        situacao: 'Secretário do Grupo',
        telefone: '(27) 99783-7060',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 2 - WALACE',
        endereco: 'Rua Principal, 100 - Nova Brasília I - ES',
        data_nascimento: '1971-10-04',
        observacoes: 'Secretária do Grupo 2 - Tel. Residencial: (27) 3031-3606'
      }
    ];
  };

  // PADRÃO 3: Importação Simples (dados básicos)
  const getImportacaoSimplesData = () => {
    return [
      {
        nome: 'MEMBRO SIMPLES 1',
        cpf: '111.111.111-11',
        sexo: 'M',
        classe: 'Adulto',
        situacao: 'Membro',
        telefone: '(27) 99999-1111',
        igreja: 'Nova Brasília I',
        grupo_assistencia: 'Grupo 1 - Adultos',
        endereco: 'Nova Brasília I - ES',
        data_nascimento: '1980-01-01',
        observacoes: 'Importação simples'
      }
    ];
  };

  // PADRÃO 4: Padrão Geral (mix de diferentes tipos)
  const getPadraoGeralData = () => {
    return [
      ...getListaParticipantesData().slice(0, 3),
      ...getCadastroCompletoData()
    ];
  };

  // Gerar CPF baseado na data de nascimento (simulação)
  const generateCPF = (birthDate) => {
    const [day, month, year] = birthDate.split('/');
    const base = `${day}${month}${year.slice(-2)}`;
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${base.slice(0,3)}.${base.slice(3,6)}.${randomSuffix}-${randomDigits}`;
  };

  // Função para leitura real do Excel (para uso futuro)
  const readRealExcelFile = async (file) => {
    // Implementação com XLSX quando necessário
    return new Promise((resolve, reject) => {
      // Código para ler Excel real...
      resolve([]);
    });
  };

  // Obter informações do padrão detectado
  const getPatternInfo = (fileName) => {
    const pattern = detectImportPattern(fileName);
    const patterns = {
      'lista_participantes': {
        name: 'Lista de Participantes',
        description: 'Baseado na lista oficial do grupo de assistência',
        expectedFields: ['Nome', 'Data Nascimento', 'Telefone', 'Grupo'],
        memberCount: 16
      },
      'cadastro_completo': {
        name: 'Cadastro Completo',
        description: 'Dados completos de membros com todas as informações',
        expectedFields: ['Nome', 'CPF', 'Endereço', 'Telefone', 'Situação'],
        memberCount: 2
      },
      'importacao_simples': {
        name: 'Importação Simples',
        description: 'Dados básicos para importação rápida',
        expectedFields: ['Nome', 'CPF', 'Classe'],
        memberCount: 1
      },
      'padrao_geral': {
        name: 'Padrão Geral',
        description: 'Mix de diferentes tipos de dados',
        expectedFields: ['Nome', 'CPF', 'Telefone'],
        memberCount: 5
      }
    };

    return patterns[pattern] || patterns['padrao_geral'];
  };

  return { 
    readExcelFile, 
    loading, 
    error, 
    detectImportPattern, 
    getPatternInfo 
  };
};
