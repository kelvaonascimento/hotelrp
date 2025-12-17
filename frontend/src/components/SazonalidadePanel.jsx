import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Calendar, TrendingUp, TrendingDown, Sun, Cloud, Snowflake,
  Building2, DollarSign, Percent, Users, Info, ExternalLink,
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Dados de ocupação mensal - Estado de São Paulo (ABIH-SP/FOHB 2024)
const OCUPACAO_MENSAL = [
  { mes: 'Jan', ocupacao: 40.4, tipo: 'baixa', diaria: 380 },
  { mes: 'Fev', ocupacao: 38.2, tipo: 'baixa', diaria: 365 },
  { mes: 'Mar', ocupacao: 54.2, tipo: 'media', diaria: 402 },
  { mes: 'Abr', ocupacao: 47.9, tipo: 'media', diaria: 395 },
  { mes: 'Mai', ocupacao: 53.4, tipo: 'media', diaria: 410 },
  { mes: 'Jun', ocupacao: 56.5, tipo: 'alta', diaria: 420 },
  { mes: 'Jul', ocupacao: 54.6, tipo: 'alta', diaria: 435 },
  { mes: 'Ago', ocupacao: 56.3, tipo: 'alta', diaria: 425 },
  { mes: 'Set', ocupacao: 52.1, tipo: 'media', diaria: 415 },
  { mes: 'Out', ocupacao: 57.4, tipo: 'alta', diaria: 430 },
  { mes: 'Nov', ocupacao: 56.2, tipo: 'alta', diaria: 440 },
  { mes: 'Dez', ocupacao: 47.4, tipo: 'media', diaria: 400 },
];

// Dados de ocupação por dia da semana - PADRAO TIPICO do setor hoteleiro corporativo
// Fonte: FOHB - perfil típico de hotéis corporativos em capitais/ABC
// Nota: Não representa dados específicos de hotéis individuais
const OCUPACAO_SEMANAL = [
  { dia: 'Dom', ocupacao: 35, tipo: 'lazer' },
  { dia: 'Seg', ocupacao: 55, tipo: 'corporativo' },
  { dia: 'Ter', ocupacao: 65, tipo: 'corporativo' },
  { dia: 'Qua', ocupacao: 68, tipo: 'corporativo' },
  { dia: 'Qui', ocupacao: 62, tipo: 'corporativo' },
  { dia: 'Sex', ocupacao: 48, tipo: 'misto' },
  { dia: 'Sab', ocupacao: 42, tipo: 'lazer' },
];

// Benchmark de hotéis da região com tarifas (fonte: Booking, Kayak - Dez/2025)
// Nota: Tarifas são dados reais de OTAs. Ocupação específica por hotel não é pública.
const HOTEIS_REGIAO = [
  {
    nome: 'Hotel Pilar',
    cidade: 'Ribeirao Pires',
    categoria: '3 estrelas',
    quartos: 75,
    avaliacao: 7.5,
    fonte: 'TripAdvisor',
    tarifas: {
      semana: 280,
      fimDeSemana: 350,
      altaTemporada: 400,
      baixaTemporada: 250,
    },
    perfil: 'Lazer/Eventos',
  },
  {
    nome: 'Hotel WR',
    cidade: 'Ribeirao Pires',
    categoria: 'Economico',
    quartos: 10,
    avaliacao: null,
    fonte: 'Prefeitura RP',
    tarifas: {
      semana: 200,
      fimDeSemana: 260,
      altaTemporada: 280,
      baixaTemporada: 180,
    },
    perfil: 'Corporativo',
  },
  {
    nome: 'Hotel Infinity',
    cidade: 'Maua',
    categoria: '3 estrelas',
    quartos: 50,
    avaliacao: 8.2,
    fonte: 'Kayak',
    tarifas: {
      semana: 234,
      fimDeSemana: 280,
      altaTemporada: 310,
      baixaTemporada: 200,
    },
    perfil: 'Corporativo',
  },
  {
    nome: 'Villa Brites',
    cidade: 'Maua',
    categoria: '3 estrelas',
    quartos: 30,
    avaliacao: 8.9,
    fonte: 'Kayak',
    tarifas: {
      semana: 261,
      fimDeSemana: 310,
      altaTemporada: 350,
      baixaTemporada: 220,
    },
    perfil: 'Misto',
  },
  {
    nome: 'Hospedaria Eden',
    cidade: 'Maua',
    categoria: 'Economico',
    quartos: 20,
    avaliacao: 7.0,
    fonte: 'Kayak',
    tarifas: {
      semana: 136,
      fimDeSemana: 170,
      altaTemporada: 190,
      baixaTemporada: 110,
    },
    perfil: 'Economico',
  },
  {
    nome: 'Ibis Santo Andre',
    cidade: 'Santo Andre',
    categoria: '3 estrelas',
    quartos: 126,
    avaliacao: 8.3,
    fonte: 'Kayak',
    tarifas: {
      semana: 276,
      fimDeSemana: 310,
      altaTemporada: 350,
      baixaTemporada: 240,
    },
    perfil: 'Corporativo',
  },
  {
    nome: 'Plaza Mayor',
    cidade: 'Santo Andre',
    categoria: '4 estrelas',
    quartos: 80,
    avaliacao: 9.0,
    fonte: 'Kayak',
    tarifas: {
      semana: 359,
      fimDeSemana: 420,
      altaTemporada: 480,
      baixaTemporada: 300,
    },
    perfil: 'Executivo',
  },
];

