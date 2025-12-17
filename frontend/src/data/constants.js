// Dados constantes do Dashboard de Viabilidade

export const CNAES_ESTRATEGICOS = {
  "Buffets/Catering": ["5620-1/01", "5620-1/02"],
  "Organizacao de Eventos": ["8230-0/01"],
  "Restaurantes": ["5611-2/01"],
  "Bares": ["5611-2/02"],
  "Hospedagem": ["5510-8/01", "5510-8/02", "5590-6/01", "5590-6/02", "5590-6/03", "5590-6/99"],
  "Turismo": ["7911-2/00", "7912-1/00"],
  "Transporte Turistico": ["4929-9/01", "4929-9/02"],
  "Producao de Eventos": ["9001-9/01", "9001-9/02", "9001-9/06"],
  "Entretenimento": ["9329-8/99"],
  "Fotografia": ["7420-0/01", "7420-0/04"]
};

export const MESES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const CORES_SETOR = {
  "Buffets/Catering": "#10b981",
  "Organizacao de Eventos": "#3b82f6",
  "Restaurantes": "#f59e0b",
  "Bares": "#8b5cf6",
  "Hospedagem": "#ef4444",
  "Turismo": "#06b6d4",
  "Transporte Turistico": "#84cc16",
  "Producao de Eventos": "#ec4899",
  "Entretenimento": "#f97316",
  "Fotografia": "#6366f1"
};

export const CORES_IMPACTO = {
  alto: "#ef4444",
  medio: "#f59e0b",
  baixo: "#10b981"
};

export const STATUS_PARCERIA = {
  nao_contatado: { label: "Nao contatado", color: "#9ca3af" },
  prospectado: { label: "Prospectado", color: "#3b82f6" },
  contatado: { label: "Contatado", color: "#f59e0b" },
  parceiro: { label: "Parceiro", color: "#10b981" }
};

// Dados do estudo de viabilidade (fallback quando API nao esta disponivel)
export const DADOS_VIABILIDADE = {
  kpis: {
    total_empresas_estrategicas: 624, // 326 (2024) + 298 (jan-set 2025)
    empresas_abertas_ultimo_ano: 298,
    crescimento_geral: 15.2,
    total_eventos_ano: 127,
    publico_total_eventos: 315000,
    leitos_disponiveis_cidade: 200,
    gap_mercado_estimado: 4300,
    score_viabilidade: 82.5
  },
  eventos: [
    { id: 1, nome: "Festival do Chocolate", mes: 8, publico: 180000, impacto: "alto" },
    { id: 2, nome: "Natal Magico", mes: 12, publico: 50000, impacto: "alto" },
    { id: 3, nome: "Entoada Nordestina", mes: 3, publico: 25000, impacto: "medio" },
    { id: 4, nome: "Festival Oriental", mes: 5, publico: 10000, impacto: "medio" },
    { id: 5, nome: "Festa Italiana", mes: 9, publico: 23000, impacto: "medio" },
    { id: 6, nome: "Festa do Pilar", mes: 10, publico: 10000, impacto: "medio" },
    { id: 7, nome: "FLIRP", mes: 9, publico: 5000, impacto: "medio" },
    { id: 8, nome: "Festa de Santo Antonio", mes: 6, publico: 10000, impacto: "medio" },
    { id: 9, nome: "Carnaval", mes: 2, publico: 15000, impacto: "medio" },
    { id: 10, nome: "Ecoturismo e Trilhas", mes: 0, publico: 20000, impacto: "medio" }
  ],
  hoteis: [
    { nome: "Hotel Pilar", cidade: "Ribeirao Pires", quartos: 75, diaria: 300, nota: 7.5 },
    { nome: "Hotel WR", cidade: "Ribeirao Pires", quartos: 10, diaria: 230, nota: null },
    { nome: "Hotel Infinity", cidade: "Maua", quartos: 50, diaria: 240, nota: 8.1 },
    { nome: "Villa Brites", cidade: "Maua", quartos: 30, diaria: 250, nota: 8.9 },
    { nome: "Plaza Mayor", cidade: "Santo Andre", quartos: 80, diaria: 390, nota: 8.0 },
    { nome: "Bristol ABC", cidade: "Santo Andre", quartos: 100, diaria: 350, nota: 8.2 }
  ],
  projecoes: [
    { cenario: "conservador", ocupacao: 50, revpar: 126, receita: 3850000 },
    { cenario: "moderado", ocupacao: 60, revpar: 168, receita: 5380000 },
    { cenario: "otimista", ocupacao: 72, revpar: 221, receita: 7100000 }
  ],
  hotel_proposto: {
    quartos: 55,
    diaria_target: 280,
    diferenciais: [
      "Rooftop bar panoramico",
      "Restaurante gastronomico",
      "Centro de convencoes",
      "Localizacao central"
    ]
  }
};

export const EMPRESAS_EXEMPLO = [
  { id: 1, nome: "Buffet Di Matoso", setor: "Buffets/Catering", status: "prospectado", cnae: "5620-1/02" },
  { id: 2, nome: "Requinte Buffet", setor: "Buffets/Catering", status: "nao_contatado", cnae: "5620-1/02" },
  { id: 3, nome: "Espaco Festa", setor: "Entretenimento", status: "nao_contatado", cnae: "9329-8/99" },
  { id: 4, nome: "Sabor da Serra", setor: "Restaurantes", status: "nao_contatado", cnae: "5611-2/01" },
  { id: 5, nome: "Viagem Certa", setor: "Turismo", status: "contatado", cnae: "7911-2/00" },
  { id: 6, nome: "Foto e Filme", setor: "Fotografia", status: "nao_contatado", cnae: "7420-0/04" },
  { id: 7, nome: "Organizando Eventos", setor: "Organizacao de Eventos", status: "nao_contatado", cnae: "8230-0/01" },
  { id: 8, nome: "Transfer ABC", setor: "Transporte Turistico", status: "nao_contatado", cnae: "4929-9/01" },
  { id: 9, nome: "Bar do Mirante", setor: "Bares", status: "nao_contatado", cnae: "5611-2/02" },
  { id: 10, nome: "Pousada Verde Vale", setor: "Hospedagem", status: "nao_contatado", cnae: "5590-6/99" }
];
