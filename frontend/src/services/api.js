// Servico de API para o Dashboard

const API_BASE = 'http://localhost:8000';

// Funcao auxiliar para fazer requisicoes
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    throw error;
  }
}

// API de Analytics
export const analyticsApi = {
  getKpis: () => fetchApi('/analytics/kpis'),
  getTendencias: () => fetchApi('/analytics/tendencias'),
  getProjecoes: () => fetchApi('/analytics/projecoes'),
  getSazonalidade: () => fetchApi('/analytics/sazonalidade'),
  getCompleto: () => fetchApi('/analytics/completo'),
  getScoreViabilidade: () => fetchApi('/analytics/score-viabilidade'),
  getDemandaEstimada: () => fetchApi('/analytics/demanda-estimada')
};

// API de Empresas
export const empresasApi = {
  listar: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/empresas/${query ? '?' + query : ''}`);
  },
  getEstatisticas: () => fetchApi('/empresas/estatisticas'),
  getSetores: () => fetchApi('/empresas/setores'),
  getCnaes: () => fetchApi('/empresas/cnaes'),
  getById: (id) => fetchApi(`/empresas/${id}`),
  criar: (empresa) => fetchApi('/empresas/', {
    method: 'POST',
    body: JSON.stringify(empresa)
  }),
  atualizarStatus: (id, status, notas = null) => fetchApi(`/empresas/${id}/status?status=${status}${notas ? '&notas=' + notas : ''}`, {
    method: 'PUT'
  }),
  getPorSetor: () => fetchApi('/empresas/por-setor/resumo')
};

// API de Eventos
export const eventosApi = {
  listar: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/eventos/${query ? '?' + query : ''}`);
  },
  getResumo: () => fetchApi('/eventos/resumo'),
  getCalendario: () => fetchApi('/eventos/calendario'),
  getImpactoHotel: () => fetchApi('/eventos/impacto-hotel'),
  getById: (id) => fetchApi(`/eventos/${id}`)
};

// API de Concorrencia
export const concorrenciaApi = {
  listarHoteis: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/concorrencia/hoteis${query ? '?' + query : ''}`);
  },
  getAnaliseMercado: () => fetchApi('/concorrencia/analise-mercado'),
  getHotelProposto: () => fetchApi('/concorrencia/hotel-proposto'),
  getComparativoTarifas: () => fetchApi('/concorrencia/comparativo-tarifas'),
  getGapMercado: () => fetchApi('/concorrencia/gap-mercado'),
  getById: (id) => fetchApi(`/concorrencia/${id}`)
};

// API de CNPJ
export const cnpjApi = {
  getConfiguracao: () => fetchApi('/cnpj/configuracao'),
  setConfiguracao: (config) => fetchApi('/cnpj/configuracao', {
    method: 'POST',
    body: JSON.stringify(config)
  }),
  consultar: (cnpj) => fetchApi(`/cnpj/consultar/${cnpj}`),
  consultarLote: (cnpjs) => fetchApi('/cnpj/consultar-lote', {
    method: 'POST',
    body: JSON.stringify(cnpjs)
  }),
  getStatus: () => fetchApi('/cnpj/status')
};

// API Geral
export const api = {
  getResumo: () => fetchApi('/resumo'),
  healthCheck: () => fetchApi('/health')
};

export default api;