// Eventos de Ribeirão Pires e impacto na ocupação
// Nota: Impactos são ESTIMATIVAS baseadas em padrões do setor hoteleiro em destinos turísticos
// Fonte referência: FHORESP (Carnaval 85% litoral, 65% interior)
const EVENTOS_SAZONALIDADE = [
  { evento: 'Carnaval', mes: 'Fev/Mar', impactoOcupacao: '+40%', diariaPremium: '+30%' },
  { evento: 'Pascoa', mes: 'Abr', impactoOcupacao: '+25%', diariaPremium: '+20%' },
  { evento: 'Festa Junina', mes: 'Jun', impactoOcupacao: '+15%', diariaPremium: '+10%' },
  { evento: 'Festival do Chocolate', mes: 'Ago', impactoOcupacao: '+60%', diariaPremium: '+50%' },
  { evento: 'Festa Italiana', mes: 'Set', impactoOcupacao: '+20%', diariaPremium: '+15%' },
  { evento: 'Natal Magico', mes: 'Dez', impactoOcupacao: '+45%', diariaPremium: '+35%' },
];

// Projeção para o Hotel RP
const PROJECAO_HOTEL_RP = {
  tarifas: {
    semana: { min: 250, max: 300 },
    fimDeSemana: { min: 320, max: 380 },
    altaTemporada: { min: 380, max: 450 },
    baixaTemporada: { min: 220, max: 280 },
  },
  ocupacaoProjetada: {
    ano1: { conservador: 45, moderado: 55, otimista: 65 },
    ano2: { conservador: 55, moderado: 65, otimista: 75 },
    ano3: { conservador: 60, moderado: 70, otimista: 80 },
  },
};

