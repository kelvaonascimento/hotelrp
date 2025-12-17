"""
Integração com CNPJá - API de Consulta e Busca de Empresas

CNPJá (https://cnpja.com)
API para consulta de dados cadastrais e busca de empresas brasileiras.

## Funcionalidades:
- Consulta individual de CNPJ
- Busca de empresas por filtros (cidade, CNAE, etc.)
- Exportação em lote

## Autenticação:
Header: Authorization: {api-key}
"""
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional, List
import httpx
import asyncio
import json
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel
import os

from services.cnae_classifier import classifier, classificar_empresa

router = APIRouter(prefix="/cnpja", tags=["cnpja"])

DATA_PATH = Path(__file__).parent.parent / "data"
CONFIG_PATH = DATA_PATH / "cnpja_config.json"


class CNPJaConfig(BaseModel):
    """Configuração da API CNPJá."""
    api_key: str
    base_url: str = "https://api.cnpja.com"
    requests_per_minute: int = 5  # Limite do plano


class BuscaEmpresasRequest(BaseModel):
    """Parâmetros para busca de empresas."""
    municipio: str = "RIBEIRAO PIRES"
    estado: str = "SP"
    cnaes: Optional[List[str]] = None  # Lista de CNAEs para buscar
    situacao: str = "ATIVA"
    limit: int = 100


# Configuração padrão
cnpja_config: Optional[CNPJaConfig] = None


def _load_config() -> Optional[CNPJaConfig]:
    """Carrega configuração do arquivo."""
    global cnpja_config
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            if data.get("api_key"):
                cnpja_config = CNPJaConfig(**data)
                return cnpja_config
    return None


def _save_config(config: CNPJaConfig):
    """Salva configuração no arquivo."""
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config.model_dump(), f, ensure_ascii=False, indent=2)


def _load_empresas() -> dict:
    """Carrega empresas do arquivo JSON."""
    filepath = DATA_PATH / "empresas_exemplo.json"
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"empresas": []}


def _save_empresas(data: dict):
    """Salva empresas no arquivo JSON."""
    filepath = DATA_PATH / "empresas_exemplo.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# Carregar configuração na inicialização
_load_config()


@router.get("/config")
async def get_config():
    """Retorna status da configuração da API CNPJá."""
    return {
        "configurada": cnpja_config is not None,
        "api_key_presente": cnpja_config.api_key[:10] + "..." if cnpja_config else None,
        "base_url": cnpja_config.base_url if cnpja_config else None,
        "limite_requisicoes": cnpja_config.requests_per_minute if cnpja_config else None
    }


@router.post("/config")
async def set_config(api_key: str = Query(..., description="API Key do CNPJá")):
    """
    Configura a API key do CNPJá.

    Obtenha sua API key em: https://cnpja.com
    """
    global cnpja_config
    cnpja_config = CNPJaConfig(api_key=api_key)
    _save_config(cnpja_config)
    return {
        "message": "API Key configurada com sucesso",
        "api_key": api_key[:10] + "..."
    }


@router.get("/consultar/{cnpj}")
async def consultar_cnpj(cnpj: str):
    """
    Consulta dados de um CNPJ específico no CNPJá.
    """
    if not cnpja_config:
        raise HTTPException(status_code=400, detail="API Key não configurada. Use POST /cnpja/config primeiro.")

    cnpj_limpo = "".join(filter(str.isdigit, cnpj))

    if len(cnpj_limpo) != 14:
        raise HTTPException(status_code=400, detail="CNPJ deve ter 14 dígitos")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Endpoint de consulta de estabelecimento
            url = f"{cnpja_config.base_url}/office/{cnpj_limpo}"
            headers = {"Authorization": cnpja_config.api_key}

            response = await client.get(url, headers=headers)

            if response.status_code == 200:
                dados = response.json()
                return _processar_resposta_cnpja(dados)
            elif response.status_code == 401:
                raise HTTPException(status_code=401, detail="API Key inválida")
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="CNPJ não encontrado")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="Limite de requisições excedido")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Erro: {response.text}")

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout na consulta")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Erro de conexão: {str(e)}")


