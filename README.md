# Hotel RP - Dashboard de Viabilidade

Dashboard interativo para analise de viabilidade do Hotel em Ribeirao Pires, SP.

## Sobre o Projeto

Este sistema foi desenvolvido para auxiliar na analise de viabilidade de um empreendimento hoteleiro upscale em Ribeirao Pires, oferecendo:

- **Analise de empresas** por CNAE estrategico
- **Calendario de eventos** turisticos e impacto no hotel
- **Mapeamento de concorrencia** regional
- **Projecoes financeiras** em diferentes cenarios
- **Base de contatos** para parcerias comerciais

## Arquitetura

```
hotelrp/
├── backend/                 # API FastAPI (Python)
│   ├── main.py             # Aplicacao principal
│   ├── api/                # Endpoints REST
│   ├── services/           # Logica de negocio
│   ├── models/             # Schemas Pydantic
│   └── data/               # Dados JSON
│
├── frontend/               # Dashboard React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Integracao API
│   │   └── data/           # Constantes
│   └── package.json
│
└── docs/                   # Documentacao
```

## Requisitos

### Backend
- Python 3.11+
- FastAPI
- uvicorn
- pandas
- openpyxl

### Frontend
- Node.js 18+
- React 18
- Vite
- Tailwind CSS
- Recharts

## Instalacao

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Executar servidor
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Executar em desenvolvimento
npm run dev
```

## Uso

1. Inicie o backend: `uvicorn main:app --reload`
2. Inicie o frontend: `npm run dev`
3. Acesse: http://localhost:5173

O dashboard funciona mesmo sem o backend (modo offline), usando dados do estudo de viabilidade.

## Endpoints da API

### Analytics
- `GET /analytics/kpis` - KPIs principais
- `GET /analytics/tendencias` - Tendencias por setor
- `GET /analytics/projecoes` - Projecoes financeiras
- `GET /analytics/completo` - Analise completa

### Empresas
- `GET /empresas/` - Listar empresas
- `GET /empresas/estatisticas` - Estatisticas
- `POST /empresas/` - Adicionar empresa
- `PUT /empresas/{id}/status` - Atualizar status

### Eventos
- `GET /eventos/` - Listar eventos
- `GET /eventos/calendario` - Calendario mensal
- `GET /eventos/impacto-hotel` - Analise de impacto

### Concorrencia
- `GET /concorrencia/hoteis` - Listar hoteis
- `GET /concorrencia/gap-mercado` - Analise de gaps

### CNPJ (Configuravel)
- `GET /cnpj/configuracao` - Ver configuracao
- `POST /cnpj/configuracao` - Configurar API
- `GET /cnpj/consultar/{cnpj}` - Consultar CNPJ

## Dados do Estudo

### Indicadores Principais
- **315.000** visitantes/ano
- **127** eventos no calendario
- **200** leitos disponiveis (insuficiente)
- **82.5** score de viabilidade

### Hotel Proposto
- **55** quartos upscale
- **R$ 280** diaria target
- Rooftop bar panoramico
- Restaurante gastronomico
- Centro de convencoes

### Projecao (Cenario Moderado)
- **60%** ocupacao media
- **R$ 168** RevPAR
- **R$ 5.38M** receita anual

## Configuracao da API de CNPJ

Para consultar CNPJs em tempo real, configure a API:

```bash
curl -X POST http://localhost:8000/cnpj/configuracao \
  -H "Content-Type: application/json" \
  -d '{
    "base_url": "https://www.receitaws.com.br/v1/cnpj",
    "api_key": null
  }'
```

## Tecnologias

- **Backend**: FastAPI, Python, SQLite
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Dados**: JSON, pandas, openpyxl

## Licenca

Projeto privado para estudo de viabilidade.

---

Desenvolvido para analise de viabilidade do Hotel Ribeirao Pires.
Dados: Prefeitura RP, IBGE, Sebrae | Dezembro 2025
