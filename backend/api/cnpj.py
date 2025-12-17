"""
Integração com ReceitaWS - API de Consulta de CNPJ

ReceitaWS (https://www.receitaws.com.br)
API para consulta de dados cadastrais de empresas brasileiras.

## Planos Disponíveis:
- **Gratuito**: 3 consultas por minuto, sem autenticação
- **Comercial**: Consultas ilimitadas, requer API key

## Endpoint:
GET https://www.receitaws.com.br/v1/cnpj/{cnpj}

## Campos Retornados pela API:
- cnpj: Número do CNPJ formatado
- tipo: MATRIZ ou FILIAL
- abertura: Data de abertura (DD/MM/YYYY)
- nome: Razão social
- fantasia: Nome fantasia
- porte: Porte da empresa
- natureza_juridica: Natureza jurídica
- situacao: Situação cadastral (ATIVA, BAIXADA, etc)
- data_situacao: Data da situação
- motivo_situacao: Motivo da situação
- situacao_especial: Situação especial
- data_situacao_especial: Data situação especial
- capital_social: Capital social
- atividade_principal: [{code, text}] - CNAE principal
- atividades_secundarias: [{code, text}] - CNAEs secundários
- qsa: Quadro societário [{nome, qual}]
- logradouro, numero, complemento, bairro, municipio, uf, cep: Endereço
- telefone, email: Contato
- efr: Ente federativo responsável
- ultima_atualizacao: Data última atualização
- status: OK ou ERROR
- message: Mensagem de erro (se houver)
"""
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional, List
import httpx
import asyncio
import json
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel

from services.cnae_classifier import classifier, classificar_empresa

router = APIRouter(prefix="/cnpj", tags=["cnpj"])

DATA_PATH = Path(__file__).parent.parent / "data"


class ConfiguracaoAPI(BaseModel):
    """Configuração da API ReceitaWS."""
    base_url: str = "https://www.receitaws.com.br/v1/cnpj"
    api_key: Optional[str] = None
    plano: str = "gratuito"  # gratuito ou comercial
    delay_entre_consultas: int = 20  # segundos (gratuito = 20s, comercial = 0)


class ConsultaCNPJResponse(BaseModel):
    """Resposta padronizada de consulta CNPJ."""
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str]
    situacao: str
    tipo: str  # MATRIZ ou FILIAL
    data_abertura: str
    natureza_juridica: str
    porte: str
    capital_social: str
    cnae_principal: str
    cnae_principal_descricao: str
    cnaes_secundarios: List[dict]
    endereco: dict
    contato: dict
    quadro_societario: List[dict]
    ultima_atualizacao: str
    # Campos adicionais para o sistema
    setor_hotel: Optional[str]
    relevancia_hotel: Optional[str]
    eh_estrategico: bool


# Configuração padrão - ReceitaWS gratuito
api_config = ConfiguracaoAPI()


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


@router.get("/info")
async def info_api():
    """
    Informações sobre a API ReceitaWS e como utilizá-la.
    """
    return {
        "api": "ReceitaWS",
        "documentacao": "https://developers.receitaws.com.br",
        "endpoint": "GET https://www.receitaws.com.br/v1/cnpj/{cnpj}",
        "planos": {
            "gratuito": {
                "limite": "3 consultas por minuto",
                "autenticacao": "Não requer",
                "delay_recomendado": "20 segundos entre consultas"
            },
            "comercial": {
                "limite": "Ilimitado",
                "autenticacao": "API Key no header",
                "delay_recomendado": "Nenhum"
            }
        },
        "campos_retornados": [
            "cnpj", "tipo", "abertura", "nome", "fantasia", "porte",
            "natureza_juridica", "situacao", "capital_social",
            "atividade_principal", "atividades_secundarias", "qsa",
            "logradouro", "numero", "bairro", "municipio", "uf", "cep",
            "telefone", "email", "ultima_atualizacao"
        ],
        "exemplo_resposta": {
            "cnpj": "00.000.000/0001-00",
            "nome": "EMPRESA EXEMPLO LTDA",
            "fantasia": "EXEMPLO",
            "situacao": "ATIVA",
            "atividade_principal": [{"code": "56.11-2-01", "text": "Restaurantes"}]
        }
    }


