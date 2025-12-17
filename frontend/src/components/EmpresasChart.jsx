import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Building2, TrendingUp, Users, Heart, Briefcase, Plane, ArrowUpRight, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { empresasApi } from '../services/api';

// Mapeamento de setores para categorias de demanda
const CATEGORIA_MAP = {
  'Buffets/Catering': { categoria: 'casamentos_eventos', nome: 'Casamentos & Eventos' },
  'Fotografia': { categoria: 'casamentos_eventos', nome: 'Casamentos & Eventos' },
  'Organizacao de Eventos': { categoria: 'casamentos_eventos', nome: 'Casamentos & Eventos' },
  'Entretenimento': { categoria: 'casamentos_eventos', nome: 'Casamentos & Eventos' },
  'Turismo': { categoria: 'turismo', nome: 'Turismo & Lazer' },
  'Transporte Turistico': { categoria: 'turismo', nome: 'Turismo & Lazer' },
  'Restaurantes': { categoria: 'gastronomia', nome: 'Gastronomia' },
  'Bares': { categoria: 'gastronomia', nome: 'Gastronomia' },
  'Hospedagem': { categoria: 'concorrencia', nome: 'Concorrencia' }
};

const CORES_CATEGORIAS = {
  casamentos_eventos: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', chart: '#ec4899' },
  turismo: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', chart: '#3b82f6' },
  gastronomia: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', chart: '#f97316' },
  concorrencia: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', chart: '#6b7280' }
};

const ICON_MAP = {
  casamentos_eventos: Heart,
  turismo: Plane,
  gastronomia: Users,
  concorrencia: Building2
};

