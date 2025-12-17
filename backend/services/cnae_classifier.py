"""
Serviço de classificação de CNAEs para setores estratégicos do hotel.
"""
import json
from pathlib import Path
from typing import Dict, List, Optional

# Caminho para o arquivo de CNAEs
DATA_PATH = Path(__file__).parent.parent / "data" / "cnaes.json"


class CNAEClassifier:
    """Classifica empresas por CNAE em setores estratégicos para o hotel."""

    def __init__(self):
        self.cnaes_data = self._load_cnaes()
        self.cnae_map = self._build_cnae_map()

    def _load_cnaes(self) -> dict:
        """Carrega dados de CNAEs do arquivo JSON."""
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def _build_cnae_map(self) -> Dict[str, dict]:
        """Constrói mapa de CNAE para lookup rápido."""
        return {
            cnae["codigo"]: cnae
            for cnae in self.cnaes_data["cnaes_estrategicos"]
        }

    def classificar(self, cnae_codigo: str) -> Optional[dict]:
        """
        Classifica um CNAE e retorna informações do setor.

        Args:
            cnae_codigo: Código CNAE no formato XX.XX-X/XX ou XXXX-X/XX

        Returns:
            Dict com setor_hotel, relevancia e impacto ou None se não estratégico
        """
        # Normaliza o código (remove pontos, mantém hífen e barra)
        cnae_normalizado = cnae_codigo.replace(".", "").strip()

        if cnae_normalizado in self.cnae_map:
            cnae_info = self.cnae_map[cnae_normalizado]
            return {
                "codigo": cnae_info["codigo"],
                "descricao": cnae_info["descricao"],
                "setor_hotel": cnae_info["setor_hotel"],
                "relevancia": cnae_info["relevancia"],
                "impacto": cnae_info.get("impacto", "")
            }
        return None

    def is_estrategico(self, cnae_codigo: str) -> bool:
        """Verifica se um CNAE é estratégico para o hotel."""
        cnae_normalizado = cnae_codigo.replace(".", "").strip()
        return cnae_normalizado in self.cnae_map

    def get_setor(self, cnae_codigo: str) -> Optional[str]:
        """Retorna o setor do hotel para um CNAE."""
        info = self.classificar(cnae_codigo)
        return info["setor_hotel"] if info else None

    def get_relevancia(self, cnae_codigo: str) -> Optional[str]:
        """Retorna a relevância de um CNAE (parceria, concorrencia, demanda, fornecedor)."""
        info = self.classificar(cnae_codigo)
        return info["relevancia"] if info else None

    def listar_cnaes_por_setor(self, setor: str) -> List[dict]:
        """Lista todos os CNAEs de um setor específico."""
        return [
            cnae for cnae in self.cnaes_data["cnaes_estrategicos"]
            if cnae["setor_hotel"] == setor
        ]

    def listar_cnaes_por_relevancia(self, relevancia: str) -> List[dict]:
        """Lista todos os CNAEs por tipo de relevância."""
        return [
            cnae for cnae in self.cnaes_data["cnaes_estrategicos"]
            if cnae["relevancia"] == relevancia
        ]

    def get_todos_cnaes(self) -> List[str]:
        """Retorna lista de todos os códigos CNAE estratégicos."""
        return list(self.cnae_map.keys())

    def get_setores(self) -> Dict[str, dict]:
        """Retorna resumo de todos os setores."""
        return self.cnaes_data.get("setores_resumo", {})

    def get_cnaes_para_api(self) -> List[str]:
        """Retorna lista de CNAEs formatados para consulta em API."""
        return [codigo.replace("-", "").replace("/", "") for codigo in self.cnae_map.keys()]


# Instância global para uso no app
classifier = CNAEClassifier()


def classificar_empresa(cnae_principal: str) -> dict:
    """
    Função utilitária para classificar uma empresa pelo CNAE principal.

    Args:
        cnae_principal: Código CNAE principal da empresa

    Returns:
        Dict com classificação ou dict vazio se não estratégico
    """
    resultado = classifier.classificar(cnae_principal)
    if resultado:
        return resultado
    return {
        "codigo": cnae_principal,
        "descricao": "Não classificado",
        "setor_hotel": "Outros",
        "relevancia": "outros",
        "impacto": ""
    }