function SazonalidadePanel() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('anual');

  // Calcula médias
  const mediaOcupacaoAnual = (OCUPACAO_MENSAL.reduce((acc, m) => acc + m.ocupacao, 0) / 12).toFixed(1);
  const mediaDiariaAnual = Math.round(OCUPACAO_MENSAL.reduce((acc, m) => acc + m.diaria, 0) / 12);
  const revparMedio = Math.round(mediaDiariaAnual * (mediaOcupacaoAnual / 100));

  // Identifica alta e baixa temporada
  const mesesAlta = OCUPACAO_MENSAL.filter(m => m.tipo === 'alta').map(m => m.mes).join(', ');
  const mesesBaixa = OCUPACAO_MENSAL.filter(m => m.tipo === 'baixa').map(m => m.mes).join(', ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sazonalidade e Ocupacao</h2>
          <p className="text-muted-foreground">
            Analise de ocupacao hoteleira e tarifas na regiao do Grande ABC
          </p>
        </div>
        <Badge variant="outline" className="gap-1 w-fit">
          <Info className="h-3 w-3" />
          Dados: ABIH-SP, FOHB, Booking, Kayak
        </Badge>
      </div>

      {/* KPIs de Ocupação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Percent className="h-4 w-4" />
              <span className="text-sm">Ocupacao Media SP</span>
            </div>
            <p className="text-3xl font-bold">{mediaOcupacaoAnual}%</p>
            <p className="text-xs text-muted-foreground mt-1">Estado de Sao Paulo 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Diaria Media</span>
            </div>
            <p className="text-3xl font-bold">R$ {mediaDiariaAnual}</p>
            <p className="text-xs text-muted-foreground mt-1">Hotelaria paulista</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">RevPAR Medio</span>
            </div>
            <p className="text-3xl font-bold">R$ {revparMedio}</p>
            <p className="text-xs text-muted-foreground mt-1">Receita por quarto disponivel</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Hoteis Mapeados</span>
            </div>
            <p className="text-3xl font-bold">{HOTEIS_REGIAO.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Regiao do ABC</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Ocupação Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taxa de Ocupacao Mensal - Estado de Sao Paulo</CardTitle>
          <CardDescription>Sazonalidade ao longo do ano (dados ABIH-SP 2024)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={OCUPACAO_MENSAL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[30, 70]} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[350, 450]} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'ocupacao' ? `${value}%` : `R$ ${value}`,
                    name === 'ocupacao' ? 'Ocupacao' : 'Diaria Media'
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="ocupacao"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Ocupacao %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="diaria"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316' }}
                  name="Diaria Media R$"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legendas de temporada */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-500" />
              <span className="text-sm"><strong>Alta:</strong> {mesesAlta}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>Media:</strong> Mar, Abr, Mai, Set, Dez</span>
            </div>
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <span className="text-sm"><strong>Baixa:</strong> {mesesBaixa}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ocupação por Dia da Semana */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ocupacao por Dia da Semana</CardTitle>
            <CardDescription>Perfil corporativo vs lazer (tipico regiao ABC)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OCUPACAO_SEMANAL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 80]} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'Ocupacao']}
                  />
                  <Bar
                    dataKey="ocupacao"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Insight:</strong> Hoteis corporativos tem pico Ter-Qui (65-68%).
                Ribeirao Pires, com perfil turistico, pode inverter: maior ocupacao em fins de semana
                durante eventos e festivais.
              </p>
              <p className="text-xs text-muted-foreground/70 italic">
                * Dados representam padrao tipico do setor hoteleiro corporativo (FOHB).
                Nao sao dados especificos de hoteis individuais.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impacto de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impacto Estimado de Eventos na Ocupacao</CardTitle>
            <CardDescription>Principais eventos de Ribeirao Pires (estimativas baseadas em padroes do setor)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {EVENTOS_SAZONALIDADE.map((evento, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{evento.evento}</p>
                    <p className="text-xs text-muted-foreground">{evento.mes}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{evento.impactoOcupacao}</p>
                      <p className="text-xs text-muted-foreground">Ocupacao</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">{evento.diariaPremium}</p>
                      <p className="text-xs text-muted-foreground">Tarifa</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark de Tarifas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benchmark de Tarifas - Regiao ABC</CardTitle>
          <CardDescription>Comparativo de diarias por periodo e hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-3 font-medium">Hotel</th>
                  <th className="text-left py-3 px-3 font-medium">Cidade</th>
                  <th className="text-center py-3 px-3 font-medium">Avaliacao</th>
                  <th className="text-right py-3 px-3 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      Semana
                    </div>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3" />
                      Fim de Semana
                    </div>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Sun className="h-3 w-3" />
                      Alta Temp.
                    </div>
                  </th>
                  <th className="text-right py-3 px-3 font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Snowflake className="h-3 w-3" />
                      Baixa Temp.
                    </div>
                  </th>
                  <th className="text-center py-3 px-3 font-medium">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {HOTEIS_REGIAO.map((hotel, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium">{hotel.nome}</p>
                        <p className="text-xs text-muted-foreground">{hotel.categoria}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{hotel.cidade}</td>
                    <td className="py-3 px-3 text-center">
                      {hotel.avaliacao ? (
                        <Badge variant={hotel.avaliacao >= 8.5 ? 'default' : 'secondary'}>
                          {hotel.avaliacao}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Novo</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">R$ {hotel.tarifas.semana}</td>
                    <td className="py-3 px-3 text-right font-medium">R$ {hotel.tarifas.fimDeSemana}</td>
                    <td className="py-3 px-3 text-right text-orange-600">R$ {hotel.tarifas.altaTemporada}</td>
                    <td className="py-3 px-3 text-right text-blue-600">R$ {hotel.tarifas.baixaTemporada}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-muted-foreground">{hotel.fonte}</span>
                    </td>
                  </tr>
                ))}
                {/* Linha do Hotel RP (proposto) */}
                <tr className="bg-primary/5 border-2 border-primary/20">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-bold text-primary">Hotel RP (proposto)</p>
                      <p className="text-xs text-muted-foreground">Upscale</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">Ribeirao Pires</td>
                  <td className="py-3 px-3 text-center">
                    <Badge>Novo</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    R$ {PROJECAO_HOTEL_RP.tarifas.semana.min}-{PROJECAO_HOTEL_RP.tarifas.semana.max}
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    R$ {PROJECAO_HOTEL_RP.tarifas.fimDeSemana.min}-{PROJECAO_HOTEL_RP.tarifas.fimDeSemana.max}
                  </td>
                  <td className="py-3 px-3 text-right text-orange-600 font-bold">
                    R$ {PROJECAO_HOTEL_RP.tarifas.altaTemporada.min}-{PROJECAO_HOTEL_RP.tarifas.altaTemporada.max}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-600">
                    R$ {PROJECAO_HOTEL_RP.tarifas.baixaTemporada.min}-{PROJECAO_HOTEL_RP.tarifas.baixaTemporada.max}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-xs text-muted-foreground">Projecao</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Análise de variação */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Variacao Fim de Semana</p>
              <p className="text-2xl font-bold text-orange-600">+15% a +25%</p>
              <p className="text-xs text-muted-foreground mt-1">Em relacao a dias de semana</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Premium Alta Temporada</p>
              <p className="text-2xl font-bold text-red-600">+30% a +50%</p>
              <p className="text-xs text-muted-foreground mt-1">Durante eventos principais</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Desconto Baixa Temporada</p>
              <p className="text-2xl font-bold text-blue-600">-15% a -20%</p>
              <p className="text-xs text-muted-foreground mt-1">Janeiro e Fevereiro</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projeção de Ocupação Hotel RP */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Projecao de Ocupacao - Hotel RP</h3>

          <div className="grid md:grid-cols-3 gap-6">
            {['ano1', 'ano2', 'ano3'].map((ano, idx) => (
              <div key={ano} className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-primary-foreground/70 mb-2">Ano {idx + 1}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Conservador</span>
                    <span className="font-bold">{PROJECAO_HOTEL_RP.ocupacaoProjetada[ano].conservador}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Moderado</span>
                    <span className="font-bold">{PROJECAO_HOTEL_RP.ocupacaoProjetada[ano].moderado}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Otimista</span>
                    <span className="font-bold">{PROJECAO_HOTEL_RP.ocupacaoProjetada[ano].otimista}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-primary-foreground/20">
            <p className="text-sm text-primary-foreground/90">
              <strong>Estrategia:</strong> Mix equilibrado entre corporativo (Seg-Qui) e eventos/turismo (Sex-Dom).
              Durante Festival do Chocolate e Natal Magico, projetar ocupacao de 85-95% com tarifa premium.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fontes */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Fontes dos Dados</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground mb-1">Ocupacao e Sazonalidade:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.panrotas.com.br/mercado/pesquisas-e-estatisticas/2025/04/sao-paulo-cresce-em-taxa-de-ocupacao-e-diaria-media-hoteleira-em-marco_216750.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    PANROTAS - Ocupacao SP <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://fohb.com.br/estudos_e_pesquisas/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    FOHB - Estudos e Pesquisas <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://sindhoteissp.com.br/dados-tecnicos/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    SindHoteis SP - Dados Tecnicos <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Tarifas e Hoteis:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.kayak.com.br/Maua-Hoteis.81781.hotel.ksp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    KAYAK - Hoteis Maua <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.booking.com/city/br/ribeirao-pires.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Booking - Ribeirao Pires <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://hotelinvest.com.br/panorama-da-hotelaria-brasileira-previa-do-3o-trimestre-de-2024/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    HotelInvest - Panorama 2024 <ExternalLink className="h-3 w-3" />
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

export default SazonalidadePanel;
