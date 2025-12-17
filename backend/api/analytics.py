"""
Endpoints da API para analytics e projeções de viabilidade.
"""
from fastapi import APIRouter
from services.analytics import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/kpis")
async def get_kpis():
    """
    Retorna KPIs principais do dashboard de viabilidade.
    """
    return analytics_service.calcular_kpis()


@router.get("/tendencias")
async def get_tendencias():
    """
    Retorna tendências de abertura de empresas por setor.
    """
    return {
        "tendencias": analytics_service.calcular_tendencias_setor()
    }


@router.get("/projecoes")
async def get_projecoes():
    """
    Retorna projeções de ocupação e receita para diferentes cenários.
    """
    return {
        "projecoes": analytics_service.calcular_projecoes()
    }


@router.get("/sazonalidade")
async def get_sazonalidade():
    """
    Retorna análise de sazonalidade por mês.
    """
    return {
        "sazonalidade": analytics_service.calcular_sazonalidade()
    }


@router.get("/completo")
async def get_analise_completa():
    """
    Retorna análise completa de viabilidade para o dashboard.
    Inclui KPIs, tendências, projeções e sazonalidade.
    """
    return analytics_service.get_analise_completa()


@router.get("/score-viabilidade")
async def get_score_viabilidade():
    """
    Retorna o score de viabilidade detalhado com explicação.
    """
    kpis = analytics_service.calcular_kpis()
    score = kpis["score_viabilidade"]

    # Classificação do score
    if score >= 80:
        classificacao = "Excelente"
        recomendacao = "Projeto altamente viável. Recomenda-se avançar com estudos de engenharia e financeiro."
    elif score >= 60:
        classificacao = "Bom"
        recomendacao = "Projeto viável com boas perspectivas. Algumas melhorias podem ser consideradas."
    elif score >= 40:
        classificacao = "Moderado"
        recomendacao = "Projeto viável com ressalvas. Requer análise mais aprofundada de riscos."
    else:
        classificacao = "Baixo"
        recomendacao = "Projeto apresenta riscos significativos. Reavaliação necessária."

    return {
        "score": score,
        "classificacao": classificacao,
        "recomendacao": recomendacao,
        "fatores": {
            "crescimento_empresarial": {
                "valor": kpis["crescimento_geral"],
                "peso": "20%",
                "avaliacao": "Positivo" if kpis["crescimento_geral"] > 10 else "Neutro"
            },
            "volume_eventos": {
                "valor": kpis["total_eventos_ano"],
                "peso": "25%",
                "avaliacao": "Excelente" if kpis["total_eventos_ano"] > 100 else "Bom"
            },
            "publico_turistico": {
                "valor": kpis["publico_total_eventos"],
                "peso": "25%",
                "avaliacao": "Excelente" if kpis["publico_total_eventos"] > 300000 else "Bom"
            },
            "gap_mercado": {
                "valor": f"{kpis['leitos_disponiveis_cidade']} leitos para {kpis['publico_total_eventos']:,} visitantes",
                "peso": "30%",
                "avaliacao": "Crítico - alta oportunidade"
            }
        },
        "pontos_fortes": [
            "315 mil visitantes anuais com apenas 200 leitos disponíveis",
            "127 eventos programados no calendário municipal",
            "Ausência de hotel upscale e centro de convenções",
            "Crescimento econômico contínuo (300+ empresas/ano)",
            "8ª estância turística do Estado de SP",
            "Apoio institucional (R$5M investimento anual em turismo)"
        ],
        "pontos_atencao": [
            "Necessidade de diferenciação clara da concorrência",
            "Dependência de eventos sazonais (Festival do Chocolate concentra 57% do público)",
            "Perfil predominante MEI pode limitar demanda corporativa de alto ticket"
        ]
    }


@router.get("/demanda-estimada")
async def get_demanda_estimada():
    """
    Estima demanda potencial por segmento para o hotel.
    """
    kpis = analytics_service.calcular_kpis()
    projecoes = analytics_service.calcular_projecoes()
    sazonalidade = analytics_service.calcular_sazonalidade()

    # Segmentação de demanda
    publico_total = kpis["publico_total_eventos"]

    return {
        "demanda_por_segmento": {
            "turismo_eventos": {
                "descricao": "Visitantes de eventos culturais que pernoitam",
                "publico_base": publico_total,
                "taxa_pernoite": "2%",
                "diarias_potenciais": int(publico_total * 0.02 * 1.5),
                "ticket_medio": 280
            },
            "corporativo": {
                "descricao": "Visitantes a trabalho (fornecedores, consultores)",
                "empresas_base": 600,  # ~600 empresas abertas por ano
                "visitas_por_empresa": 3,
                "diarias_potenciais": 600 * 3 * 1.5,
                "ticket_medio": 300
            },
            "eventos_sociais": {
                "descricao": "Casamentos, formaturas e festas",
                "eventos_mes": 15,  # estimativa baseada em 9+ buffets
                "hospedes_por_evento": 8,
                "diarias_potenciais": 15 * 12 * 8,
                "ticket_medio": 260
            },
            "leisure_local": {
                "descricao": "Moradores da região para experiências (rooftop, restaurante)",
                "publico_potencial": 50000,
                "taxa_conversao_hospedagem": "1%",
                "diarias_potenciais": 500,
                "ticket_medio": 250
            }
        },
        "total_diarias_potenciais": int(
            publico_total * 0.02 * 1.5 +
            600 * 3 * 1.5 +
            15 * 12 * 8 +
            500
        ),
        "capacidade_hotel": {
            "quartos": 55,
            "diarias_ano": 55 * 365,
            "capacidade_60_ocupacao": int(55 * 365 * 0.6)
        },
        "conclusao": "Demanda potencial supera capacidade do hotel projetado, indicando viabilidade comercial"
    }
