"""
Endpoints da API para eventos turísticos de Ribeirão Pires.
"""
from fastapi import APIRouter, Query
from typing import Optional, List
import json
from pathlib import Path

router = APIRouter(prefix="/eventos", tags=["eventos"])

DATA_PATH = Path(__file__).parent.parent / "data" / "eventos.json"


def _load_eventos() -> dict:
    """Carrega dados de eventos do arquivo JSON."""
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"eventos": [], "resumo": {}}


@router.get("/")
async def listar_eventos(
    impacto: Optional[str] = Query(None, description="Filtrar por impacto (alto, medio, baixo)"),
    mes: Optional[int] = Query(None, ge=1, le=12, description="Filtrar por mês")
):
    """
    Lista todos os eventos turísticos de Ribeirão Pires.
    """
    data = _load_eventos()
    eventos = data.get("eventos", [])

    if impacto:
        eventos = [e for e in eventos if e.get("impacto_hotel") == impacto]

    if mes:
        eventos = [
            e for e in eventos
            if e.get("mes_inicio", 0) <= mes <= e.get("mes_fim", 0)
        ]

    return {
        "total": len(eventos),
        "eventos": eventos
    }


@router.get("/resumo")
async def get_resumo_eventos():
    """
    Retorna resumo geral dos eventos e impacto turístico.
    """
    data = _load_eventos()
    return data.get("resumo", {})


@router.get("/calendario")
async def get_calendario():
    """
    Retorna eventos organizados por mês para exibição em calendário/timeline.
    """
    data = _load_eventos()
    eventos = data.get("eventos", [])

    meses = {
        1: "Janeiro", 2: "Fevereiro", 3: "Marco", 4: "Abril",
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }

    calendario = []
    for mes_num, mes_nome in meses.items():
        eventos_mes = [
            {
                "id": e.get("id"),
                "nome": e.get("nome"),
                "publico": e.get("publico_estimado"),
                "impacto": e.get("impacto_hotel")
            }
            for e in eventos
            if e.get("mes_inicio", 0) <= mes_num <= e.get("mes_fim", 0)
        ]

        publico_total = sum(e["publico"] for e in eventos_mes)

        calendario.append({
            "mes": mes_num,
            "nome": mes_nome,
            "eventos": eventos_mes,
            "total_eventos": len(eventos_mes),
            "publico_total": publico_total,
            "classificacao": "alta" if publico_total > 50000 else "media" if publico_total > 10000 else "baixa"
        })

    return calendario


@router.get("/impacto-hotel")
async def get_impacto_hotel():
    """
    Analisa o impacto dos eventos para o hotel proposto.
    """
    data = _load_eventos()
    eventos = data.get("eventos", [])

    impacto_alto = [e for e in eventos if e.get("impacto_hotel") == "alto"]
    impacto_medio = [e for e in eventos if e.get("impacto_hotel") == "medio"]
    impacto_baixo = [e for e in eventos if e.get("impacto_hotel") == "baixo"]

    publico_alto = sum(e.get("publico_estimado", 0) for e in impacto_alto)
    publico_medio = sum(e.get("publico_estimado", 0) for e in impacto_medio)
    publico_baixo = sum(e.get("publico_estimado", 0) for e in impacto_baixo)

    # Estimativa de hospedagem (2% do público de alto impacto, 1% médio, 0.5% baixo)
    hospedagem_potencial = int(
        publico_alto * 0.02 +
        publico_medio * 0.01 +
        publico_baixo * 0.005
    )

    return {
        "eventos_alto_impacto": {
            "quantidade": len(impacto_alto),
            "publico_total": publico_alto,
            "eventos": [e.get("nome") for e in impacto_alto]
        },
        "eventos_medio_impacto": {
            "quantidade": len(impacto_medio),
            "publico_total": publico_medio,
            "eventos": [e.get("nome") for e in impacto_medio]
        },
        "eventos_baixo_impacto": {
            "quantidade": len(impacto_baixo),
            "publico_total": publico_baixo,
            "eventos": [e.get("nome") for e in impacto_baixo]
        },
        "hospedagem_potencial_ano": hospedagem_potencial,
        "diarias_potenciais": hospedagem_potencial * 1.5,  # média 1.5 noites por visitante
        "recomendacao": "Priorizar pacotes especiais para Festival do Chocolate (180k visitantes) e Natal Mágico (50k visitantes)"
    }


@router.get("/{evento_id}")
async def get_evento(evento_id: int):
    """
    Retorna detalhes de um evento específico.
    """
    data = _load_eventos()
    for evento in data.get("eventos", []):
        if evento.get("id") == evento_id:
            return evento
    return {"error": "Evento não encontrado"}