@router.get("/configuracao")
async def get_configuracao():
    """
    Retorna a configuração atual da API ReceitaWS.
    """
    return {
        "base_url": api_config.base_url,
        "plano": api_config.plano,
        "api_key_configurada": api_config.api_key is not None,
        "delay_entre_consultas": api_config.delay_entre_consultas,
        "status": "configurada"
    }


@router.post("/configuracao")
async def set_configuracao(config: ConfiguracaoAPI):
    """
    Configura a API ReceitaWS.

    Para plano gratuito (padrão):
    ```json
    {
        "base_url": "https://www.receitaws.com.br/v1/cnpj",
        "plano": "gratuito",
        "delay_entre_consultas": 20
    }
    ```

    Para plano comercial:
    ```json
    {
        "base_url": "https://www.receitaws.com.br/v1/cnpj",
        "api_key": "sua-api-key-aqui",
        "plano": "comercial",
        "delay_entre_consultas": 0
    }
    ```
    """
    global api_config
    api_config = config
    return {"message": "Configuração atualizada com sucesso", "config": config.model_dump()}


@router.get("/consultar/{cnpj}")
async def consultar_cnpj(cnpj: str, salvar: bool = Query(False, description="Salvar na base se for estratégico")):
    """
    Consulta dados de um CNPJ na ReceitaWS.

    Args:
        cnpj: Número do CNPJ (com ou sem formatação)
        salvar: Se True, salva automaticamente na base se for CNAE estratégico

    Returns:
        Dados completos da empresa com classificação para o hotel
    """
    # Limpar CNPJ - apenas números
    cnpj_limpo = "".join(filter(str.isdigit, cnpj))

    if len(cnpj_limpo) != 14:
        raise HTTPException(
            status_code=400,
            detail="CNPJ deve ter 14 dígitos"
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{api_config.base_url}/{cnpj_limpo}"
            headers = {}

            # Adicionar API key se configurada (plano comercial)
            if api_config.api_key:
                headers["Authorization"] = f"Bearer {api_config.api_key}"

            response = await client.get(url, headers=headers)

            if response.status_code == 200:
                dados = response.json()

                # Verificar se houve erro na resposta
                if dados.get("status") == "ERROR":
                    raise HTTPException(
                        status_code=404,
                        detail=dados.get("message", "CNPJ não encontrado")
                    )

                # Processar e enriquecer dados
                resultado = _processar_resposta_receitaws(dados)

                # Salvar se solicitado e for estratégico
                if salvar and resultado["eh_estrategico"]:
                    await _salvar_empresa(resultado)

                return resultado

            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail=f"Limite de requisições excedido. Aguarde {api_config.delay_entre_consultas} segundos."
                )
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail="CNPJ não encontrado na base da Receita Federal"
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Erro na consulta: {response.text}"
                )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout na consulta à ReceitaWS. Tente novamente."
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro de conexão com ReceitaWS: {str(e)}"
        )


