#!/usr/bin/env python3
"""
Sistema EBD - Configurações
Centralizadas para facilitar manutenção
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Carregar variáveis de ambiente
load_dotenv()

class EBDConfig:
    """Configurações centralizadas do Sistema EBD"""
    
    # ===================================================================
    # CONFIGURAÇÕES SUPABASE
    # ===================================================================
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://seu-projeto.supabase.co')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', '')
    
    # ===================================================================
    # CONFIGURAÇÕES DE PASTAS
    # ===================================================================
    PASTA_AUTOMACOES = os.getenv('PASTA_AUTOMACOES', r"C:\Users\bruno.souza\Desktop\Automações\Contribuicao")
    PASTA_LOGS = os.getenv('PASTA_LOGS', './logs')
    PASTA_BACKUP = os.getenv('PASTA_BACKUP', './backup')
    PASTA_TEMP = os.getenv('PASTA_TEMP', './temp')
    
    # ===================================================================
    # CONFIGURAÇÕES DE USUÁRIOS PADRÃO
    # ===================================================================
    USUARIOS_TESTE = {
        'admin': 'admin@sistema.com',
        'pastor': 'pastor@icm.com',
        'secretaria': 'secretaria@icm.com'
    }
    
    # ===================================================================
    # CONFIGURAÇÕES DE PROCESSAMENTO PDF
    # ===================================================================
    
    # Padrões de regex para identificar seções
    PADROES_SECAO = {
        'todos': [
            r'PARA\s+TODOS',
            r'ADULTOS',
            r'MEMBROS\s+GERAIS'
        ],
        'criancas': [
            r'PARA\s+CRIANÇAS',
            r'INTERMEDIÁRIOS',
            r'ADOLESCENTES',
            r'JUVENIS'
        ],
        'acessibilidade': [
            r'PARA\s+ACESSIBILIDADE',
            r'NECESSIDADES\s+ESPECIAIS',
            r'INCLUSÃO'
        ]
    }
    
    # Padrões para identificar perguntas
    PADROES_PERGUNTA = [
        r'^\s*(\d+)[\.)]\s*(.+)',  # 1. Pergunta ou 1) Pergunta
        r'^(\d+)\s*[-–]\s*(.+)',   # 1 - Pergunta
        r'^\s*PERGUNTA\s+(\d+)[:\s]*(.+)'  # PERGUNTA 1: texto
    ]
    
    # Palavras-chave para identificar início de resposta
    PALAVRAS_RESPOSTA = [
        'resposta:',
        'resp:',
        'r:',
        'solução:',
        'resolução:'
    ]
    
    # Linhas irrelevantes a serem filtradas
    LINHAS_IRRELEVANTES = [
        'Rua Torquato',
        'CEP',
        'Telefone',
        'www.igrejacristamaranata.org',
        'IGREJA CRISTÃ MARANATA',
        'TÓPICOS DAS RESPOSTAS',
        'Página',
        'Lição'
    ]
    
    # ===================================================================
    # CONFIGURAÇÕES DE CATEGORIZAÇÃO DE MEMBROS
    # ===================================================================
    
    CATEGORIAS_CRIANCAS = [
        'criança', 'crianças', 'infantil',
        'intermediário', 'intermediarios', 'intermediária',
        'adolescente', 'adolescentes', 'teen',
        'juvenil', 'juvenis', 'jovem'
    ]
    
    CATEGORIAS_ACESSIBILIDADE = [
        'acessibilidade', 'especial', 'inclusão',
        'deficiência', 'limitação', 'adaptado'
    ]
    
    # ===================================================================
    # CONFIGURAÇÕES DE LOGGING
    # ===================================================================
    
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    
    LOG_LEVELS = {
        'DEBUG': 10,
        'INFO': 20,
        'WARNING': 30,
        'ERROR': 40,
        'CRITICAL': 50
    }
    
    # ===================================================================
    # CONFIGURAÇÕES DE VALIDAÇÃO
    # ===================================================================
    
    # Tamanhos máximos
    MAX_PDF_SIZE_MB = 50
    MAX_EXCEL_SIZE_MB = 10
    MAX_PERGUNTA_LENGTH = 1000
    MAX_RESPOSTA_LENGTH = 5000
    
    # Confiança mínima para perguntas
    CONFIANCA_MINIMA = 0.7
    CONFIANCA_QUEBRA_PAGINA = 0.6
    
    # ===================================================================
    # CONFIGURAÇÕES DE BANCO DE DADOS
    # ===================================================================
    
    # Timeout para operações de banco
    DB_TIMEOUT = 30
    
    # Tamanho de lote para inserções
    BATCH_SIZE = 100
    
    # Tabelas principais
    TABELAS = {
        'igrejas': 'igrejas',
        'usuarios': 'usuarios',
        'membros': 'membros',
        'questionarios': 'questionarios_pdf',
        'perguntas': 'perguntas_extraidas',
        'respostas': 'respostas_membros',
        'logs': 'logs_sistema'
    }
    
    # ===================================================================
    # MÉTODOS DE CONFIGURAÇÃO
    # ===================================================================
    
    @classmethod
    def validar_configuracao(cls) -> bool:
        """Valida se as configurações estão corretas"""
        erros = []
        
        # Verificar Supabase
        if not cls.SUPABASE_URL or cls.SUPABASE_URL == 'https://seu-projeto.supabase.co':
            erros.append("SUPABASE_URL não configurada")
        
        if not cls.SUPABASE_SERVICE_KEY:
            erros.append("SUPABASE_SERVICE_KEY não configurada")
        
        # Verificar pastas
        try:
            Path(cls.PASTA_LOGS).mkdir(parents=True, exist_ok=True)
            Path(cls.PASTA_BACKUP).mkdir(parents=True, exist_ok=True)
            Path(cls.PASTA_TEMP).mkdir(parents=True, exist_ok=True)
        except Exception as e:
            erros.append(f"Erro ao criar pastas: {str(e)}")
        
        if erros:
            print("❌ Erros de configuração:")
            for erro in erros:
                print(f"  • {erro}")
            return False
        
        print("✅ Configuração validada com sucesso")
        return True
    
    @classmethod
    def mostrar_configuracao(cls):
        """Mostra configuração atual (sem dados sensíveis)"""
        print("📋 CONFIGURAÇÃO ATUAL:")
        print(f"  • Supabase URL: {cls.SUPABASE_URL}")
        print(f"  • Pasta Automações: {cls.PASTA_AUTOMACOES}")
        print(f"  • Pasta Logs: {cls.PASTA_LOGS}")
        print(f"  • Usuários teste: {', '.join(cls.USUARIOS_TESTE.keys())}")
        print(f"  • Máx PDF: {cls.MAX_PDF_SIZE_MB}MB")
        print(f"  • Confiança mínima: {cls.CONFIANCA_MINIMA}")
    
    @classmethod
    def criar_env_exemplo(cls):
        """Cria arquivo .env de exemplo"""
        conteudo_env = '''# Sistema EBD - Configurações
# Copie para .env e preencha com seus dados reais

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_service_role_aqui
SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Pastas
PASTA_AUTOMACOES=C:\\Users\\seu_usuario\\Desktop\\Automações\\Contribuicao
PASTA_LOGS=./logs
PASTA_BACKUP=./backup
PASTA_TEMP=./temp

# Debug
DEBUG=False
LOG_LEVEL=INFO
'''
        
        with open('.env.exemplo', 'w', encoding='utf-8') as f:
            f.write(conteudo_env)
        
        print("✅ Arquivo .env.exemplo criado")
        print("📝 Copie para .env e configure suas credenciais")


# Configurações específicas por ambiente
class EBDConfigProducao(EBDConfig):
    """Configurações para ambiente de produção"""
    DEBUG = False
    LOG_LEVEL = 'INFO'
    CONFIANCA_MINIMA = 0.8


class EBDConfigDesenvolvimento(EBDConfig):
    """Configurações para ambiente de desenvolvimento"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    CONFIANCA_MINIMA = 0.6


class EBDConfigTeste(EBDConfig):
    """Configurações para ambiente de teste"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    PASTA_AUTOMACOES = './test_data'
    CONFIANCA_MINIMA = 0.5


def get_config(ambiente: str = 'producao') -> EBDConfig:
    """Retorna configuração baseada no ambiente"""
    configs = {
        'producao': EBDConfigProducao,
        'desenvolvimento': EBDConfigDesenvolvimento,
        'teste': EBDConfigTeste
    }
    
    return configs.get(ambiente, EBDConfig)


if __name__ == "__main__":
    # Teste de configuração
    config = EBDConfig()
    config.mostrar_configuracao()
    config.validar_configuracao()
    config.criar_env_exemplo()
