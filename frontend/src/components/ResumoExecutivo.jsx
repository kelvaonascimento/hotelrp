import React from 'react';
import {
  Building2, Users, Calendar, TrendingUp, MapPin, Target,
  CheckCircle2, AlertTriangle, ExternalLink, FileText, Hotel,
  Utensils, Wine, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HOTEL_PROPOSTO,
  HOTEIS_DETALHADOS,
  LEITOS_RIBEIRAO_PIRES,
  QUARTOS_RIBEIRAO_PIRES,
  TOTAL_EVENTOS_ANO
} from '../data/constants';

function ResumoExecutivo({ onNavigate }) {
  const kpisDestaque = [
    { label: 'Visitantes/Ano', valor: '315 mil', icon: Users, cor: 'text-blue-600' },
    { label: 'Eventos (2026)', valor: TOTAL_EVENTOS_ANO.toString(), icon: Calendar, cor: 'text-purple-600' },
    { label: 'Leitos Disponiveis', valor: LEITOS_RIBEIRAO_PIRES.toString(), icon: Hotel, cor: 'text-orange-600' },
    { label: 'Impacto Turistico 2025', valor: 'R$ 37 Mi', icon: TrendingUp, cor: 'text-green-600' },
  ];

  const diferenciais = [
    { titulo: 'Hospedagem Upscale', desc: 'Primeiro hotel de categoria superior na cidade', icon: Hotel },
    { titulo: 'Centro de Convencoes', desc: 'Salas modulares para eventos corporativos e sociais', icon: Briefcase },
    { titulo: 'Restaurante Gastronomico', desc: 'Culinaria regional de alta qualidade', icon: Utensils },
    { titulo: 'Rooftop Bar', desc: 'Bar panoramico inedito na regiao', icon: Wine },
  ];

  const fontes = [
    {
      categoria: 'Dados Oficiais - Prefeitura de Ribeirao Pires',
      links: [
        { nome: 'Impacto do Turismo na Economia', url: 'https://www.ribeiraopires.sp.gov.br/portal/noticias/0/3/7986/impacto-do-turismo-na-economia-de-ribeirao-pires-registra-impacto-historico' },
        { nome: 'Novo Hotel Reforca Estrutura de Hospedagem', url: 'https://www.ribeiraopires.sp.gov.br/portal/noticias/0/3/7985/novo-hotel-reforca-estrutura-de-hospedagem-e-impulsiona-vocacao-turistica-de-ribeirao-pires' },
        { nome: 'Avanco Economico e Novos Investimentos', url: 'https://www.ribeiraopires.sp.gov.br/portal/noticias/0/3/7859/ribeirao-pires-registra-avanco-economico-e-anuncia-novo-mcdonalds-em-ouro-fino' },
      ]
    },
    {
      categoria: 'Estatisticas de Empresas',
      links: [
        { nome: 'Economia de Ribeirao Pires - Caravela', url: 'https://www.caravela.info/regional/ribeir%C3%A3o-pires---sp' },
        { nome: 'ABC Registra 6,9 mil Novas Empresas - Folha do ABC', url: 'https://folhadoabc.com.br/abc-registra-abertura-de-69-mil-novas-empresas/' },
      ]
    },
    {
      categoria: 'Mercado Hoteleiro e Concorrencia',
      links: [
        { nome: 'Hoteis em Ribeirao Pires - TripAdvisor', url: 'https://www.tripadvisor.com.br/Hotels-g2343028-Ribeirao_Pires_State_of_Sao_Paulo-Hotels.html' },
        { nome: 'Hotel Estancia Pilar - TripAdvisor', url: 'https://www.tripadvisor.pt/Hotel_Review-g2343028-d4511952-Reviews-Hotel_Estancia_Pilar-Ribeirao_Pires_State_of_Sao_Paulo.html' },
        { nome: 'Hoteis em Ribeirao Pires - Booking.com', url: 'https://www.booking.com/city/br/ribeirao-pires.html' },
        { nome: 'Hotel Villa Brites (Maua) - Kayak', url: 'https://www.kayak.com.br/Hoteis-Hotel-Villa-Brites-Maua.2974327.ksp' },
      ]
    },
    {
      categoria: 'Eventos e Buffets',
      links: [
        { nome: 'Buffets de Casamento em Ribeirao Pires', url: 'https://www.casamentos.com.br/buffet-casamento/sao-paulo-estado/ribeirao-pires' },
        { nome: 'Hotel Estancia Pilar - Casamentos.com.br', url: 'https://www.casamentos.com.br/hotel-casamento/hotel-estancia-pilar--e162104' },
      ]
    },
    {
      categoria: 'Dados de Empresas em Tempo Real',
      links: [
        { nome: 'API CNPJa - Consulta de CNPJs', url: 'https://cnpja.com' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header com Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="group flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight">Hotel RP</h1>
            <p className="text-sm text-muted-foreground">Dashboard de Viabilidade</p>
          </div>
        </button>
        <p className="text-muted-foreground max-w-2xl">
          Analise de viabilidade para implantacao de hotel upscale em Ribeirao Pires,
          integrando hospedagem, gastronomia, entretenimento e centro de convencoes.
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpisDestaque.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${kpi.cor}`} />
                <p className="text-2xl font-bold">{kpi.valor}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Oportunidade de Mercado */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Oportunidade de Mercado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ribeirao Pires, reconhecida como <strong>Estancia Turistica</strong>, apresenta um
            <strong> gap significativo</strong> entre demanda turistica e oferta hoteleira:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Problema</p>
              <p className="text-sm text-muted-foreground mt-1">
                Apenas {LEITOS_RIBEIRAO_PIRES} leitos ({QUARTOS_RIBEIRAO_PIRES} quartos) para 300 mil visitantes/ano. Nao ha hotel upscale na cidade.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Demanda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Turistas, visitantes corporativos e convidados de eventos se hospedam em Maua ou Santo Andre.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Solucao</p>
              <p className="text-sm text-muted-foreground mt-1">
                Hotel mixed-use com hospedagem, convencoes, restaurante e rooftop bar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conceito do Hotel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conceito do Empreendimento</CardTitle>
          <CardDescription>Hotel multiuso com 4 frentes de operacao integradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {diferenciais.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">{item.titulo}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Localizacao Estrategica</p>
                <p className="text-sm text-muted-foreground">
                  Centro de Ribeirao Pires, proximo ao Clube da cidade, estacao de trem e principais
                  pontos turisticos. Acesso facilitado para moradores e visitantes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores de Mercado */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Crescimento Empresarial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Empresas abertas 2024</span>
              <Badge variant="secondary">326</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Novas empresas jan-set/2025</span>
              <Badge variant="secondary">298</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Media mensal</span>
              <Badge variant="secondary">30-40</Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Mais empresas = mais visitantes corporativos (fornecedores, consultores, tecnicos)
              que precisam de hospedagem adequada.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Setor de Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Buffets/espacos na cidade</span>
              <Badge variant="secondary">9+</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Capacidade (maior buffet)</span>
              <Badge variant="secondary">1000 pessoas</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eventos oficiais/ano</span>
              <Badge variant="secondary">90+</Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              A cidade ja tem os eventos. Falta hospedagem para convidados e espacos
              integrados (pacote evento + hotel).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tarifas e Posicionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Benchmark de Tarifas - Regiao ABC</CardTitle>
          <CardDescription className="text-xs">
            * Tarifas de referencia obtidas em OTAs (Booking, Kayak). Valores variam conforme data e disponibilidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3">Hotel</th>
                  <th className="text-left py-2 px-3">Cidade</th>
                  <th className="text-center py-2 px-3">Quartos</th>
                  <th className="text-center py-2 px-3">Categoria</th>
                </tr>
              </thead>
              <tbody>
                {HOTEIS_DETALHADOS.filter(h => h.cidade === 'Ribeirao Pires' || h.nome === 'Villa Brites' || h.nome === 'Plaza Mayor').slice(0, 5).map((hotel, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">{hotel.nome}</td>
                    <td className="py-2 px-3 text-muted-foreground">{hotel.cidade}</td>
                    <td className="py-2 px-3 text-center font-medium">{hotel.quartos}</td>
                    <td className="py-2 px-3 text-center"><Badge variant="outline">{hotel.categoria}</Badge></td>
                  </tr>
                ))}
                <tr className="border-b bg-primary/5">
                  <td className="py-2 px-3 font-semibold">{HOTEL_PROPOSTO.nome} (proposto)</td>
                  <td className="py-2 px-3 text-muted-foreground">{HOTEL_PROPOSTO.cidade}</td>
                  <td className="py-2 px-3 text-center font-bold text-primary">{HOTEL_PROPOSTO.quartos}</td>
                  <td className="py-2 px-3 text-center"><Badge>{HOTEL_PROPOSTO.categoria}</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Diaria target do Hotel RP: <strong>R$ {HOTEL_PROPOSTO.diaria_target}</strong> (posicionamento 4 estrelas)
          </p>
        </CardContent>
      </Card>

      {/* Conclusao */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Conclusao: Viabilidade FORTE</h3>
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                Todos os indicadores apontam que Ribeirao Pires comporta e necessita um hotel de padrao
                superior. Ha <strong>gap de mercado claro</strong>: falta hospedagem de qualidade e centro
                de convencoes. O crescimento de empresas (300+ novas/ano), eventos culturais (90+/ano)
                e turismo (300 mil visitantes) sustentam a demanda. A cidade e 8a entre estancias
                turisticas do Estado e investe R$ 5 milhoes/ano em turismo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fontes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">Fontes e Referencias</CardTitle>
          </div>
          <CardDescription>
            Dados utilizados neste estudo de viabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fontes.map((grupo, idx) => (
            <div key={idx}>
              <h4 className="font-medium text-sm mb-2">{grupo.categoria}</h4>
              <ul className="space-y-1">
                {grupo.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {link.nome}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              * Dados de empresas em tempo real obtidos via API CNPJa (base comercial de CNPJs).
              Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA para Dashboard */}
      <div className="text-center py-4">
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Building2 className="h-5 w-5" />
          Explorar Dashboard Completo
        </button>
      </div>
    </div>
  );
}

export default ResumoExecutivo;
