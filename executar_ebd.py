#!/usr/bin/env python3
"""
Sistema EBD - Script de Execução Principal
Facilita a execução do processamento PDF com integração Supabase
"""

import sys
import os
from pathlib import Path

# Adicionar pasta do projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config.ebd_config import EBDConfig, get_config
from scripts.ebd_pdf_integration import EBDPDFProcessor


def mostrar_ajuda():
    """Mostra ajuda de uso"""
    print("""
🚀 SISTEMA EBD - PROCESSAMENTO PDF INTEGRADO

USO BÁSICO:
  python executar_ebd.py

USO AVANÇADO:
  python executar_ebd.py --usuario pastor@icm.com --pdf arquivo.pdf
  python executar_ebd.py --pasta "C:\\Minha\\Pasta" --no-save
  python executar_ebd.py --config

PARÂMETROS:
  --usuario EMAIL      Email do usuário para autenticação (padrão: pastor@icm.com)
  --pdf ARQUIVO        Caminho específico para PDF
  --pasta CAMINHO      Pasta para busca automática de PDF
  --no-save           Não salvar no banco (apenas processar)
  --config            Mostrar configuração atual
  --help              Mostrar esta ajuda

EXEMPLOS:
  # Processamento automático (busca PDF na pasta padrão)
  python executar_ebd.py
  
  # Usar PDF específico
  python executar_ebd.py --pdf "C:\\Downloads\\questionario_semana25.pdf"
  
  # Processar sem salvar no banco
  python executar_ebd.py --no-save
  
  # Usar usuário diferente
  python executar_ebd.py --usuario admin@sistema.com

CONFIGURAÇÃO:
  1. Crie arquivo .env com suas credenciais Supabase
  2. Configure PASTA_AUTOMACOES se necessário
  3. Execute: python executar_ebd.py --config (para validar)

DEPENDÊNCIAS:
  pip install -r requirements.txt
""")


def main():
    """Função principal simplificada"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Sistema EBD - Processamento PDF Integrado',
        add_help=False
    )
    
    parser.add_argument('--usuario', default='pastor@icm.com',
                       help='Email do usuário para autenticação')
    parser.add_argument('--pdf', help='Caminho para arquivo PDF específico')
    parser.add_argument('--pasta', help='Pasta para busca automática')
    parser.add_argument('--no-save', action='store_true',
                       help='Não salvar no banco (apenas processar)')
    parser.add_argument('--config', action='store_true',
                       help='Mostrar configuração atual')
    parser.add_argument('--help', action='store_true',
                       help='Mostrar ajuda')
    parser.add_argument('--ambiente', default='producao',
                       choices=['producao', 'desenvolvimento', 'teste'],
                       help='Ambiente de execução')
    
    args = parser.parse_args()
    
    # Mostrar ajuda
    if args.help:
        mostrar_ajuda()
        return 0
    
    # Carregar configuração
    config_class = get_config(args.ambiente)
    config = config_class()
    
    # Mostrar configuração
    if args.config:
        config.mostrar_configuracao()
        if config.validar_configuracao():
            print("\n✅ Sistema pronto para uso!")
        else:
            print("\n❌ Configure as variáveis de ambiente antes de usar")
            return 1
        return 0
    
    # Validar configuração
    if not config.validar_configuracao():
        print("\n❌ Configuração inválida. Use --config para verificar")
        return 1
    
    print("=" * 70)
    print("🚀 SISTEMA EBD - PROCESSAMENTO PDF INTEGRADO")
    print("=" * 70)
    
    try:
        # Inicializar processador
        processor = EBDPDFProcessor(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
        
        # Definir PDF
        pdf_path = args.pdf
        pasta_busca = args.pasta or config.PASTA_AUTOMACOES
        
        if not pdf_path:
            print(f"🔍 Buscando PDF em: {pasta_busca}")
            pdf_path = processor.buscar_pdf_automatico(pasta_busca)
            
        if not pdf_path:
            print("❌ PDF não encontrado!")
            print(f"📁 Verifique se há arquivos PDF em: {pasta_busca}")
            return 1
        
        # Verificar se arquivo existe
        if not os.path.exists(pdf_path):
            print(f"❌ Arquivo não encontrado: {pdf_path}")
            return 1
        
        # Mostrar informações
        print(f"📄 PDF: {os.path.basename(pdf_path)}")
        print(f"👤 Usuário: {args.usuario}")
        print(f"💾 Salvar no banco: {'Não' if args.no_save else 'Sim'}")
        print(f"🌍 Ambiente: {args.ambiente}")
        
        # Confirmar execução
        if args.ambiente == 'producao':
            resposta = input("\n❓ Continuar com o processamento? [S/n]: ")
            if resposta.lower() in ['n', 'no', 'não']:
                print("❌ Processamento cancelado pelo usuário")
                return 0
        
        print("\n🚀 Iniciando processamento...")
        
        # Processar
        resultado = processor.processar_pdf_completo(
            pdf_path, 
            args.usuario, 
            salvar_no_banco=not args.no_save
        )
        
        # Gerar relatório
        processor.gerar_relatorio_final()
        
        # Salvar resultado em arquivo local (opcional)
        if resultado.get('salvo_banco'):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            arquivo_resultado = f"resultado_processamento_{timestamp}.json"
            
            # Preparar dados para JSON
            resultado_json = {
                'arquivo_processado': resultado['arquivo_processado'],
                'total_perguntas': resultado['total_perguntas'],
                'total_membros': resultado['total_membros'],
                'questionario_id': resultado.get('questionario_id'),
                'timestamp': timestamp,
                'usuario': args.usuario,
                'status': resultado['status']
            }
            
            import json
            with open(arquivo_resultado, 'w', encoding='utf-8') as f:
                json.dump(resultado_json, f, indent=2, ensure_ascii=False)
            
            print(f"📁 Resultado salvo em: {arquivo_resultado}")
        
        print("\n🎉 PROCESSAMENTO CONCLUÍDO COM SUCESSO!")
        return 0
        
    except KeyboardInterrupt:
        print("\n❌ Processamento interrompido pelo usuário")
        return 130
        
    except Exception as e:
        print(f"\n❌ ERRO FATAL: {str(e)}")
        
        # Log detalhado em modo debug
        if config.DEBUG:
            import traceback
            print("\n🔍 STACK TRACE:")
            traceback.print_exc()
        
        return 1


if __name__ == "__main__":
    # Importações que podem falhar
    try:
        from datetime import datetime
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        print("📦 Execute: pip install -r requirements.txt")
        sys.exit(1)
    
    # Verificar Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ é necessário")
        sys.exit(1)
    
    sys.exit(main())