def _processar_resposta_receitaws(dados: dict) -> dict:
    """
    Processa resposta da ReceitaWS e adiciona classificação para o hotel.
    """
    # Extrair CNAE principal
    atividade_principal = dados.get("atividade_principal", [{}])
    cnae_code = atividade_principal[0].get("code", "") if atividade_principal else ""
    cnae_text = atividade_principal[0].get("text", "") if atividade_principal else ""

    # Classificar para o hotel
    classificacao = classificar_empresa(cnae_code)
    eh_estrategico = classifier.is_estrategico(cnae_code)

    # Verificar se é de Ribeirão Pires
    municipio = dados.get("municipio", "").upper()
    eh_ribeirao_pires = "RIBEIRAO PIRES" in municipio or "RIBEIRÃO PIRES" in municipio

    return {
        "cnpj": dados.get("cnpj", ""),
        "razao_social": dados.get("nome", ""),
        "nome_fantasia": dados.get("fantasia", ""),
        "situacao": dados.get("situacao", ""),
        "tipo": dados.get("tipo", ""),
        "data_abertura": dados.get("abertura", ""),
        "natureza_juridica": dados.get("natureza_juridica", ""),
        "porte": _classificar_porte(dados.get("porte", "")),
        "capital_social": dados.get("capital_social", ""),
        "cnae_principal": cnae_code,
        "cnae_principal_descricao": cnae_text,
        "cnaes_secundarios": [
            {"codigo": a.get("code", ""), "descricao": a.get("text", "")}
            for a in dados.get("atividades_secundarias", [])
        ],
        "endereco": {
            "logradouro": dados.get("logradouro", ""),
            "numero": dados.get("numero", ""),
            "complemento": dados.get("complemento", ""),
            "bairro": dados.get("bairro", ""),
            "municipio": dados.get("municipio", ""),
            "uf": dados.get("uf", ""),
            "cep": dados.get("cep", "")
        },
        "contato": {
            "telefone": dados.get("telefone", ""),
            "email": dados.get("email", "")
        },
        "quadro_societario": [
            {"nome": s.get("nome", ""), "qualificacao": s.get("qual", "")}
            for s in dados.get("qsa", [])
        ],
        "ultima_atualizacao": dados.get("ultima_atualizacao", ""),
        # Classificação para o hotel
        "setor_hotel": classificacao.get("setor_hotel"),
        "relevancia_hotel": classificacao.get("relevancia"),
        "impacto_hotel": classificacao.get("impacto", ""),
        "eh_estrategico": eh_estrategico,
        "eh_ribeirao_pires": eh_ribeirao_pires,
        # Dados originais
        "_raw": dados
    }


def _classificar_porte(porte_texto: str) -> str:
    """Classifica o porte da empresa baseado no texto da Receita."""
    if not porte_texto:
        return "OUTROS"
    porte_upper = porte_texto.upper()
    if "MEI" in porte_upper:
        return "MEI"
    elif "MICRO EMPRESA" in porte_upper or "MICROEMPRESA" in porte_upper:
        return "ME"
    elif "PEQUENO PORTE" in porte_upper:
        return "EPP"
    elif "MEDIO" in porte_upper:
        return "MEDIO"
    elif "GRANDE" in porte_upper:
        return "GRANDE"
    return "OUTROS"


async def _salvar_empresa(dados: dict):
    """Salva empresa na base local se for estratégica."""
    empresas_data = _load_empresas()
    empresas = empresas_data.get("empresas", [])

    # Verificar se já existe
    cnpj = dados["cnpj"].replace(".", "").replace("/", "").replace("-", "")
    for emp in empresas:
        if emp.get("cnpj", "").replace(".", "").replace("/", "").replace("-", "") == cnpj:
            return  # Já existe

    # Gerar novo ID
    max_id = max([e.get("id", 0) for e in empresas], default=0)

    nova_empresa = {
        "id": max_id + 1,
        "cnpj": dados["cnpj"],
        "razao_social": dados["razao_social"],
        "nome_fantasia": dados["nome_fantasia"],
        "cnae_principal": dados["cnae_principal"],
        "cnae_descricao": dados["cnae_principal_descricao"],
        "data_abertura": dados["data_abertura"],
        "municipio": dados["endereco"]["municipio"],
        "bairro": dados["endereco"]["bairro"],
        "endereco": f"{dados['endereco']['logradouro']}, {dados['endereco']['numero']}",
        "telefone": dados["contato"]["telefone"],
        "email": dados["contato"]["email"],
        "porte": dados["porte"],
        "setor_hotel": dados["setor_hotel"],
        "status_parceria": "nao_contatado",
        "notas": f"Importado via ReceitaWS em {datetime.now().strftime('%d/%m/%Y')}"
    }

    empresas.append(nova_empresa)
    empresas_data["empresas"] = empresas
    _save_empresas(empresas_data)


