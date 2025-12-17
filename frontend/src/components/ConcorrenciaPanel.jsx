import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import {
  Hotel, BedDouble, DollarSign, Star, MapPin, CheckCircle2,
  Home, Users, Briefcase, Heart, Calendar, Plane, Info, ExternalLink,
  Building2, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { concorrenciaApi } from '../services/api';
// IMPORTAR TODOS OS DADOS DO ARQUIVO CENTRALIZADO
import {
  DADOS_VIABILIDADE,
  HOTEL_PROPOSTO,
  HOTEIS_DETALHADOS,
  CONCORRENTES_RAIO,
  AIRBNB_DATA,
  DEMANDA_PERIODO,
  MOTIVOS_VIAGEM,
  CRITERIOS_CONCORRENCIA,
  QUARTOS_RIBEIRAO_PIRES,
  LEITOS_RIBEIRAO_PIRES,
  QUARTOS_REGIAO_15KM,
  HOTEIS_REGIAO_COUNT
} from '../data/constants';

const CORES_PIE = ['#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

function ConcorrenciaPanel() {
  const [hoteis, setHoteis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const hoteisData = await concorrenciaApi.listarHoteis();
      setHoteis(hoteisData.hoteis || []);
    } catch (err) {
      setHoteis(DADOS_VIABILIDADE.hoteis);
    } finally {
      setLoading(false);
    }
  };

  // Dados para grafico de pizza dos motivos
  const dadosMotivos = MOTIVOS_VIAGEM.map(m => ({
    name: m.motivo,
    value: m.percentual,
    color: m.cor
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analise de Concorrencia</h2>
          <p className="text-muted-foreground">Mercado hoteleiro, Airbnb e demanda regional</p>
        </div>
        <Badge variant="outline" className="gap-1 w-fit">
          <Info className="h-3 w-3" />
          Fontes: SPTuris, Airbnb, Booking, Kayak
        </Badge>
      </div>

      {/* KPIs principais - USANDO DADOS CENTRALIZADOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Hotel className="h-4 w-4" />
              <span className="text-sm">Hoteis (15km)</span>
            </div>
            <p className="text-3xl font-bold">{HOTEIS_REGIAO_COUNT}</p>
            <p className="text-xs text-muted-foreground mt-1">{QUARTOS_REGIAO_15KM} quartos total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Home className="h-4 w-4" />
              <span className="text-sm">Airbnb RP</span>
            </div>
            <p className="text-3xl font-bold">~{AIRBNB_DATA.totalAnuncios}</p>
            <p className="text-xs text-muted-foreground mt-1">R$ {AIRBNB_DATA.precoMedioNoite}/noite media</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BedDouble className="h-4 w-4" />
              <span className="text-sm">Leitos RP</span>
            </div>
            <p className="text-3xl font-bold">{LEITOS_RIBEIRAO_PIRES}</p>
            <p className="text-xs text-muted-foreground mt-1">{QUARTOS_RIBEIRAO_PIRES} quartos</p>
            <Badge variant="destructive" className="mt-1">Insuficiente</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">Upscale em RP</span>
            </div>
            <p className="text-3xl font-bold">0</p>
            <Badge className="mt-1 bg-green-600">Oportunidade!</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Motivos de Viagem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por que Procuram Hoteis na Regiao?</CardTitle>
          <CardDescription>Motivos de viagem - Fonte: SPTuris, CIET, Observatorio do Turismo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Grafico de Pizza */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosMotivos}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {dadosMotivos.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de motivos */}
            <div className="space-y-3">
              {MOTIVOS_VIAGEM.map((motivo, idx) => {
                const icons = { 'Lazer/Turismo': Plane, 'Negocios/Trabalho': Briefcase, 'Eventos/Casamentos': Heart, 'Outros': Users };
                const Icon = icons[motivo.motivo] || Users;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${motivo.cor}20` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: motivo.cor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{motivo.motivo}</p>
                        <Badge variant="secondary">{motivo.percentual}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{motivo.descricao}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-sm">
              <strong>Insight:</strong> 49% viajam a lazer (festivais, ecoturismo) + 15% para eventos/casamentos =
              <strong> 64% da demanda e de LAZER</strong>, justificando foco em fins de semana e eventos.
              Os 28% corporativos sustentam ocupacao durante a semana.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ocupacao Hoteleira SP - DADOS VERIFICADOS 2025 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ocupacao Hoteleira - Sao Paulo 2025</CardTitle>
          <CardDescription>
            Dados verificados - ABIH-SP (64a edicao), CoStar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {DEMANDA_PERIODO.map((periodo, idx) => (
              <div key={idx} className={cn(
                "p-4 rounded-lg border-2",
                periodo.perfil === 'EVENTOS' ? 'border-amber-200 bg-amber-50/50' : 'border-blue-200 bg-blue-50/50'
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{periodo.periodo}</h4>
                  <Badge variant={periodo.perfil === 'EVENTOS' ? 'default' : 'secondary'}>
                    {periodo.perfil}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Ocupacao Sao Paulo */}
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Ocupacao SP</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-700">{periodo.ocupacaoSP}%</span>
                      <p className="text-[10px] text-muted-foreground">{periodo.fonte}</p>
                    </div>
                  </div>

                  {/* Diaria media */}
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">Diaria media</span>
                    <div className="text-right">
                      <span className="font-semibold">R$ {periodo.diariaSP.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* RevPAR */}
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm">RevPAR</span>
                    <div className="text-right">
                      <span className="font-semibold">R$ {periodo.revparSP.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Pico F1 se existir */}
                  {periodo.diariaF1Pico && (
                    <div className="p-2 bg-amber-100 rounded border border-amber-200">
                      <p className="text-xs font-medium text-amber-800">Pico F1 (7/nov):</p>
                      <p className="text-sm">
                        <strong>{periodo.ocupacaoF1Pico}%</strong> ocupacao |
                        R$ <strong>{periodo.diariaF1Pico.toFixed(2)}</strong> diaria
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground pt-2 border-t flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Fonte verificada: {periodo.fonte}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dados Sao Paulo 2025 - APENAS VERIFICADOS */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="font-medium text-sm mb-2 flex items-center gap-2">
              Sao Paulo 2025 - Dados ABIH-SP e CoStar
              <Badge variant="outline" className="text-[10px]">Verificado</Badge>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Outubro: <strong>58,61%</strong> ocupacao | R$ 467,16 diaria (ABIH-SP 64a edicao)</li>
              <li>Novembro: <strong>74,3%</strong> ocupacao | R$ 1.025,95 diaria (CoStar - recorde)</li>
              <li>Pico F1 (7/nov): <strong>93,6%</strong> ocupacao | R$ <strong>1.699,90</strong> diaria</li>
            </ul>
          </div>

          {/* Insight para RP - SEM DADOS NAO VERIFICADOS */}
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <p className="text-sm">
              <strong>Oportunidade para Ribeirao Pires:</strong> A hotelaria de SP opera com boa ocupacao,
              especialmente durante eventos. RP pode capturar demanda oferecendo: proximidade as industrias do ABC,
              tarifas competitivas, e experiencia diferenciada (ecoturismo). Grandes eventos como F1 mostram potencial
              de pico - festivais de RP podem gerar efeito similar em escala local.
            </p>
          </div>

          {/* Fontes */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <a href="https://abihsp.com.br/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              ABIH-SP (64a pesquisa) <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://www.panrotas.com.br/destinos/eventos/2025/12/formula-1-leva-desempenho-hoteleiro-de-sao-paulo-a-recordes-historicos_224323.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              CoStar/Panrotas Nov/2025 <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://brasilturis.com.br/2025/11/19/hotelaria-paulista-mantem-estabilidade-em-outubro-e-projeta-alta-com-eventos-e-feriados/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              Brasilturis 2025 <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Airbnb Analysis - DADOS VERIFICADOS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="h-5 w-5" />
                Hospedagem Alternativa em Ribeirao Pires
              </CardTitle>
              <CardDescription>Dados verificados - Airbnb, LarDeFerias, agregadores | {AIRBNB_DATA.dataAtualizacao}</CardDescription>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.lardeferias.com.br/ribeirao-pires/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                LarDeFerias <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://www.airbnb.com/ribeirao-pires-brazil/stays"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Airbnb <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* KPIs principais verificados */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{AIRBNB_DATA.totalAnuncios}</p>
              <p className="text-xs text-muted-foreground">Anuncios verificados</p>
              <Badge variant="outline" className="mt-1 text-[10px]">LarDeFerias</Badge>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">R$ {AIRBNB_DATA.precoMedioNoite}</p>
              <p className="text-xs text-muted-foreground">Preco medio/noite (a partir de)</p>
              <Badge variant="outline" className="mt-1 text-[10px]">LarDeFerias</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Categorias Airbnb - Verificadas */}
            <div>
              <p className="font-medium mb-3 flex items-center gap-2">
                Categorias no Airbnb
                <Badge variant="secondary" className="text-[10px]">Verificado</Badge>
              </p>
              <div className="space-y-2">
                {AIRBNB_DATA.categoriasAirbnb.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{cat.tipo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{cat.quantidade}</Badge>
                      {cat.verificado && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                * Categorias se sobrepoem (uma casa pode ter piscina E ser para familias)
              </p>
            </div>

            {/* Perfil do mercado */}
            <div>
              <p className="font-medium mb-3">Perfil das Acomodacoes</p>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {AIRBNB_DATA.tiposPredominantes}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  O mercado de temporada em Ribeirao Pires e dominado por <strong>chacaras e sitios</strong>,
                  voltados principalmente para grupos e familias que buscam lazer em fins de semana.
                </p>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                  Preco varia de R$ 113 (casas simples) a R$ 850+ (sitios para 20 pessoas)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <p className="text-sm">
              <strong>Hotel vs Airbnb:</strong> O Airbnb em RP atende grupos/familias em chacaras (R$ 500-850/noite para 14-20 pessoas).
              Hotel compete em: hospedagem individual/casal, publico corporativo, eventos, e servicos (recepcao 24h, cafe incluso).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Concorrentes por Raio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mapeamento de Concorrentes por Raio</CardTitle>
          <CardDescription>Como definir quem e concorrente do seu hotel</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Criterios */}
          <div className="grid md:grid-cols-4 gap-3 mb-6">
            {CRITERIOS_CONCORRENCIA.map((c, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-sm">{c.criterio}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.descricao}</p>
              </div>
            ))}
          </div>

          {/* Tabela por raio */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Raio</th>
                  <th className="text-left py-3 px-4 font-medium">Cidade</th>
                  <th className="text-left py-3 px-4 font-medium">Hoteis</th>
                  <th className="text-center py-3 px-4 font-medium">Total Quartos</th>
                  <th className="text-center py-3 px-4 font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {CONCORRENTES_RAIO.map((raio, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-4">
                      <Badge variant={idx === 0 ? 'destructive' : 'secondary'}>{raio.raio}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{raio.cidade}</td>
                    <td className="py-3 px-4 text-muted-foreground">{raio.hoteis.join(', ')}</td>
                    <td className="py-3 px-4 text-center font-bold">{raio.quartos}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={idx === 0 ? 'default' : 'outline'}>
                        {idx === 0 ? 'Direto' : 'Indireto'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabela detalhada de hoteis */}
          <div className="mt-6">
            <p className="font-medium mb-3 flex items-center gap-2">
              Detalhamento por Hotel
              <Badge variant="secondary" className="text-[10px]">Verificado Dez/2025</Badge>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Hotel</th>
                    <th className="text-left py-2 px-3 font-medium">Cidade</th>
                    <th className="text-center py-2 px-3 font-medium">Quartos</th>
                    <th className="text-center py-2 px-3 font-medium">Booking</th>
                    <th className="text-center py-2 px-3 font-medium">Categoria</th>
                    <th className="text-left py-2 px-3 font-medium">Fonte</th>
                  </tr>
                </thead>
                <tbody>
                  {HOTEIS_DETALHADOS.map((hotel, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-3 font-medium">
                        {hotel.nome}
                        {hotel.novo && <Badge className="ml-2 text-[10px]" variant="default">Novo</Badge>}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{hotel.cidade}</td>
                      <td className="py-2 px-3 text-center font-bold">{hotel.quartos}</td>
                      <td className="py-2 px-3 text-center">
                        {hotel.avaliacao ? (
                          <div className="flex flex-col items-center">
                            <span className={cn(
                              "font-bold",
                              hotel.avaliacao >= 8.5 ? "text-green-600" :
                              hotel.avaliacao >= 8.0 ? "text-blue-600" :
                              "text-amber-600"
                            )}>
                              {hotel.avaliacao}
                            </span>
                            {hotel.reviews && (
                              <span className="text-[10px] text-muted-foreground">({hotel.reviews.toLocaleString()})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant="outline">{hotel.categoria}</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">
                        {hotel.verificado && <CheckCircle2 className="h-3 w-3 text-green-600 inline mr-1" />}
                        {hotel.fonte}
                      </td>
                    </tr>
                  ))}
                  {/* Hotel Proposto */}
                  <tr className="bg-primary/10 border-2 border-primary">
                    <td className="py-2 px-3 font-bold text-primary">
                      {HOTEL_PROPOSTO.nome} (Proposto)
                      <Badge className="ml-2 text-[10px]" variant="default">Proposto</Badge>
                    </td>
                    <td className="py-2 px-3 font-medium">{HOTEL_PROPOSTO.cidade}</td>
                    <td className="py-2 px-3 text-center font-bold text-primary text-lg">{HOTEL_PROPOSTO.quartos}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-muted-foreground text-xs">-</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge>{HOTEL_PROPOSTO.categoria}</Badge>
                    </td>
                    <td className="py-2 px-3 text-xs">{HOTEL_PROPOSTO.status}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan="2" className="py-2 px-3 font-bold">TOTAL REGIAO (atual)</td>
                    <td className="py-2 px-3 text-center font-bold text-lg">{QUARTOS_REGIAO_15KM}</td>
                    <td colSpan="3"></td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td colSpan="2" className="py-2 px-3 font-bold text-primary">COM HOTEL RP</td>
                    <td className="py-2 px-3 text-center font-bold text-lg text-primary">{QUARTOS_REGIAO_15KM + HOTEL_PROPOSTO.quartos}</td>
                    <td colSpan="3" className="py-2 px-3 text-xs text-muted-foreground">+{HOTEL_PROPOSTO.quartos} quartos</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-sm">
              <strong>Analise (Dados Verificados):</strong> Ribeirao Pires tem apenas <strong>{QUARTOS_RIBEIRAO_PIRES} quartos</strong> em hoteis (concorrentes diretos).
              Os <strong>851 quartos</strong> de Santo Andre (15km) atendem demanda corporativa que PODERIA ficar em RP
              se houvesse opcao adequada. Com o <strong>Hotel RP (+{HOTEL_PROPOSTO.quartos} quartos)</strong>, a cidade passaria a ter <strong>{QUARTOS_RIBEIRAO_PIRES + HOTEL_PROPOSTO.quartos} quartos</strong>,
              capturando parte da demanda que hoje vaza para o ABC.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gaps de Mercado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gaps de Mercado Identificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { gap: 'Ausencia de hotel upscale', descricao: 'Nao ha hotel categoria superior em RP', oportunidade: 'Alta' },
              { gap: 'Falta de centro de convencoes', descricao: 'Sem espaco integrado eventos + hospedagem', oportunidade: 'Alta' },
              { gap: 'Inexistencia de rooftop bar', descricao: 'Nao ha bar panoramico na regiao ABC', oportunidade: 'Alta' },
              { gap: 'Vazamento de demanda', descricao: 'Visitantes se hospedam em Maua/Santo Andre', oportunidade: 'Alta' }
            ].map((gap, idx) => (
              <div key={idx} className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400">{gap.gap}</h4>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">{gap.descricao}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">{gap.oportunidade}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posicionamento */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estrategia Competitiva do Hotel RP</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-medium mb-2">vs Hoteis Locais (RP)</p>
              <ul className="space-y-1 text-sm text-primary-foreground/80">
                <li>+ Categoria superior (upscale)</li>
                <li>+ Centro de convencoes</li>
                <li>+ Rooftop bar</li>
                <li>+ Instalacoes modernas</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">vs Santo Andre (15km)</p>
              <ul className="space-y-1 text-sm text-primary-foreground/80">
                <li>+ Localizacao em estancia turistica</li>
                <li>+ Proximidade aos eventos</li>
                <li>+ Diaria competitiva</li>
                <li>+ Experiencia diferenciada</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">vs Airbnb</p>
              <ul className="space-y-1 text-sm text-primary-foreground/80">
                <li>+ Servicos hoteleiros (24h)</li>
                <li>+ Cafe da manha incluso</li>
                <li>+ Espacos para eventos</li>
                <li>+ Publico corporativo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fontes */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Fontes dos Dados (Verificadas em Dez/2025)</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground mb-1">Hospedagem Alternativa:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.lardeferias.com.br/ribeirao-pires/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    LarDeFerias - 29 anuncios, R$113 media <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.airbnb.com/ribeirao-pires-brazil/stays" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Airbnb - Categorias e avaliacoes <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.sitioparaalugar.com/ribeirao-pires-brazil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    SitioParaAlugar - Agregador <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Hoteis e Concorrencia:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://turismoribeiraopires.com.br/onde-ficar-2/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Turismo RP - Hoteis oficiais <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.booking.com/city/br/ribeirao-pires.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Booking.com - Tarifas <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.trivago.com/en-US/odr/hotels-ribeir%C3%A3o-pires-brazil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Trivago - 48 hoteis regiao <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Motivos de Viagem:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://imprensa.spturis.com.br/releases/descubra-quem-e-o-turista-que-vem-negocios-e-eventos-ou-por-lazer-e-cultura-em-sao-paulo" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    SPTuris - Perfil Turista <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.concur.com.br/blog/article/turismo-de-negocios-conheca-suas-principais-caracteristicas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    SAP Concur - Turismo Negocios <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConcorrenciaPanel;