function EmpresasChart() {
  const [empresas, setEmpresas] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [porSetor, setPorSetor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empresasRes, estatRes, setorRes] = await Promise.all([
        empresasApi.listar({ limit: 500 }),
        empresasApi.getEstatisticas(),
        empresasApi.getPorSetor()
      ]);

      setEmpresas(empresasRes.empresas || []);
      setEstatisticas(estatRes);
      setPorSetor(setorRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da API. Verifique se o backend esta rodando.');
    } finally {
      setLoading(false);
    }
  };

  // Agrupar empresas por categoria de demanda
  const categoriasDemanda = React.useMemo(() => {
    const categorias = {
      casamentos_eventos: { nome: 'Casamentos & Eventos', descricao: 'Indicam demanda por eventos no hotel', setores: {}, total: 0 },
      turismo: { nome: 'Turismo & Lazer', descricao: 'Indicam fluxo turistico', setores: {}, total: 0 },
      gastronomia: { nome: 'Gastronomia', descricao: 'Potencial do rooftop e F&B', setores: {}, total: 0 },
      concorrencia: { nome: 'Hospedagem (Concorrencia)', descricao: 'Oferta hoteleira atual', setores: {}, total: 0 }
    };

    Object.entries(porSetor).forEach(([setor, dados]) => {
      const mapping = CATEGORIA_MAP[setor];
      if (mapping) {
        const cat = mapping.categoria;
        categorias[cat].setores[setor] = dados.total;
        categorias[cat].total += dados.total;
      }
    });

    return categorias;
  }, [porSetor]);

  // Dados para grafico de pizza
  const dadosPizza = React.useMemo(() => {
    return Object.entries(categoriasDemanda)
      .filter(([key]) => key !== 'concorrencia')
      .map(([key, cat]) => ({
        name: cat.nome,
        value: cat.total,
        color: CORES_CATEGORIAS[key].chart
      }));
  }, [categoriasDemanda]);

  // Dados para grafico de barras por setor
  const dadosBarras = React.useMemo(() => {
    return Object.entries(porSetor)
      .map(([setor, dados]) => ({
        setor: setor.length > 15 ? setor.substring(0, 15) + '...' : setor,
        setorCompleto: setor,
        total: dados.total
      }))
      .sort((a, b) => b.total - a.total);
  }, [porSetor]);

  // Calcular insights
  const insights = React.useMemo(() => {
    const buffets = porSetor['Buffets/Catering']?.total || 0;
    const fotografos = porSetor['Fotografia']?.total || 0;
    const restaurantes = porSetor['Restaurantes']?.total || 0;
    const bares = porSetor['Bares']?.total || 0;

    return {
      casamentosEstimados: Math.round(buffets * 1.5 + fotografos * 0.5),
      potencialGastronomico: restaurantes + bares,
      totalEstrategico: estatisticas?.total_empresas || 0
    };
  }, [porSetor, estatisticas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Carregando dados de empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analise de Mercado</h2>
          <p className="text-muted-foreground">
            Empresas de Ribeirao Pires - Indicadores de demanda para o hotel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Info className="h-3 w-3" />
            Dados: API CNPJs
          </Badge>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Total Empresas</span>
            </div>
            <p className="text-3xl font-bold">{estatisticas?.total_empresas || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Cadastradas na base</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Setor Eventos</span>
            </div>
            <p className="text-3xl font-bold text-pink-600">{categoriasDemanda.casamentos_eventos.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Buffets, fotos, organizacao</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Gastronomia</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{categoriasDemanda.gastronomia.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Restaurantes e bares</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Plane className="h-4 w-4" />
              <span className="text-sm font-medium">Turismo</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{categoriasDemanda.turismo.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Agencias e transporte</p>
          </CardContent>
        </Card>
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico de Pizza - Distribuicao por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuicao por Categoria de Demanda</CardTitle>
            <CardDescription>Empresas agrupadas por relevancia para o hotel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} empresas`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-3">
                {dadosPizza.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.value} empresas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grafico de Barras - Por Setor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresas por Setor</CardTitle>
            <CardDescription>Total de empresas por setor estrategico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarras} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="setor" type="category" width={110} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value, name, props) => [`${value} empresas`, props.payload.setorCompleto]}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por Categoria */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detalhes por Categoria de Demanda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoriasDemanda)
            .filter(([key]) => key !== 'concorrencia')
            .map(([key, cat]) => {
              const Icon = ICON_MAP[key];
              const cores = CORES_CATEGORIAS[key];
              const isExpanded = categoriaExpandida === key;
              const setoresCount = Object.keys(cat.setores).length;

              return (
                <Card
                  key={key}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isExpanded && "ring-2 ring-primary"
                  )}
                  onClick={() => setCategoriaExpandida(isExpanded ? null : key)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", cores.bg)}>
                          <Icon className={cn("h-5 w-5", cores.text)} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cat.nome}</h4>
                          <p className="text-xs text-muted-foreground">{cat.descricao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{cat.total}</p>
                        <p className="text-xs text-muted-foreground">{setoresCount} setores</p>
                      </div>
                    </div>

                    {/* Setores detalhados */}
                    {isExpanded && Object.keys(cat.setores).length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {Object.entries(cat.setores).map(([setor, total]) => (
                          <div key={setor} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{setor}</span>
                            <Badge variant="secondary">{total}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      {isExpanded ? 'Clique para fechar' : 'Clique para ver detalhes'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Correlacao com Demanda Hoteleira */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Correlacao: Empresas → Demanda Hoteleira</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-primary-foreground/70">Casamentos Estimados</p>
              <p className="text-3xl font-bold">{insights.casamentosEstimados}/mes</p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Baseado em {porSetor['Buffets/Catering']?.total || 0} buffets + {porSetor['Fotografia']?.total || 0} fotografos
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Potencial Gastronomico</p>
              <p className="text-3xl font-bold">{insights.potencialGastronomico} empresas</p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Mercado aquecido para rooftop bar
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Total Estrategico</p>
              <p className="text-3xl font-bold">{insights.totalEstrategico}</p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Empresas relevantes para o hotel
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary-foreground/20">
            <p className="text-sm text-primary-foreground/90">
              <strong>Analise:</strong> A presenca de {categoriasDemanda.casamentos_eventos.total} empresas
              no setor de eventos indica demanda por espacos para casamentos e eventos sociais.
              O setor gastronomico com {categoriasDemanda.gastronomia.total} empresas confirma
              mercado aquecido para o rooftop bar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresas Cadastradas</CardTitle>
          <CardDescription>Lista completa das empresas por setor estrategico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium">Setor</th>
                  <th className="text-left py-3 px-4 font-medium">CNAE</th>
                  <th className="text-left py-3 px-4 font-medium">Abertura</th>
                  <th className="text-center py-3 px-4 font-medium">Porte</th>
                </tr>
              </thead>
              <tbody>
                {empresas.slice(0, 15).map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{emp.nome_fantasia || emp.razao_social}</p>
                        <p className="text-xs text-muted-foreground">CNPJ: {emp.cnpj}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{emp.setor_hotel}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs">{emp.cnae_principal}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{emp.cnae_descricao}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {emp.data_abertura ? new Date(emp.data_abertura).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={emp.porte === 'ME' ? 'default' : emp.porte === 'EPP' ? 'secondary' : 'outline'}>
                        {emp.porte}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {empresas.length > 15 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Mostrando 15 de {empresas.length} empresas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info sobre por porte */}
      {estatisticas?.por_porte && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Distribuicao por Porte</h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(estatisticas.por_porte).map(([porte, total]) => (
                <div key={porte} className="flex items-center gap-2">
                  <Badge variant="outline">{porte}</Badge>
                  <span className="text-sm text-muted-foreground">{total} empresas</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * MEI = Microempreendedor Individual | ME = Microempresa | EPP = Empresa de Pequeno Porte
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EmpresasChart;
