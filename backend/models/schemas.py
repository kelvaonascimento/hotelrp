from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from enum import Enum


class PorteEmpresa(str, Enum):
    MEI = "MEI"
    ME = "ME"
    EPP = "EPP"
    OUTROS = "OUTROS"


class StatusParceria(str, Enum):
    PROSPECTADO = "prospectado"
    CONTATADO = "contatado"
    PARCEIRO = "parceiro"
    NAO_CONTATADO = "nao_contatado"


class ImpactoHotel(str, Enum):
    ALTO = "alto"
    MEDIO = "medio"
    BAIXO = "baixo"


# Schemas de Empresa
class EmpresaBase(BaseModel):
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str] = None
    cnae_principal: str
    cnae_descricao: str
    data_abertura: date
    municipio: str
    bairro: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    porte: PorteEmpresa
    setor_hotel: str  # Categoria para o hotel (buffet, eventos, etc)


class EmpresaCreate(EmpresaBase):
    pass


class Empresa(EmpresaBase):
    id: int
    status_parceria: StatusParceria = StatusParceria.NAO_CONTATADO
    notas: Optional[str] = None

    class Config:
        from_attributes = True


# Schemas de Evento
class EventoBase(BaseModel):
    nome: str
    periodo: str  # Ex: "Agosto", "Dezembro"
    mes_inicio: int
    mes_fim: int
    publico_estimado: int
    impacto_hotel: ImpactoHotel
    descricao: Optional[str] = None
    recorrente: bool = True


class Evento(EventoBase):
    id: int

    class Config:
        from_attributes = True


# Schemas de Concorrencia
class HotelConcorrente(BaseModel):
    id: int
    nome: str
    cidade: str
    quartos: int
    diaria_media: float
    nota_avaliacao: Optional[float] = None
    tipo: str  # hotel, pousada, hotel-fazenda
    distancia_km: Optional[float] = None
    diferenciais: Optional[List[str]] = None


# Schemas de Analytics
class TendenciaSetor(BaseModel):
    setor: str
    cnae: str
    total_empresas: int
    aberturas_12_meses: int
    crescimento_percentual: float
    media_mensal: float


class KPIsDashboard(BaseModel):
    total_empresas_estrategicas: int
    empresas_abertas_ultimo_ano: int
    crescimento_geral: float
    total_eventos_ano: int
    publico_total_eventos: int
    leitos_disponiveis_cidade: int
    gap_mercado_estimado: int
    score_viabilidade: float  # 0 a 100


class ProjecaoOcupacao(BaseModel):
    cenario: str  # conservador, moderado, otimista
    ocupacao_media_anual: float
    revpar_estimado: float
    receita_anual_estimada: float
    payback_anos: Optional[float] = None


class AnalyticsResponse(BaseModel):
    kpis: KPIsDashboard
    tendencias_setor: List[TendenciaSetor]
    projecoes: List[ProjecaoOcupacao]


# Schemas de Filtros
class FiltroEmpresas(BaseModel):
    cnaes: Optional[List[str]] = None
    setor: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    porte: Optional[PorteEmpresa] = None
    status_parceria: Optional[StatusParceria] = None


# Schema de CNAE
class CNAEInfo(BaseModel):
    codigo: str
    descricao: str
    setor_hotel: str
    relevancia: str  # parceria, concorrencia, demanda, fornecedor
