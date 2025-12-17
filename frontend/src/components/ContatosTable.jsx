import React, { useState, useEffect } from 'react';
import { Download, Search, Users, UserCheck, UserPlus, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { empresasApi } from '../services/api';
import { EMPRESAS_EXEMPLO, STATUS_PARCERIA } from '../data/constants';

function ContatosTable() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const result = await empresasApi.listar({ limit: 100 });
      setEmpresas(result.empresas || []);
    } catch (err) {
      const expandidos = [
        ...EMPRESAS_EXEMPLO,
        { id: 11, nome: "Churrascaria Gaucha", setor: "Restaurantes", status: "nao_contatado", cnae: "5611-2/01", telefone: "(11) 4828-1234", email: "contato@churrascaria.com" },
        { id: 12, nome: "Agencia Turismo Mais", setor: "Turismo", status: "prospectado", cnae: "7911-2/00", telefone: "(11) 4828-2345", email: "turismo@mais.com" },
        { id: 13, nome: "Decoracao Festa", setor: "Producao de Eventos", status: "nao_contatado", cnae: "9001-9/06", telefone: "(11) 4828-3456", email: "decor@festa.com" },
        { id: 14, nome: "Van Express", setor: "Transporte Turistico", status: "contatado", cnae: "4929-9/01", telefone: "(11) 4828-4567", email: "van@express.com" },
        { id: 15, nome: "Buffet Requinte Plus", setor: "Buffets/Catering", status: "parceiro", cnae: "5620-1/02", telefone: "(11) 4828-5678", email: "requinte@plus.com" }
      ];
      setEmpresas(expandidos);
    } finally {
      setLoading(false);
    }
  };

  const setores = [...new Set(empresas.map(e => e.setor || e.setor_hotel))].filter(Boolean);

  const empresasFiltradas = empresas.filter(emp => {
    const setor = emp.setor || emp.setor_hotel;
    const status = emp.status || emp.status_parceria;
    const nome = emp.nome || emp.razao_social || emp.nome_fantasia;

    if (filtroSetor !== 'todos' && setor !== filtroSetor) return false;
    if (filtroStatus !== 'todos' && status !== filtroStatus) return false;
    if (busca && !nome?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const exportarExcel = () => {
    const headers = ['Nome', 'Setor', 'CNAE', 'Status', 'Telefone', 'Email'];
    const rows = empresasFiltradas.map(emp => [
      emp.nome || emp.razao_social || emp.nome_fantasia || '',
      emp.setor || emp.setor_hotel || '',
      emp.cnae || emp.cnae_principal || '',
      emp.status || emp.status_parceria || '',
      emp.telefone || '',
      emp.email || ''
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contatos_hotel_rp.csv';
    link.click();
  };

  const atualizarStatus = async (empresaId, novoStatus) => {
    try {
      await empresasApi.atualizarStatus(empresaId, novoStatus);
    } catch (err) {}
    setEmpresas(prev => prev.map(emp =>
      emp.id === empresaId ? { ...emp, status: novoStatus, status_parceria: novoStatus } : emp
    ));
  };

  const contadores = {
    total: empresas.length,
    parceiros: empresas.filter(e => (e.status || e.status_parceria) === 'parceiro').length,
    prospectados: empresas.filter(e => (e.status || e.status_parceria) === 'prospectado').length,
    contatados: empresas.filter(e => (e.status || e.status_parceria) === 'contatado').length,
    naoContatados: empresas.filter(e => (e.status || e.status_parceria) === 'nao_contatado').length
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
          <h2 className="text-2xl font-bold tracking-tight">Base de Contatos</h2>
          <p className="text-muted-foreground">Empresas para parcerias comerciais com o hotel</p>
        </div>
        <Button onClick={exportarExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-bold">{contadores.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Parceiros</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{contadores.parceiros}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <UserPlus className="h-4 w-4" />
              <span className="text-xs">Prospectados</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{contadores.prospectados}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Phone className="h-4 w-4" />
              <span className="text-xs">Contatados</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{contadores.contatados}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="h-4 w-4" />
              <span className="text-xs">Nao Contatados</span>
            </div>
            <p className="text-2xl font-bold">{contadores.naoContatados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-muted-foreground mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome da empresa..."
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Setor</label>
              <select
                value={filtroSetor}
                onChange={(e) => setFiltroSetor(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos os setores</option>
                {setores.map(setor => (
                  <option key={setor} value={setor}>{setor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos</option>
                <option value="nao_contatado">Nao contatado</option>
                <option value="prospectado">Prospectado</option>
                <option value="contatado">Contatado</option>
                <option value="parceiro">Parceiro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium">Setor</th>
                  <th className="text-left py-3 px-4 font-medium">Contato</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.map((emp) => {
                  const nome = emp.nome || emp.razao_social || emp.nome_fantasia;
                  const setor = emp.setor || emp.setor_hotel;
                  const status = emp.status || emp.status_parceria || 'nao_contatado';

                  return (
                    <tr key={emp.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{nome}</p>
                          <p className="text-xs text-muted-foreground">CNAE: {emp.cnae || emp.cnae_principal}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{setor}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-1">
                          {emp.telefone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {emp.telefone}</p>}
                          {emp.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emp.email}</p>}
                          {!emp.telefone && !emp.email && <p className="text-muted-foreground">Sem contato</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={
                          status === 'parceiro' ? 'success' :
                          status === 'prospectado' ? 'info' :
                          status === 'contatado' ? 'warning' : 'secondary'
                        }>
                          {STATUS_PARCERIA[status]?.label || status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={status}
                          onChange={(e) => atualizarStatus(emp.id, e.target.value)}
                          className="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-primary"
                        >
                          <option value="nao_contatado">Nao contatado</option>
                          <option value="prospectado">Prospectado</option>
                          <option value="contatado">Contatado</option>
                          <option value="parceiro">Parceiro</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {empresasFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma empresa encontrada com os filtros selecionados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 mb-2">Estrategia de Parcerias</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p className="font-medium">Buffets e Organizadores de Eventos</p>
              <p className="text-blue-600">Pacotes integrados evento + hospedagem</p>
            </div>
            <div>
              <p className="font-medium">Agencias de Turismo</p>
              <p className="text-blue-600">Canal de distribuicao e pacotes regionais</p>
            </div>
            <div>
              <p className="font-medium">Fotografos e Filmmakers</p>
              <p className="text-blue-600">Indicacao mutua para casamentos</p>
            </div>
            <div>
              <p className="font-medium">Transportadoras</p>
              <p className="text-blue-600">Servico de transfer para grupos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContatosTable;
