"""
Endpoints da API para gerenciamento de empresas.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
import json
from pathlib import Path

from models.schemas import (
    Empresa, EmpresaCreate, FiltroEmpresas,
    PorteEmpresa, StatusParceria
)
from services.cnae_classifier import classifier, classificar_empresa

router = APIRouter(prefix="/empresas", tags=["empresas"])

DATA_PATH = Path(__file__).parent.parent / "data" / "empresas_exemplo.json"

def _load_empresas() -> List[dict]:
    """Carrega empresas do arquivo JSON."""
    if DATA_PATH.exists():
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("empresas", [])
    return []

def _save_empresas(empresas: List[dict]):
    """Salva empresas no arquivo JSON."""
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "empresas": empresas,
            "estatisticas": _calcular_estatisticas(empresas)
        }, f, ensure_ascii=False, indent=2)

def _calcular_estatisticas(empresas: List[dict]) -> dict:
    """Calcula estatísticas das empresas."""
    por_setor = {}
    por_porte = {}
    por_status = {}

    for emp in empresas:
        setor = emp.get("setor_hotel", "Outros")
        porte = emp.get("porte", "OUTROS")
        status = emp.get("status_parceria", "nao_contatado")

        por_setor[setor] = por_setor.get(setor, 0) + 1
        por_porte[porte] = por_porte.get(porte, 0) + 1
        por_status[status] = por_status.get(status, 0) + 1

    return {
        "total_empresas": len(empresas),
        "por_setor": por_setor,
        "por_porte": por_porte,
        "por_status": por_status
    }


@router.get("/")
async def listar_empresas(
    setor: Optional[str] = Query(None, description="Filtrar por setor do hotel"),
    cnae: Optional[str] = Query(None, description="Filtrar por código CNAE"),
    porte: Optional[PorteEmpresa] = Query(None, description="Filtrar por porte"),
    status: Optional[StatusParceria] = Query(None, description="Filtrar por status de parceria"),
    data_inicio: Optional[date] = Query(None, description="Data de abertura mínima"),
    data_fim: Optional[date] = Query(None, description="Data de abertura máxima"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """
    Lista todas as empresas com filtros opcionais.
    """
    empresas = _load_empresas()

    # Aplicar filtros
    if setor:
        empresas = [e for e in empresas if e.get("setor_hotel") == setor]

    if cnae:
        empresas = [e for e in empresas if e.get("cnae_principal", "").startswith(cnae)]

    if porte:
        empresas = [e for e in empresas if e.get("porte") == porte.value]

    if status:
        empresas = [e for e in empresas if e.get("status_parceria") == status.value]

    if data_inicio:
        empresas = [
            e for e in empresas
            if e.get("data_abertura", "1900-01-01") >= str(data_inicio)
        ]

    if data_fim:
        empresas = [
            e for e in empresas
            if e.get("data_abertura", "2100-01-01") <= str(data_fim)
        ]

    # Paginação
    total = len(empresas)
    empresas = empresas[offset:offset + limit]

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "empresas": empresas
    }


@router.get("/estatisticas")
async def get_estatisticas():
    """
    Retorna estatísticas das empresas cadastradas.
    """
    empresas = _load_empresas()
    return _calcular_estatisticas(empresas)


@router.get("/setores")
async def listar_setores():
    """
    Lista todos os setores estratégicos e seus CNAEs.
    """
    return classifier.get_setores()


@router.get("/cnaes")
async def listar_cnaes():
    """
    Lista todos os CNAEs estratégicos monitorados.
    """
    return {
        "cnaes": classifier.cnaes_data.get("cnaes_estrategicos", []),
        "total": len(classifier.cnae_map)
    }


@router.get("/{empresa_id}")
async def get_empresa(empresa_id: int):
    """
    Retorna detalhes de uma empresa específica.
    """
    empresas = _load_empresas()
    for emp in empresas:
        if emp.get("id") == empresa_id:
            return emp
    raise HTTPException(status_code=404, detail="Empresa não encontrada")


@router.post("/", response_model=dict)
async def criar_empresa(empresa: EmpresaCreate):
    """
    Adiciona uma nova empresa ao sistema.
    """
    empresas = _load_empresas()

    # Verificar duplicata
    for emp in empresas:
        if emp.get("cnpj") == empresa.cnpj:
            raise HTTPException(status_code=400, detail="CNPJ já cadastrado")

    # Gerar ID
    max_id = max([e.get("id", 0) for e in empresas], default=0)
    novo_id = max_id + 1

    # Classificar CNAE
    classificacao = classificar_empresa(empresa.cnae_principal)

    nova_empresa = {
        "id": novo_id,
        **empresa.model_dump(),
        "data_abertura": str(empresa.data_abertura),
        "setor_hotel": classificacao.get("setor_hotel", "Outros"),
        "status_parceria": "nao_contatado",
        "notas": None
    }

    empresas.append(nova_empresa)
    _save_empresas(empresas)

    return {"message": "Empresa criada com sucesso", "empresa": nova_empresa}


@router.put("/{empresa_id}/status")
async def atualizar_status_parceria(
    empresa_id: int,
    status: StatusParceria,
    notas: Optional[str] = None
):
    """
    Atualiza o status de parceria de uma empresa.
    """
    empresas = _load_empresas()

    for emp in empresas:
        if emp.get("id") == empresa_id:
            emp["status_parceria"] = status.value
            if notas:
                emp["notas"] = notas
            _save_empresas(empresas)
            return {"message": "Status atualizado", "empresa": emp}

    raise HTTPException(status_code=404, detail="Empresa não encontrada")


@router.delete("/{empresa_id}")
async def excluir_empresa(empresa_id: int):
    """
    Remove uma empresa do sistema.
    """
    empresas = _load_empresas()
    empresas_filtradas = [e for e in empresas if e.get("id") != empresa_id]

    if len(empresas_filtradas) == len(empresas):
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    _save_empresas(empresas_filtradas)
    return {"message": "Empresa excluída com sucesso"}


@router.get("/por-setor/resumo")
async def empresas_por_setor():
    """
    Retorna contagem de empresas agrupadas por setor.
    """
    empresas = _load_empresas()
    por_setor = {}

    for emp in empresas:
        setor = emp.get("setor_hotel", "Outros")
        if setor not in por_setor:
            por_setor[setor] = {
                "total": 0,
                "parceiros": 0,
                "prospectados": 0,
                "contatados": 0
            }
        por_setor[setor]["total"] += 1

        status = emp.get("status_parceria", "nao_contatado")
        if status == "parceiro":
            por_setor[setor]["parceiros"] += 1
        elif status == "prospectado":
            por_setor[setor]["prospectados"] += 1
        elif status == "contatado":
            por_setor[setor]["contatados"] += 1

    return por_setor
