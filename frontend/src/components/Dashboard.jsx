import React from 'react';
import {
  Users, Calendar, BedDouble, TrendingUp, Building, MapPin,
  Star, Target, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DADOS_VIABILIDADE, HOTEL_PROPOSTO, LEITOS_RIBEIRAO_PIRES, QUARTOS_RIBEIRAO_PIRES } from '../data/constants';

function KPICard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend > 0 ? "text-green-600" : "text-red-600"
              )}>
                <ArrowUpRight className={cn("h-3 w-3", trend < 0 && "rotate-90")} />
                {Math.abs(trend)}% vs ano anterior
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ score }) {
  const getScoreInfo = (s) => {
    if (s >= 80) return { color: 'text-green-600', bg: 'bg-green-500', label: 'Excelente', description: 'Projeto altamente viavel' };
    if (s >= 60) return { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Bom', description: 'Projeto viavel com boas perspectivas' };
    if (s >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Moderado', description: 'Requer analise mais aprofundada' };
    return { color: 'text-red-600', bg: 'bg-red-500', label: 'Baixo', description: 'Reavaliacao necessaria' };
  };

  const info = getScoreInfo(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Score de Viabilidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          <div className="relative flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 352} 352`}
                className={info.color.replace('text-', 'text-')}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={cn("text-3xl font-bold", info.color)}>{score}</span>
              <span className="text-xs text-muted-foreground">de 100</span>
            </div>
          </div>

          <Badge className={cn("mt-4", info.bg, "text-white border-0")}>
            {info.label}
          </Badge>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            {info.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function HighlightsCard({ title, icon: Icon, items, variant = 'success' }) {
  const iconClass = variant === 'success' ? 'text-green-500' : 'text-yellow-500';
  const ItemIcon = variant === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ItemIcon className={cn("h-4 w-4 mt-0.5 shrink-0", iconClass)} />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function GapCard({ visitors, beds }) {
  const ratio = Math.round(visitors / beds);

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Gap de Mercado Identificado</h3>
            <p className="text-primary-foreground/80 mt-1 text-sm">
              {(visitors / 1000).toFixed(0)}k visitantes anuais para apenas {beds} leitos
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-4xl font-bold">{ratio}x</p>
            <p className="text-sm text-primary-foreground/80">Demanda vs Oferta</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/90">
            <strong>Conclusao:</strong> Viabilidade de mercado FORTE. O novo hotel com {HOTEL_PROPOSTO.quartos} quartos
            aumentaria a oferta local em {Math.round((HOTEL_PROPOSTO.quartos / QUARTOS_RIBEIRAO_PIRES) * 100)}%, atendendo demanda reprimida.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ value, label }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function Dashboard({ data }) {
  const kpis = data?.kpis || DADOS_VIABILIDADE.kpis;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  const pontosFortes = [
    `${formatNumber(kpis.publico_total_eventos)} visitantes/ano com apenas ${kpis.leitos_disponiveis_cidade} leitos`,
    `${kpis.total_eventos_ano} eventos no calendario municipal`,
    "Ausencia de hotel upscale e centro de convencoes",
    `Crescimento economico de ${kpis.crescimento_geral}% ao ano`,
    "8a estancia turistica do Estado de SP"
  ];

  const diferenciais = [
    "Rooftop bar panoramico - inedito na regiao ABC",
    "Restaurante gastronomico com culinaria regional",
    "Centro de convencoes integrado a hospedagem",
    "Localizacao central proxima a estacao de trem"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visao Geral</h2>
          <p className="text-muted-foreground">
            Indicadores de viabilidade do projeto hoteleiro
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            Ribeirao Pires
          </Badge>
          <Badge className="gap-1">
            <Building className="h-3 w-3" />
            Hotel Upscale
          </Badge>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Visitantes/Ano"
          value={formatNumber(kpis.publico_total_eventos)}
          subtitle="Eventos turisticos"
          icon={Users}
        />
        <KPICard
          title="Eventos/Ano"
          value={kpis.total_eventos_ano}
          subtitle="Calendario oficial"
          icon={Calendar}
        />
        <KPICard
          title="Leitos Atuais"
          value={kpis.leitos_disponiveis_cidade}
          subtitle="Ribeirao Pires"
          icon={BedDouble}
        />
        <KPICard
          title="Crescimento"
          value={`${kpis.crescimento_geral}%`}
          subtitle="Empresas/ano"
          icon={TrendingUp}
          trend={kpis.crescimento_geral}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreCard score={kpis.score_viabilidade} />
        <HighlightsCard
          title="Pontos Fortes do Mercado"
          icon={Star}
          items={pontosFortes}
          variant="success"
        />
        <HighlightsCard
          title="Diferenciais do Projeto"
          icon={Building}
          items={diferenciais}
          variant="success"
        />
      </div>

      {/* Gap de Mercado */}
      <GapCard
        visitors={kpis.publico_total_eventos}
        beds={kpis.leitos_disponiveis_cidade}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={`R$ ${HOTEL_PROPOSTO.diaria_target}`} label="Diaria Target" />
        <StatCard value={HOTEL_PROPOSTO.quartos} label="Quartos Projetados" />
        <StatCard value="60%" label="Ocupacao Moderada" />
        <StatCard value="R$ 37M" label="Impacto Turismo 2025" />
      </div>
    </div>
  );
}

export default Dashboard;