@router.post("/consultar-lote")
async def consultar_lote(
    cnpjs: List[str],
    salvar_estrategicos: bool = Query(True, description="Salvar empresas estratégicas automaticamente")
):
    """
    Consulta múltiplos CNPJs em lote.

    **ATENÇÃO**: Para plano gratuito, há delay de 20s entre consultas.
    Para 10 CNPJs = ~3 minutos de processamento.

    Args:
        cnpjs: Lista de CNPJs para consultar (máximo 50)
        salvar_estrategicos: Salvar automaticamente empresas de CNAEs estratégicos

    Returns:
        Resultados das consultas com estatísticas
    """
    if len(cnpjs) > 50:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 50 CNPJs por lote. Para mais, use múltiplas requisições."
        )

    resultados = []
    erros = []
    estrategicos = 0
    ribeirao_pires = 0

    for i, cnpj in enumerate(cnpjs):
        try:
            resultado = await consultar_cnpj(cnpj, salvar=salvar_estrategicos)
            resultados.append(resultado)

            if resultado.get("eh_estrategico"):
                estrategicos += 1
            if resultado.get("eh_ribeirao_pires"):
                ribeirao_pires += 1

        except HTTPException as e:
            erros.append({"cnpj": cnpj, "erro": e.detail})
        except Exception as e:
            erros.append({"cnpj": cnpj, "erro": str(e)})

        # Delay para respeitar limite da API (plano gratuito)
        if i < len(cnpjs) - 1 and api_config.delay_entre_consultas > 0:
            await asyncio.sleep(api_config.delay_entre_consultas)

    return {
        "total_consultados": len(cnpjs),
        "sucesso": len(resultados),
        "erros": len(erros),
        "estrategicos_encontrados": estrategicos,
        "ribeirao_pires_encontrados": ribeirao_pires,
        "resultados": resultados,
        "detalhes_erros": erros
    }


@router.get("/status")
async def status_api():
    """
    Verifica se a API ReceitaWS está acessível.
    Usa CNPJ de teste (Prefeitura de Ribeirão Pires).
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # CNPJ da Prefeitura de Ribeirão Pires
            response = await client.get(
                f"{api_config.base_url}/46523239000147"
            )
            if response.status_code == 200:
                dados = response.json()
                return {
                    "status": "online",
                    "api": "ReceitaWS",
                    "plano_configurado": api_config.plano,
                    "teste": {
                        "cnpj": dados.get("cnpj"),
                        "nome": dados.get("nome"),
                        "municipio": dados.get("municipio")
                    }
                }
            elif response.status_code == 429:
                return {
                    "status": "rate_limited",
                    "api": "ReceitaWS",
                    "mensagem": "Limite de requisições atingido. Aguarde alguns minutos."
                }
            else:
                return {
                    "status": "erro",
                    "api": "ReceitaWS",
                    "mensagem": f"Status code: {response.status_code}"
                }
    except Exception as e:
        return {
            "status": "offline",
            "api": "ReceitaWS",
            "mensagem": str(e)
        }


@router.get("/cnaes-estrategicos")
async def listar_cnaes_estrategicos():
    """
    Lista todos os CNAEs estratégicos monitorados para o hotel.
    Use estes códigos para filtrar consultas.
    """
    return {
        "total": len(classifier.cnae_map),
        "cnaes": classifier.cnaes_data.get("cnaes_estrategicos", []),
        "setores": classifier.get_setores(),
        "dica": "Ao consultar CNPJs, empresas com estes CNAEs serão marcadas como 'eh_estrategico: true'"
    }