@router.get("/buscar")
async def buscar_empresas(
    municipio_ibge: str = Query("3543303", description="Código IBGE do município (3543303 = Ribeirão Pires)"),
    cnae: Optional[str] = Query(None, description="Código CNAE (ex: 5620102)"),
    limite: int = Query(50, ge=1, le=100, description="Itens por página"),
    token: Optional[str] = Query(None, description="Token de paginação")
):
    """
    Busca empresas por município e CNAE.

    Códigos IBGE importantes:
    - 3543303 = Ribeirão Pires
    - 3529401 = Mauá
    - 3547809 = Santo André

    CNAEs estratégicos:
    - 5620102 = Buffets
    - 5611201 = Restaurantes
    - 5611202 = Bares
    - 7911200 = Agências de turismo
    - 7420001 = Fotografia
    """
    if not cnpja_config:
        raise HTTPException(status_code=400, detail="API Key não configurada. Use POST /cnpja/config primeiro.")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            url = f"{cnpja_config.base_url}/office"
            headers = {"Authorization": cnpja_config.api_key}

            params = {
                "address.municipality.in": municipio_ibge,
                "status.id.in": "2",  # 2 = Ativa
                "limit": limite
            }

            if cnae:
                cnae_limpo = "".join(filter(str.isdigit, cnae))
                params["mainActivity.id.in"] = cnae_limpo

            if token:
                params["token"] = token

            response = await client.get(url, headers=headers, params=params)

            if response.status_code == 200:
                dados = response.json()

                empresas = []
                for item in dados.get("records", []):
                    empresa = _processar_resposta_cnpja(item)
                    empresas.append(empresa)

                return {
                    "total": dados.get("count", len(empresas)),
                    "limite": limite,
                    "next_token": dados.get("next"),
                    "empresas": empresas,
                    "filtros_aplicados": {
                        "municipio_ibge": municipio_ibge,
                        "cnae": cnae
                    }
                }
            elif response.status_code == 401:
                raise HTTPException(status_code=401, detail="API Key inválida")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="Limite de requisições excedido. Aguarde um momento.")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Erro: {response.text}")

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout na busca")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Erro de conexão: {str(e)}")


@router.post("/importar-setor")
async def importar_por_setor(
    setor: str = Query(..., description="Setor estratégico (ex: Buffets/Catering, Restaurantes)"),
    municipio: str = Query("RIBEIRAO PIRES", description="Município"),
    background_tasks: BackgroundTasks = None
):
    """
    Importa todas as empresas de um setor estratégico para a base local.

    Setores disponíveis:
    - Buffets/Catering
    - Restaurantes
    - Bares
    - Turismo
    - Fotografia
    - Organizacao de Eventos
    - Transporte Turistico
    - Hospedagem
    """
    if not cnpja_config:
        raise HTTPException(status_code=400, detail="API Key não configurada")

    # Mapear setor para CNAEs
    setores_cnaes = classifier.get_setores()

    if setor not in setores_cnaes:
        raise HTTPException(
            status_code=400,
            detail=f"Setor não encontrado. Setores disponíveis: {list(setores_cnaes.keys())}"
        )

    cnaes = setores_cnaes[setor]

    return {
        "message": f"Iniciando importação do setor {setor}",
        "cnaes": cnaes,
        "municipio": municipio,
        "instrucao": f"Use GET /cnpja/buscar?municipio={municipio}&cnae=CODIGO para cada CNAE"
    }


