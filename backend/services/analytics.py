"""
Serviço de analytics e cálculos de viabilidade para o hotel.
"""
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict

DATA_PATH = Path(__file__).parent.parent / "data"


class AnalyticsService:
    """Serviço de análises e projeções para viabilidade do hotel."""

    def __init__(self):
        self.eventos = self._load_json("eventos.json")
        self.concorrencia = self._load_json("concorrencia.json")
        self.empresas = self._load_json("empresas_exemplo.json")

    def _load_json(self, filename: str) -> dict:
        """Carrega arquivo JSON de dados."""
        filepath = DATA_PATH / filename
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def calcular_kpis(self, empresas: List[dict] = None) -> dict:
        """
        Calcula KPIs principais do dashboard.

        Returns:
            Dict com todos os KPIs calculados
        """
        if empresas is None:
            empresas = self.empresas.get("empresas", [])

        # Total de empresas estratégicas
        total_empresas = len(empresas)

        # Empresas abertas no último ano
        um_ano_atras = date.today() - timedelta(days=365)
        empresas_ultimo_ano = sum(
            1 for e in empresas
            if datetime.strptime(e.get("data_abertura", "2000-01-01"), "%Y-%m-%d").date() > um_ano_atras
        )

        # Crescimento (simulado baseado nos dados do estudo)
        # 2024: 326 empresas, jan-set 2025: 298 = ~33/mês
        crescimento_geral = 15.2  # % baseado nos dados do estudo

        # Eventos
        eventos_data = self.eventos.get("resumo", {})
        total_eventos = eventos_data.get("total_eventos_ano", 127)
        publico_total = eventos_data.get("publico_total_estimado", 315000)

        # Concorrência
        conc_data = self.concorrencia.get("analise_mercado", {})
        leitos_cidade = conc_data.get("leitos_ribeirao_pires", 200)

        # Gap de mercado estimado (visitantes que poderiam pernoitar vs leitos)
        # Assumindo 2% dos visitantes pernoitariam = 6.300 diárias/ano
        # Oferta: 200 leitos x 365 x 60% ocupação = 43.800 diárias
        # Mas muitos vão para outras cidades
        gap_estimado = int(publico_total * 0.02) - int(leitos_cidade * 365 * 0.5)
        gap_estimado = max(0, gap_estimado)

        # Score de viabilidade (0-100)
        # Baseado em múltiplos fatores
        score = self._calcular_score_viabilidade(
            total_empresas, crescimento_geral, total_eventos,
            publico_total, leitos_cidade
        )

        return {
            "total_empresas_estrategicas": total_empresas,
            "empresas_abertas_ultimo_ano": empresas_ultimo_ano,
            "crescimento_geral": crescimento_geral,
            "total_eventos_ano": total_eventos,
            "publico_total_eventos": publico_total,
            "leitos_disponiveis_cidade": leitos_cidade,
            "gap_mercado_estimado": gap_estimado,
            "score_viabilidade": score
        }

    def _calcular_score_viabilidade(
        self,
        total_empresas: int,
        crescimento: float,
        eventos: int,
        publico: int,
        leitos: int
    ) -> float:
        """
        Calcula score de viabilidade de 0 a 100.

        Pesos:
        - Crescimento empresarial: 20%
        - Volume de eventos: 25%
        - Público turístico: 25%
        - Gap de mercado (poucos leitos): 30%
        """
        # Normalização e pontuação

        # Crescimento (0-20 pontos) - 15% é bom
        score_crescimento = min(20, crescimento * 1.33)

        # Eventos (0-25 pontos) - 100+ eventos é excelente
        score_eventos = min(25, eventos * 0.25)

        # Público (0-25 pontos) - 300k+ é excelente
        score_publico = min(25, (publico / 300000) * 25)

        # Gap de mercado (0-30 pontos) - menos leitos = maior oportunidade
        # 200 leitos para 315k visitantes é muito pouco
        ratio_leitos = leitos / max(1, publico / 1000)  # leitos por mil visitantes
        # Quanto menor o ratio, maior o score
        score_gap = min(30, (10 / max(0.1, ratio_leitos)) * 3)

        total = score_crescimento + score_eventos + score_publico + score_gap
        return round(min(100, max(0, total)), 1)

    def calcular_tendencias_setor(self, empresas: List[dict] = None) -> List[dict]:
        """
        Calcula tendências por setor.

        Returns:
            Lista de tendências por setor
        """
        if empresas is None:
            empresas = self.empresas.get("empresas", [])

        # Agrupar por setor
        por_setor = defaultdict(list)
        for emp in empresas:
            setor = emp.get("setor_hotel", "Outros")
            por_setor[setor].append(emp)

        tendencias = []
        um_ano_atras = date.today() - timedelta(days=365)

        for setor, lista in por_setor.items():
            total = len(lista)

            # Contar aberturas no último ano
            aberturas_12m = sum(
                1 for e in lista
                if datetime.strptime(e.get("data_abertura", "2000-01-01"), "%Y-%m-%d").date() > um_ano_atras
            )

            # Crescimento percentual (simplificado)
            crescimento = (aberturas_12m / max(1, total - aberturas_12m)) * 100 if total > 0 else 0

            # Média mensal
            media_mensal = aberturas_12m / 12

            # Pegar CNAE mais comum do setor
            cnaes = [e.get("cnae_principal", "") for e in lista]
            cnae_comum = max(set(cnaes), key=cnaes.count) if cnaes else ""

            tendencias.append({
                "setor": setor,
                "cnae": cnae_comum,
                "total_empresas": total,
                "aberturas_12_meses": aberturas_12m,
                "crescimento_percentual": round(crescimento, 1),
                "media_mensal": round(media_mensal, 2)
            })

        # Ordenar por total de empresas
        tendencias.sort(key=lambda x: x["total_empresas"], reverse=True)
        return tendencias

    def calcular_projecoes(self) -> List[dict]:
        """
        Calcula projeções de ocupação e receita para diferentes cenários.

        Returns:
            Lista de projeções para cenários conservador, moderado e otimista
        """
        hotel = self.concorrencia.get("hotel_proposto", {})
        quartos = hotel.get("quartos_estimados", 55)
        diaria_media = hotel.get("diaria_media_target", 280)

        cenarios = [
            {
                "nome": "conservador",
                "ocupacao": 0.50,
                "diaria_ajuste": 0.90  # 10% desconto
            },
            {
                "nome": "moderado",
                "ocupacao": 0.60,
                "diaria_ajuste": 1.0
            },
            {
                "nome": "otimista",
                "ocupacao": 0.72,
                "diaria_ajuste": 1.10  # 10% premium
            }
        ]

        projecoes = []
        for cenario in cenarios:
            ocupacao = cenario["ocupacao"]
            diaria = diaria_media * cenario["diaria_ajuste"]

            # RevPAR = Diária média * Ocupação
            revpar = diaria * ocupacao

            # Receita anual de quartos
            diarias_vendidas = quartos * 365 * ocupacao
            receita_quartos = diarias_vendidas * diaria

            # Receita adicional (restaurante + rooftop + eventos) ~40% da receita de quartos
            receita_fb = receita_quartos * 0.40

            receita_total = receita_quartos + receita_fb

            projecoes.append({
                "cenario": cenario["nome"],
                "ocupacao_media_anual": round(ocupacao * 100, 1),
                "revpar_estimado": round(revpar, 2),
                "receita_anual_estimada": round(receita_total, 2),
                "payback_anos": None  # Requer dados de investimento
            })

        return projecoes

    def get_eventos_por_mes(self) -> Dict[int, List[dict]]:
        """
        Agrupa eventos por mês para timeline.

        Returns:
            Dict com mês como chave e lista de eventos
        """
        eventos = self.eventos.get("eventos", [])
        por_mes = defaultdict(list)

        for evento in eventos:
            mes_inicio = evento.get("mes_inicio", 1)
            mes_fim = evento.get("mes_fim", mes_inicio)

            for mes in range(mes_inicio, mes_fim + 1):
                por_mes[mes].append({
                    "id": evento.get("id"),
                    "nome": evento.get("nome"),
                    "publico": evento.get("publico_estimado"),
                    "impacto": evento.get("impacto_hotel")
                })

        return dict(por_mes)

    def calcular_sazonalidade(self) -> List[dict]:
        """
        Calcula índice de sazonalidade por mês baseado nos eventos.

        Returns:
            Lista com índice de sazonalidade para cada mês
        """
        eventos_mes = self.get_eventos_por_mes()

        meses = [
            "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]

        sazonalidade = []
        publico_total = sum(
            sum(e["publico"] for e in eventos)
            for eventos in eventos_mes.values()
        )
        media_mensal = publico_total / 12

        for i, mes in enumerate(meses, 1):
            eventos = eventos_mes.get(i, [])
            publico_mes = sum(e["publico"] for e in eventos)

            # Índice: 100 = média, >100 = alta temporada, <100 = baixa
            indice = (publico_mes / max(1, media_mensal)) * 100

            # Ocupação projetada baseada no índice
            ocupacao_base = 0.55  # 55% média
            ocupacao_projetada = min(0.90, ocupacao_base * (indice / 100))

            sazonalidade.append({
                "mes": i,
                "nome_mes": mes,
                "publico_eventos": publico_mes,
                "num_eventos": len(eventos),
                "indice_sazonalidade": round(indice, 1),
                "ocupacao_projetada": round(ocupacao_projetada * 100, 1),
                "classificacao": "alta" if indice > 120 else "media" if indice > 80 else "baixa"
            })

        return sazonalidade

    def get_analise_completa(self, empresas: List[dict] = None) -> dict:
        """
        Retorna análise completa para o dashboard.

        Returns:
            Dict com KPIs, tendências, projeções e sazonalidade
        """
        return {
            "kpis": self.calcular_kpis(empresas),
            "tendencias_setor": self.calcular_tendencias_setor(empresas),
            "projecoes": self.calcular_projecoes(),
            "sazonalidade": self.calcular_sazonalidade(),
            "eventos_resumo": self.eventos.get("resumo", {}),
            "mercado": self.concorrencia.get("analise_mercado", {}),
            "hotel_proposto": self.concorrencia.get("hotel_proposto", {})
        }


# Instância global
analytics_service = AnalyticsService()
