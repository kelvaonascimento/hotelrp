import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Hotel, BedDouble, DollarSign, Star, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { concorrenciaApi } from '../services/api';
import { DADOS_VIABILIDADE } from '../data/constants';

function ConcorrenciaPanel() {
  const [hoteis, setHoteis] = useState([]);
  const [gapMercado, setGapMercado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hoteisData, gapData] = await Promise.all([
        concorrenciaApi.listarHoteis(),
        concorrenciaApi.getGapMercado()
      ]);
      setHoteis(hoteisData.hoteis || []);
      setGapMercado(gapData);
    } catch (err) {
      setHoteis(DADOS_VIABILIDADE.hoteis);
      setGapMercado({
        gaps_identificados: [
          { gap: 'Ausencia de hotel upscale', oportunidade: 'Alta' },
          { gap: 'Falta de centro de convencoes', oportunidade: 'Alta' },
          { gap: 'Inexistencia de rooftop bar', oportunidade: 'Alta' },
          { gap: 'Baixa oferta de leitos', oportunidade: 'Alta' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const hotelProposto = DADOS_VIABILIDADE.hotel_proposto;

  const dadosDiarias = [
    ...hoteis.map(h => ({
      nome: h.nome,
      diaria: h.diaria || h.diaria_media,
      cidade: h.cidade,
      quartos: h.quartos,
      nota: h.nota || h.nota_avaliacao
    })),
    {
      nome: 'Hotel Proposto',
      diaria: hotelProposto.diaria_target,
      cidade: 'Ribeirao Pires',
      quartos: hotelProposto.quartos,
      nota: null,
      proposto: true
    }
  ].sort((a, b) => a.diaria - b.diaria);

  const getCidadeCor = (cidade) => {
    if (cidade?.includes('Ribeirao')) return 'hsl(142, 76%, 36%)';
    if (cidade?.includes('Maua')) return 'hsl(221, 83%, 53%)';
    return 'hsl(262, 83%, 58%)';
  };

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
          <p className="text-muted-foreground">Mercado hoteleiro regional e posicionamento</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Hotel className="h-4 w-4" />
              <span className="text-sm font-medium">Hoteis na Regiao</span>
            </div>
            <p className="text-2xl font-bold">{hoteis.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Mapeados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BedDouble className="h-4 w-4" />
              <span className="text-sm font-medium">Leitos RP</span>
            </div>
            <p className="text-2xl font-bold">200</p>
            <Badge variant="destructive" className="mt-1">Insuficiente</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Media Diaria ABC</span>
            </div>
            <p className="text-2xl font-bold">R$ 280</p>
            <p className="text-xs text-muted-foreground mt-1">Hoteis medios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Hoteis Upscale RP</span>
            </div>
            <p className="text-2xl font-bold">0</p>
            <Badge variant="success" className="mt-1">Oportunidade!</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo de Diarias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparativo de Diarias (R$)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosDiarias} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 450]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="nome" type="category" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => [`R$ ${value}`, 'Diaria']}
                />
                <Bar dataKey="diaria" radius={[0, 4, 4, 0]}>
                  {dadosDiarias.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.proposto ? 'hsl(38, 92%, 50%)' : getCidadeCor(entry.cidade)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-muted-foreground">Ribeirao Pires</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-muted-foreground">Maua</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-muted-foreground">Santo Andre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-muted-foreground">Hotel Proposto</span>
            </div>
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
              { gap: 'Baixa oferta de leitos', descricao: '200 leitos para 315k visitantes/ano', oportunidade: 'Alta' }
            ].map((gap, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">{gap.gap}</h4>
                      <p className="text-sm text-green-600 mt-1">{gap.descricao}</p>
                    </div>
                  </div>
                  <Badge variant="success">{gap.oportunidade}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Hoteis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hoteis da Regiao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-medium">Hotel</th>
                  <th className="text-left py-3 px-3 font-medium">Cidade</th>
                  <th className="text-center py-3 px-3 font-medium">Quartos</th>
                  <th className="text-right py-3 px-3 font-medium">Diaria</th>
                  <th className="text-center py-3 px-3 font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {hoteis.map((hotel, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-3 font-medium">{hotel.nome}</td>
                    <td className="py-3 px-3">
                      <Badge variant={
                        hotel.cidade?.includes('Ribeirao') ? 'success' :
                        hotel.cidade?.includes('Maua') ? 'info' : 'secondary'
                      }>
                        {hotel.cidade}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">{hotel.quartos}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      R$ {hotel.diaria || hotel.diaria_media}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {hotel.nota || hotel.nota_avaliacao ? (
                        <Badge variant={
                          (hotel.nota || hotel.nota_avaliacao) >= 8 ? 'success' :
                          (hotel.nota || hotel.nota_avaliacao) >= 7 ? 'warning' : 'destructive'
                        }>
                          {hotel.nota || hotel.nota_avaliacao}
                        </Badge>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-yellow-50">
                  <td className="py-3 px-3 font-bold text-primary">Hotel Proposto</td>
                  <td className="py-3 px-3">
                    <Badge>Ribeirao Pires</Badge>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">{hotelProposto.quartos}</td>
                  <td className="py-3 px-3 text-right font-bold text-primary">
                    R$ {hotelProposto.diaria_target}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge>Novo</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Posicionamento */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Posicionamento do Hotel Proposto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium mb-2">Diferenciais Competitivos</p>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                {hotelProposto.diferenciais.map((dif, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {dif}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Estrategia de Preco</p>
              <p className="text-sm text-primary-foreground/80">
                Diaria target de <strong>R$ {hotelProposto.diaria_target}</strong> posiciona o hotel:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-primary-foreground/70">
                <li>Acima dos hoteis simples de RP (R$ 230)</li>
                <li>Competitivo com Maua (R$ 240-250)</li>
                <li>Abaixo de Santo Andre superior (R$ 350-390)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConcorrenciaPanel;