@router.post("/importar-todos-setores")
async def importar_todos_setores(
    municipio_ibge: str = Query("3543303", description="Código IBGE (3543303 = Ribeirão Pires)"),
    salvar: bool = Query(True, description="Salvar empresas na base local")
):
    """
    Importa empresas de TODOS os setores estratégicos de Ribeirão Pires.

    Setores importados:
    - Buffets/Catering (5620102)
    - Restaurantes (5611201)
    - Bares (5611202)
    - Agências de Turismo (7911200)
    - Fotografia (7420001, 7420004)
    - Organização de Eventos (8230001)
    - Transporte Turístico (4929901, 4929903)
    - Hospedagem (5510801, 5510802, 5590699)
    """
    if not cnpja_config:
        raise HTTPException(status_code=400, detail="API Key não configurada")

    # CNAEs estratégicos com seus setores
    cnaes_estrategicos = {
        "Buffets/Catering": ["5620102"],
        "Restaurantes": ["5611201"],
        "Bares": ["5611202"],
        "Turismo": ["7911200"],
        "Fotografia": ["7420001", "7420004"],
        "Organizacao de Eventos": ["8230001"],
        "Transporte Turistico": ["4929901", "4929903"],
        "Hospedagem": ["5510801", "5510802", "5590699"],
        "Entretenimento": ["9329899", "9001906"]
    }

    resultados = {
        "total_importado": 0,
        "por_setor": {},
        "empresas_encontradas": 0,
        "erros": []
    }

    empresas_data = _load_empresas()
    empresas_existentes = {e.get("cnpj", "").replace(".", "").replace("/", "").replace("-", "")
                          for e in empresas_data.get("empresas", [])}
    novas_empresas = []

    async with httpx.AsyncClient(timeout=60.0) as client:
        for setor, cnaes in cnaes_estrategicos.items():
            resultados["por_setor"][setor] = {"total": 0, "importados": 0}

            for cnae in cnaes:
                try:
                    url = f"{cnpja_config.base_url}/office"
                    headers = {"Authorization": cnpja_config.api_key}
                    params = {
                        "address.municipality.in": municipio_ibge,
                        "status.id.in": "2",
                        "mainActivity.id.in": cnae,
                        "limit": 100
                    }

                    response = await client.get(url, headers=headers, params=params)

                    if response.status_code == 200:
                        dados = response.json()
                        count = dados.get("count", 0)
                        resultados["por_setor"][setor]["total"] += count
                        resultados["empresas_encontradas"] += count

                        # Processar todas as páginas
                        all_records = dados.get("records", [])
                        next_token = dados.get("next")

                        # Buscar páginas adicionais se houver
                        while next_token and len(all_records) < count:
                            params["token"] = next_token
                            response = await client.get(url, headers=headers, params=params)
                            if response.status_code == 200:
                                page_data = response.json()
                                all_records.extend(page_data.get("records", []))
                                next_token = page_data.get("next")
                            else:
                                break
                            await asyncio.sleep(0.5)

                        for item in all_records:
                            empresa = _processar_resposta_cnpja(item)
                            cnpj_limpo = empresa["cnpj"].replace(".", "").replace("/", "").replace("-", "")

                            if cnpj_limpo not in empresas_existentes:
                                empresas_existentes.add(cnpj_limpo)
                                novas_empresas.append(_converter_para_base_local(empresa, setor))
                                resultados["por_setor"][setor]["importados"] += 1
                                resultados["total_importado"] += 1

                    elif response.status_code == 429:
                        resultados["erros"].append(f"Rate limit no CNAE {cnae}")
                        await asyncio.sleep(5)

                except Exception as e:
                    resultados["erros"].append(f"Erro CNAE {cnae}: {str(e)}")

                await asyncio.sleep(0.3)  # Pequeno delay entre requisições

    # Salvar novas empresas
    if salvar and novas_empresas:
        # Remover empresas de exemplo antigas
        empresas_data["empresas"] = [e for e in empresas_data.get("empresas", [])
                                      if not e.get("notas", "").startswith("Buffet tradicional")]

        max_id = max([e.get("id", 0) for e in empresas_data.get("empresas", [])], default=0)
        for i, emp in enumerate(novas_empresas):
            emp["id"] = max_id + i + 1

        empresas_data["empresas"].extend(novas_empresas)
        _save_empresas(empresas_data)

    return resultados


