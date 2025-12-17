"""
Dashboard de Viabilidade - Hotel Ribeirão Pires
API Backend FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from api import empresas, eventos, concorrencia, analytics, cnpj, cnpja

# Criar aplicação FastAPI
app = FastAPI(
    title="Hotel RP - Dashboard de Viabilidade",
    description="""
    API para análise de viabilidade do Hotel em Ribeirão Pires.

    ## Funcionalidades

    * **Empresas**: Gerenciamento e análise de empresas por CNAE estratégico
    * **Eventos**: Calendário turístico e análise de impacto
    * **Concorrência**: Análise do mercado hoteleiro regional
    * **Analytics**: KPIs, tendências e projeções de viabilidade
    * **CNPJ**: Integração com APIs de consulta de CNPJ

    ## Dados Pré-carregados

    O sistema já vem com dados do estudo de viabilidade:
    - 127 eventos turísticos mapeados
    - 9 hotéis concorrentes analisados
    - 25 CNAEs estratégicos monitorados
    - Indicadores: 315 mil visitantes/ano, 200 leitos disponíveis
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(empresas.router)
app.include_router(eventos.router)
app.include_router(concorrencia.router)
app.include_router(analytics.router)
app.include_router(cnpj.router)
app.include_router(cnpja.router)


@app.get("/")
async def root():
    """
    Endpoint raiz com informações da API.
    """
    return {
        "nome": "Hotel RP - Dashboard de Viabilidade",
        "versao": "1.0.0",
        "status": "online",
        "documentacao": "/docs",
        "endpoints": {
            "empresas": "/empresas",
            "eventos": "/eventos",
            "concorrencia": "/concorrencia",
            "analytics": "/analytics",
            "cnpj": "/cnpj"
        },
        "projeto": {
            "descricao": "Hotel upscale em Ribeirão Pires com centro de convenções, restaurante gastronômico e rooftop bar",
            "localizacao": "Centro de Ribeirão Pires, SP",
            "diferenciais": [
                "Primeiro hotel upscale da cidade",
                "Centro de convenções integrado",
                "Rooftop bar panorâmico (inédito na região)",
                "Restaurante gastronômico regional"
            ]
        }
    }


@app.get("/health")
async def health_check():
    """
    Health check para monitoramento.
    """
    return {"status": "healthy"}


@app.get("/resumo")
async def resumo_viabilidade():
    """
    Resumo executivo da viabilidade do projeto.
    """
    from services.analytics import analytics_service

    analise = analytics_service.get_analise_completa()
    kpis = analise["kpis"]

    return {
        "projeto": "Hotel Upscale Ribeirão Pires",
        "score_viabilidade": kpis["score_viabilidade"],
        "indicadores_chave": {
            "visitantes_ano": kpis["publico_total_eventos"],
            "eventos_ano": kpis["total_eventos_ano"],
            "leitos_atuais": kpis["leitos_disponiveis_cidade"],
            "gap_mercado": kpis["gap_mercado_estimado"],
            "crescimento_empresarial": f"{kpis['crescimento_geral']}%"
        },
        "cenarios_projecao": analise["projecoes"],
        "conclusao": "Viabilidade de mercado FORTE. Gap significativo entre demanda turística (315k visitantes) e oferta hoteleira (200 leitos).",
        "proximos_passos": [
            "Estudo de engenharia e arquitetura",
            "Análise financeira detalhada (CAPEX/OPEX)",
            "Estratégia de parcerias com buffets locais",
            "Planejamento de marketing para inauguração"
        ]
    }


# Handler de erros
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erro interno do servidor",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
