import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, DollarSign, BedDouble, Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DADOS_VIABILIDADE } from '../data/constants';

function ProjecoesPanel({ data }) {
  const [cenarioSelecionado, setCenarioSelecionado] = useState('moderado');

  const projecoes = data?.projecoes || DADOS_VIABILIDADE.projecoes;
  const hotelProposto = data?.hotel_proposto || DADOS_VIABILIDADE.hotel_proposto;
  const cenarioAtual = projecoes.find(p => p.cenario === cenarioSelecionado) || projecoes[1];

  const dadosCenarios = projecoes.map(p => ({
    cenario: p.cenario.charAt(0).toUpperCase() + p.cenario.slice(1),
    ocupacao: p.ocupacao_media_anual || p.ocupacao,
    revpar: p.revpar_estimado || p.revpar,
    receita: ((p.receita_anual_estimada || p.receita) / 1000000).toFixed(2)
  }));

  const projecaoMensal = [
    { mes: 'Jan', ocupacao: 45, receita: 380 },
    { mes: 'Fev', ocupacao: 52, receita: 420 },
    { mes: 'Mar', ocupacao: 58, receita: 480 },
    { mes: 'Abr', ocupacao: 48, receita: 400 },
    { mes: 'Mai', ocupacao: 55, receita: 450 },
    { mes: 'Jun', ocupacao: 52, receita: 430 },
    { mes: 'Jul', ocupacao: 50, receita: 410 },
    { mes: 'Ago', ocupacao: 92, receita: 850 },
    { mes: 'Set', ocupacao: 62, receita: 520 },
    { mes: 'Out', ocupacao: 58, receita: 480 },
    { mes: 'Nov', ocupacao: 55, receita: 460 },
    { mes: 'Dez', ocupacao: 85, receita: 780 }
  ];

  const demandaSegmentos = [
    { segmento: 'Turismo de Eventos', diarias: 9450, percentual: 38, descricao: '2% dos 315k visitantes x 1.5 noites' },
    { segmento: 'Corporativo', diarias: 2700, percentual: 11, descricao: '600 empresas x 3 visitas x 1.5 noites' },
    { segmento: 'Eventos Sociais', diarias: 1440, percentual: 6, descricao: '15 casamentos/mes x 8 hospedes' },
    { segmento: 'Lazer Regional', diarias: 500, percentual: 2, descricao: 'Moradores e visitantes do rooftop' }
  ];

  const capacidadeHotel = {
    quartos: hotelProposto.quartos || 65,
    diariasAno: (hotelProposto.quartos || 65) * 365,
    diarias60: Math.round((hotelProposto.quartos || 65) * 365 * 0.6)
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projecoes Financeiras</h2>
          <p className="text-muted-foreground">Analise de cenarios e viabilidade economica</p>
        </div>
        <div className="flex gap-2">
          {projecoes.map(p => (
            <Button
              key={p.cenario}
              variant={cenarioSelecionado === p.cenario ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCenarioSelecionado(p.cenario)}
            >
              {p.cenario.charAt(0).toUpperCase() + p.cenario.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Cenario Selecionado */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Cenario {cenarioSelecionado.charAt(0).toUpperCase() + cenarioSelecionado.slice(1)}
            </h3>
            <Badge variant="secondary">
              {cenarioSelecionado === 'conservador' ? 'Base' :
               cenarioSelecionado === 'moderado' ? 'Recomendado' : 'Otimista'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-primary-foreground/70">Ocupacao Media</p>
              <p className="text-3xl font-bold">
                {cenarioAtual.ocupacao_media_anual || cenarioAtual.ocupacao}%
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">RevPAR</p>
              <p className="text-3xl font-bold">
                R$ {cenarioAtual.revpar_estimado || cenarioAtual.revpar}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Receita Anual</p>
              <p className="text-3xl font-bold">
                {formatCurrency(cenarioAtual.receita_anual_estimada || cenarioAtual.receita)}
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Diaria Media</p>
              <p className="text-3xl font-bold">
                R$ {hotelProposto.diaria_target}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparacao de Cenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosCenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="cenario" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ocupacao" name="Ocupacao (%)" fill="hsl(var(--primary))" />
                  <Bar yAxisId="right" dataKey="receita" name="Receita (R$ Mi)" fill="hsl(38, 92%, 50%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projecao Mensal de Ocupacao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projecaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value, name) => [
                      name === 'ocupacao' ? `${value}%` : `R$ ${value}k`,
                      name === 'ocupacao' ? 'Ocupacao' : 'Receita'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ocupacao" name="Ocupacao (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Picos em Agosto (Festival do Chocolate) e Dezembro (Natal Magico)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analise de Demanda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analise de Demanda por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-medium">Segmento</th>
                  <th className="text-right py-3 px-3 font-medium">Diarias Potenciais/Ano</th>
                  <th className="text-center py-3 px-3 font-medium">% do Total</th>
                  <th className="text-left py-3 px-3 font-medium">Base de Calculo</th>
                </tr>
              </thead>
              <tbody>
                {demandaSegmentos.map((seg, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-3 font-medium">{seg.segmento}</td>
                    <td className="py-3 px-3 text-right font-bold text-primary">
                      {seg.diarias.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={seg.percentual * 2} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{seg.percentual}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground text-xs">{seg.descricao}</td>
                  </tr>
                ))}
                <tr className="bg-muted/50 font-bold">
                  <td className="py-3 px-3">TOTAL DEMANDA</td>
                  <td className="py-3 px-3 text-right text-primary">
                    {demandaSegmentos.reduce((acc, s) => acc + s.diarias, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">-</td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Capacidade vs Demanda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              Capacidade do Hotel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Quartos</span>
              <span className="text-xl font-bold">{capacidadeHotel.quartos}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Diarias/Ano (100%)</span>
              <span className="text-xl font-bold">{capacidadeHotel.diariasAno.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-blue-600">Diarias/Ano (60%)</span>
              <span className="text-xl font-bold text-blue-700">{capacidadeHotel.diarias60.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conclusao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Viabilidade Confirmada</p>
                  <p className="text-sm text-green-600 mt-2">
                    Demanda potencial de <strong>{demandaSegmentos.reduce((acc, s) => acc + s.diarias, 0).toLocaleString()}</strong> diarias/ano
                    supera a capacidade do hotel de <strong>{capacidadeHotel.diarias60.toLocaleString()}</strong> diarias a 60% de ocupacao.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    O hotel tera demanda suficiente para operar com boa ocupacao,
                    especialmente considerando a falta de opcoes upscale na cidade.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premissas */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Premissas do Modelo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p>Diaria media target: R$ {hotelProposto.diaria_target}</p>
              <p>Quartos: {hotelProposto.quartos} unidades</p>
              <p>Receita F&B: 40% adicional sobre hospedagem</p>
            </div>
            <div>
              <p>Taxa de pernoite turistas: 2% do publico de eventos</p>
              <p>Media de permanencia: 1.5 noites</p>
              <p>Casamentos com hospedagem: 15/mes</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Projecoes baseadas no Estudo de Viabilidade e dados publicos de Ribeirao Pires.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProjecoesPanel;