def _processar_resposta_cnpja(dados: dict) -> dict:
    """Processa resposta da API CNPJá."""

    # Extrair CNAE principal
    main_activity = dados.get("mainActivity", {})
    if isinstance(main_activity, dict):
        cnae_code = str(main_activity.get("id", ""))
        cnae_text = main_activity.get("text", "")
    else:
        cnae_code = str(main_activity) if main_activity else ""
        cnae_text = ""

    # Formatar CNAE com máscara se necessário
    if len(cnae_code) == 7:
        cnae_formatado = f"{cnae_code[:4]}-{cnae_code[4]}/{cnae_code[5:]}"
    else:
        cnae_formatado = cnae_code

    # Classificar para o hotel
    classificacao = classificar_empresa(cnae_formatado)

    # Extrair endereço
    address = dados.get("address", {})

    # Extrair contato - lidar com diferentes formatos
    phones = dados.get("phones", [])
    emails = dados.get("emails", [])

    # Extrair telefone
    telefone = ""
    if phones and len(phones) > 0:
        phone = phones[0]
        if isinstance(phone, dict):
            area = phone.get("area", "")
            number = phone.get("number", "")
            telefone = f"({area}) {number}" if area else number

    # Extrair email
    email = ""
    if emails and len(emails) > 0:
        email_obj = emails[0]
        if isinstance(email_obj, dict):
            email = email_obj.get("address", "")

    # Extrair dados da empresa
    company = dados.get("company", {})
    if isinstance(company, dict):
        razao_social = company.get("name", "")
        size = company.get("size", {})
        if isinstance(size, dict):
            porte_texto = size.get("text", "")
        else:
            porte_texto = ""
    else:
        razao_social = ""
        porte_texto = ""

    # Extrair status
    status = dados.get("status", {})
    if isinstance(status, dict):
        situacao = status.get("text", "")
    else:
        situacao = ""

    return {
        "cnpj": dados.get("taxId", ""),
        "razao_social": razao_social,
        "nome_fantasia": dados.get("alias", "") or razao_social,
        "situacao": situacao,
        "data_abertura": dados.get("founded", ""),
        "porte": _classificar_porte_cnpja(porte_texto),
        "cnae_principal": cnae_formatado,
        "cnae_descricao": cnae_text,
        "endereco": {
            "logradouro": address.get("street", "") if isinstance(address, dict) else "",
            "numero": address.get("number", "") if isinstance(address, dict) else "",
            "complemento": address.get("details", "") if isinstance(address, dict) else "",
            "bairro": address.get("district", "") if isinstance(address, dict) else "",
            "municipio": address.get("city", "") if isinstance(address, dict) else "",
            "uf": address.get("state", "") if isinstance(address, dict) else "",
            "cep": address.get("zip", "") if isinstance(address, dict) else ""
        },
        "contato": {
            "telefone": telefone,
            "email": email
        },
        "setor_hotel": classificacao.get("setor_hotel"),
        "eh_estrategico": classifier.is_estrategico(cnae_formatado)
    }


def _classificar_porte_cnpja(porte_texto: str) -> str:
    """Classifica o porte baseado no texto do CNPJá."""
    if not porte_texto:
        return "OUTROS"
    porte_upper = porte_texto.upper()
    if "MEI" in porte_upper:
        return "MEI"
    elif "MICRO" in porte_upper:
        return "ME"
    elif "PEQUENO" in porte_upper:
        return "EPP"
    elif "MEDIO" in porte_upper or "MÉDIO" in porte_upper:
        return "MEDIO"
    elif "GRANDE" in porte_upper:
        return "GRANDE"
    return "OUTROS"


def _converter_para_base_local(empresa: dict, setor: str) -> dict:
    """Converte empresa do formato CNPJá para formato da base local."""
    return {
        "cnpj": empresa["cnpj"],
        "razao_social": empresa["razao_social"],
        "nome_fantasia": empresa["nome_fantasia"],
        "cnae_principal": empresa["cnae_principal"],
        "cnae_descricao": empresa["cnae_descricao"],
        "data_abertura": empresa["data_abertura"],
        "municipio": empresa["endereco"]["municipio"],
        "bairro": empresa["endereco"]["bairro"],
        "endereco": f"{empresa['endereco']['logradouro']}, {empresa['endereco']['numero']}",
        "telefone": empresa["contato"]["telefone"],
        "email": empresa["contato"]["email"],
        "porte": empresa["porte"],
        "setor_hotel": setor,
        "status_parceria": "nao_contatado",
        "notas": f"Importado via CNPJá em {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    }
