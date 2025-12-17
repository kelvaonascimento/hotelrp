import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Users, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { eventosApi } from '../services/api';
import { MESES, DADOS_VIABILIDADE } from '../data/constants';

function EventosTimeline() {
  const [eventos, setEventos] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const [eventosData, calendarioData] = await Promise.all([
        eventosApi.listar(),
        eventosApi.getCalendario()
      ]);
      setEventos(eventosData.eventos || []);
      setCalendario(calendarioData || []);
    } catch (err) {
      console.log('Usando dados de exemplo');
      setEventos(DADOS_VIABILIDADE.eventos);
      const cal = MESES.map((nome, idx) => {
        const eventosDoMes = DADOS_VIABILIDADE.eventos.filter(e => e.mes === idx + 1 || e.mes === 0);
        return {
          mes: idx + 1,
          nome,
          eventos: eventosDoMes,
          total_eventos: eventosDoMes.length,
          publico_total: eventosDoMes.reduce((acc, e) => acc + (e.mes === 0 ? e.publico / 12 : e.publico), 0),
          classificacao: eventosDoMes.some(e => e.impacto === 'alto') ? 'alta' :
                        eventosDoMes.length > 1 ? 'media' : 'baixa'
        };
      });
      setCalendario(cal);
    } finally {
      setLoading(false);
    }
  };

  const dadosGrafico = calendario.map(mes => ({
    mes: mes.nome?.substring(0, 3) || MESES[mes.mes - 1]?.substring(0, 3),
    publico: Math.round(mes.publico_total / 1000),
    eventos: mes.total_eventos,
    classificacao: mes.classificacao
  }));

  const getCorBarra = (classificacao) => {
    switch (classificacao) {
      case 'alta': return 'hsl(0, 84%, 60%)';
      case 'media': return 'hsl(38, 92%, 50%)';
      default: return 'hsl(142, 76%, 36%)';
    }
  };

  const eventosDestaque = eventos.filter(e => e.impacto === 'alto' || e.impacto_hotel === 'alto');

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
          <h2 className="text-2xl font-bold tracking-tight">Calendario de Eventos</h2>
          <p className="text-muted-foreground">Eventos turisticos de Ribeirao Pires e impacto no hotel</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-muted-foreground">Alta temporada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-muted-foreground">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-muted-foreground">Baixa</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Total Eventos</span>
            </div>
            <p className="text-2xl font-bold">127</p>
            <p className="text-xs text-muted-foreground mt-1">Calendario 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Publico Total</span>
            </div>
            <p className="text-2xl font-bold">315k</p>
            <Badge variant="success" className="mt-1">Visitantes/ano</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Alto Impacto</span>
            </div>
            <p className="text-2xl font-bold">{eventosDestaque.length || 2}</p>
            <Badge variant="destructive" className="mt-1">Eventos principais</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Impacto Economico</span>
            </div>
            <p className="text-2xl font-bold">R$ 37M</p>
            <p className="text-xs text-muted-foreground mt-1">No comercio local</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publico por Mes (milhares)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value, name) => [
                    name === 'publico' ? `${value}k visitantes` : `${value} eventos`,
                    name === 'publico' ? 'Publico' : 'Eventos'
                  ]}
                />
                <Bar dataKey="publico" radius={[4, 4, 0, 0]}>
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={index} fill={getCorBarra(entry.classificacao)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Eventos Destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Eventos de Alto Impacto para o Hotel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="destructive">ALTO IMPACTO</Badge>
                  <h4 className="text-lg font-semibold mt-2">Festival do Chocolate</h4>
                  <p className="text-sm text-muted-foreground">Agosto | 20 anos em 2025</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">180k</p>
                  <p className="text-xs text-muted-foreground">visitantes</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Maior evento da cidade. 57% do publico turistico anual concentrado em 3 finais de semana.
              </p>
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm font-medium text-red-700">
                  Pacotes especiais, diarias premium, reservas antecipadas
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="destructive">ALTO IMPACTO</Badge>
                  <h4 className="text-lg font-semibold mt-2">Natal Magico</h4>
                  <p className="text-sm text-muted-foreground">Dezembro</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">50k+</p>
                  <p className="text-xs text-muted-foreground">visitantes</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Decoracao natalina especial e programacao cultural durante todo dezembro.
              </p>
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm font-medium text-red-700">
                  Ceia de Natal no restaurante, decoracao especial, pacotes familia
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Calendario Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Evento</th>
                  <th className="text-left py-3 px-2 font-medium">Periodo</th>
                  <th className="text-right py-3 px-2 font-medium">Publico Est.</th>
                  <th className="text-center py-3 px-2 font-medium">Impacto</th>
                </tr>
              </thead>
              <tbody>
                {(eventos.length > 0 ? eventos : DADOS_VIABILIDADE.eventos).map((evento, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 font-medium">{evento.nome}</td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {evento.periodo || (evento.mes === 0 ? 'Anual' : MESES[evento.mes - 1])}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {((evento.publico || evento.publico_estimado) / 1000).toFixed(0)}k
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={
                        (evento.impacto || evento.impacto_hotel) === 'alto' ? 'destructive' :
                        (evento.impacto || evento.impacto_hotel) === 'medio' ? 'warning' : 'success'
                      }>
                        {(evento.impacto || evento.impacto_hotel)?.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sazonalidade */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estrategia de Sazonalidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-primary-foreground/90">Alta Temporada</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Agosto (Festival), Dezembro (Natal)</p>
              <p className="text-sm text-primary-foreground/80 mt-2">Ocupacao projetada: 85-95%</p>
            </div>
            <div>
              <p className="font-medium text-primary-foreground/90">Media Temporada</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Marco, Maio, Junho, Setembro, Outubro</p>
              <p className="text-sm text-primary-foreground/80 mt-2">Ocupacao projetada: 55-70%</p>
            </div>
            <div>
              <p className="font-medium text-primary-foreground/90">Baixa Temporada</p>
              <p className="text-sm text-primary-foreground/70 mt-1">Janeiro, Abril, Julho, Novembro</p>
              <p className="text-sm text-primary-foreground/80 mt-2">Ocupacao projetada: 40-55%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EventosTimeline;
