import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, Calendar, Hotel, TrendingUp,
  Menu, X, RefreshCw, Wifi, WifiOff, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Dashboard from './components/Dashboard';
import EmpresasChart from './components/EmpresasChart';
import EventosTimeline from './components/EventosTimeline';
import ConcorrenciaPanel from './components/ConcorrenciaPanel';
import ProjecoesPanel from './components/ProjecoesPanel';
import ResumoExecutivo from './components/ResumoExecutivo';
import { analyticsApi } from './services/api';
import { DADOS_VIABILIDADE } from './data/constants';

const NAV_ITEMS = [
  { id: 'resumo', label: 'Resumo', icon: FileText },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'empresas', label: 'Mercado', icon: Building2 },
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'concorrencia', label: 'Concorrencia', icon: Hotel },
  { id: 'projecoes', label: 'Projecoes', icon: TrendingUp }
];

function App() {
  const [activeTab, setActiveTab] = useState('resumo');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.getCompleto();
      setData(result);
      setApiOnline(true);
      setError(null);
    } catch (err) {
      console.log('API offline, usando dados locais');
      setData({
        kpis: DADOS_VIABILIDADE.kpis,
        tendencias_setor: [],
        projecoes: DADOS_VIABILIDADE.projecoes,
        sazonalidade: [],
        eventos_resumo: { total_eventos_ano: 127, publico_total_estimado: 315000 },
        mercado: { leitos_ribeirao_pires: 200 },
        hotel_proposto: DADOS_VIABILIDADE.hotel_proposto
      });
      setApiOnline(false);
      setError('API offline - usando dados do estudo de viabilidade');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'resumo':
        return <ResumoExecutivo onNavigate={setActiveTab} />;
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'empresas':
        return <EmpresasChart />;
      case 'eventos':
        return <EventosTimeline />;
      case 'concorrencia':
        return <ConcorrenciaPanel />;
      case 'projecoes':
        return <ProjecoesPanel data={data} />;
      default:
        return <ResumoExecutivo onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo - Clicavel */}
            <button
              onClick={() => setActiveTab('resumo')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                RP
              </div>
              <div className="hidden sm:block text-left">
                <h1 className="text-lg font-semibold">Hotel RP</h1>
                <p className="text-xs text-muted-foreground">Dashboard de Viabilidade</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "gap-2",
                    activeTab === item.id && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={loadData}
              className="h-9 w-9"
              title="Atualizar dados"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>

            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
              apiOnline
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            )}>
              {apiOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-col gap-1 h-auto py-3"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Error Banner */}
      {error && (
        <div className="border-b bg-yellow-50">
          <div className="container flex items-center justify-between py-2 text-sm text-yellow-800">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              className="text-yellow-700 hover:text-yellow-900"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>Hotel Upscale Ribeirao Pires - Estudo de Viabilidade</p>
            <p>Dados: Prefeitura RP, IBGE, Sebrae | Dez/2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
