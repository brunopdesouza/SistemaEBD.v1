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
  --no-save           Não salvar no banco
