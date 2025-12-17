"""
Endpoints da API para análise de concorrência hoteleira.
"""
from fastapi import APIRouter, Query
from typing import Optional
import json
from pathlib import Path

router = APIRouter(prefix="/concorrencia", tags=["concorrencia"])

DATA_PATH = Path(__file__).parent.parent / "data" / "concorrencia.json"


def _load_concorrencia() -> dict:
    """Carrega dados de concorrência do arquivo JSON."""
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"hoteis": [], "analise_mercado": {}, "hotel_proposto": {}}


@router.get("/hoteis")
async def listar_hoteis(
    cidade: Optional[str] = Query(None, description="Filtrar por cidade"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (hotel, pousada, hotel-fazenda)")
):
    """
    Lista todos os hotéis concorrentes na região.
    """
    data = _load_concorrencia()
    hoteis = data.get("hoteis", [])

    if cidade:
        hoteis = [h for h in hoteis if cidade.lower() in h.get("cidade", "").lower()]

    if tipo:
        hoteis = [h for h in hoteis if h.get("tipo") == tipo]

    return {
        "total": len(hoteis),
        "hoteis": hoteis
    }


@router.get("/analise-mercado")
async def get_analise_mercado():
    """
    Retorna análise geral do mercado hoteleiro regional.
    """
    data = _load_concorrencia()
    return data.get("analise_mercado", {})


@router.get("/hotel-proposto")
async def get_hotel_proposto():
    """
    Retorna especificações do hotel proposto.
    """
    data = _load_concorrencia()
    return data.get("hotel_proposto", {})


@router.get("/comparativo-tarifas")
async def get_comparativo_tarifas():
    """
    Retorna comparativo de tarifas entre hotéis da região.
    """
    data = _load_concorrencia()
    hoteis = data.get("hoteis", [])
    hotel_proposto = data.get("hotel_proposto", {})

    # Agrupar por cidade
    por_cidade = {}
    for hotel in hoteis:
        cidade = hotel.get("cidade", "Outros")
        if cidade not in por_cidade:
            por_cidade[cidade] = []
        por_cidade[cidade].append({
            "nome": hotel.get("nome"),
            "diaria": hotel.get("diaria_media"),
            "nota": hotel.get("nota_avaliacao"),
            "quartos": hotel.get("quartos")
        })

    # Calcular médias
    media_ribeirao = sum(
        h["diaria"] for h in por_cidade.get("Ribeirao Pires", [])
    ) / max(1, len(por_cidade.get("Ribeirao Pires", [])))

    media_regiao = sum(
        h.get("diaria_media", 0) for h in hoteis
    ) / max(1, len(hoteis))

    return {
        "por_cidade": por_cidade,
        "media_ribeirao_pires": round(media_ribeirao, 2),
        "media_regiao": round(media_regiao, 2),
        "hotel_proposto": {
            "diaria_min": hotel_proposto.get("diaria_projetada", {}).get("min", 250),
            "diaria_max": hotel_proposto.get("diaria_projetada", {}).get("max", 350),
            "diaria_target": hotel_proposto.get("diaria_media_target", 280)
        },
        "posicionamento": "O hotel proposto se posiciona no segmento upscale, entre a média de Ribeirão Pires e os hotéis superiores de Santo André"
    }


@router.get("/gap-mercado")
async def get_gap_mercado():
    """
    Analisa o gap de mercado e oportunidades.
    """
    data = _load_concorrencia()
    hoteis = data.get("hoteis", [])
    analise = data.get("analise_mercado", {})
    hotel_proposto = data.get("hotel_proposto", {})

    # Hotéis em Ribeirão Pires
    hoteis_rp = [h for h in hoteis if "Ribeirao Pires" in h.get("cidade", "")]
    leitos_rp = sum(h.get("leitos", 0) for h in hoteis_rp)

    # Hotéis upscale na região (diária > R$300)
    hoteis_upscale = [h for h in hoteis if h.get("diaria_media", 0) >= 300]
    hoteis_upscale_rp = [h for h in hoteis_upscale if "Ribeirao Pires" in h.get("cidade", "")]

    # Com rooftop ou diferencial similar
    hoteis_com_rooftop = []  # Nenhum na região

    return {
        "situacao_atual": {
            "hoteis_ribeirao_pires": len(hoteis_rp),
            "leitos_ribeirao_pires": leitos_rp,
            "hoteis_upscale_ribeirao_pires": len(hoteis_upscale_rp),
            "hoteis_com_rooftop_regiao": len(hoteis_com_rooftop)
        },
        "gaps_identificados": [
            {
                "gap": "Ausência de hotel upscale",
                "descricao": "Não há hotel categoria superior em Ribeirão Pires",
                "oportunidade": "Alta"
            },
            {
                "gap": "Falta de centro de convenções",
                "descricao": "Cidade não possui espaço integrado para eventos corporativos + hospedagem",
                "oportunidade": "Alta"
            },
            {
                "gap": "Inexistência de rooftop bar",
                "descricao": "Não há bar panorâmico na região do ABC",
                "oportunidade": "Alta"
            },
            {
                "gap": "Baixa oferta de leitos",
                "descricao": f"Apenas {leitos_rp} leitos para 315 mil visitantes/ano",
                "oportunidade": "Alta"
            }
        ],
        "hotel_proposto_impacto": {
            "novos_leitos": hotel_proposto.get("leitos_estimados", 110),
            "aumento_oferta": hotel_proposto.get("aumento_oferta_local", "40%"),
            "diferenciais_unicos": hotel_proposto.get("diferenciais", [])
        },
        "conclusao": analise.get("oportunidade", "")
    }


@router.get("/{hotel_id}")
async def get_hotel(hotel_id: int):
    """
    Retorna detalhes de um hotel específico.
    """
    data = _load_concorrencia()
    for hotel in data.get("hoteis", []):
        if hotel.get("id") == hotel_id:
            return hotel
    return {"error": "Hotel não encontrado"}
