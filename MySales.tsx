import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, DollarSign, ShoppingCart, TrendingUp, FileText } from 'lucide-react';
import { Card, StatsCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Sale } from '../../types';
import { salesAPI, reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SaleDetails from './SaleDetails';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const MySales: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');

  useEffect(() => {
    loadMySales();
  }, [dateRange, period]);

  const loadMySales = async () => {
    try {
      const allSales = await salesAPI.getAll();
      // Filter sales for current cashier only
      const mySales = allSales.filter(sale => sale.caissier_id === user?.id);
      setSales(mySales);
    } catch (error) {
      toast.error('Erreur lors du chargement de vos ventes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsModalOpen(true);
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await reportsAPI.exportReport('my-sales', format, dateRange.startDate, dateRange.endDate);
      toast.success(`Rapport de vos ventes exporté en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const setPredefinedPeriod = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    const today = new Date();
    
    switch (newPeriod) {
      case 'today':
        setDateRange({
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        setDateRange({
          startDate: weekStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          startDate: monthStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        });
        break;
    }
  };

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date_vente).toISOString().split('T')[0];
    return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
  });

  // Calculate statistics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_ttc, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const todaySales = sales.filter(sale => 
    new Date(sale.date_vente).toDateString() === new Date().toDateString()
  );

  // Sales by day (last 7 days)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dayString = date.toISOString().split('T')[0];
    
    const daySales = sales.filter(sale => 
      new Date(sale.date_vente).toISOString().split('T')[0] === dayString
    );
    
    return {
      day: dayName,
      sales: daySales.length,
      revenue: daySales.reduce((sum, sale) => sum + sale.total_ttc, 0),
    };
  });

  // Sales by payment method
  const paymentMethods = [
    { method: 'cash', label: 'Espèces', color: '#22c55e' },
    { method: 'carte', label: 'Carte', color: '#3b82f6' },
    { method: 'mobile_money', label: 'Mobile Money', color: '#f59e0b' },
  ];

  const salesByPayment = paymentMethods.map(pm => ({
    ...pm,
    count: filteredSales.filter(sale => sale.mode_paiement === pm.method).length,
    revenue: filteredSales
      .filter(sale => sale.mode_paiement === pm.method)
      .reduce((sum, sale) => sum + sale.total_ttc, 0),
  }));

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'cash': return '💵';
      case 'carte': return '💳';
      case 'mobile_money': return '📱';
      default: return '💳';
    }
  };

  const getPaymentLabel = (mode: string) => {
    switch (mode) {
      case 'cash': return 'Espèces';
      case 'carte': return 'Carte';
      case 'mobile_money': return 'Mobile Money';
      default: return mode;
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'N° Vente',
      render: (id: number) => (
        <div className="font-mono text-white">#{id.toString().padStart(6, '0')}</div>
      ),
    },
    {
      key: 'total_ttc',
      title: 'Montant',
      render: (_, record: Sale) => (
        <div>
          <div className="text-white font-medium">{record.total_ttc.toLocaleString()} €</div>
          <div className="text-sm text-gray-400">HT: {record.total_ht.toLocaleString()} €</div>
        </div>
      ),
    },
    {
      key: 'mode_paiement',
      title: 'Paiement',
      render: (mode: string) => (
        <div className="flex items-center space-x-2 text-gray-300">
          <span>{getPaymentIcon(mode)}</span>
          <span>{getPaymentLabel(mode)}</span>
        </div>
      ),
    },
    {
      key: 'date_vente',
      title: 'Date & Heure',
      render: (date: string) => (
        <div>
          <div className="text-white">{new Date(date).toLocaleDateString('fr-FR')}</div>
          <div className="text-sm text-gray-400">{new Date(date).toLocaleTimeString('fr-FR')}</div>
        </div>
      ),
    },
    {
      key: 'etat',
      title: 'État',
      render: (etat: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          etat === 'valide' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {etat === 'valide' ? 'Validé' : 'En attente'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Sale) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleViewDetails(record)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Mes Ventes</h1>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <button
            onClick={() => setPredefinedPeriod('today')}
            className={`p-3 rounded-lg border transition-colors ${
              period === 'today'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setPredefinedPeriod('week')}
            className={`p-3 rounded-lg border transition-colors ${
              period === 'week'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            7 derniers jours
          </button>
          <button
            onClick={() => setPredefinedPeriod('month')}
            className={`p-3 rounded-lg border transition-colors ${
              period === 'month'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-gray-600 text-gray-300 hover:border-gray-500'
            }`}
          >
            Ce mois
          </button>
          <div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, startDate: e.target.value });
                setPeriod('custom');
              }}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, endDate: e.target.value });
                setPeriod('custom');
              }}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          <Button onClick={loadMySales} className="w-full">
            Actualiser
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Ventes totales"
          value={totalSales}
          change={`${todaySales.length} aujourd'hui`}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatsCard
          title="Chiffre d'affaires"
          value={`€${totalRevenue.toLocaleString()}`}
          change="Période sélectionnée"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatsCard
          title="Panier moyen"
          value={`€${averageTicket.toLocaleString()}`}
          change="Par transaction"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="yellow"
        />
        <StatsCard
          title="Ventes aujourd'hui"
          value={todaySales.length}
          change={`€${todaySales.reduce((sum, sale) => sum + sale.total_ttc, 0).toLocaleString()}`}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Évolution des ventes (7 derniers jours)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Chiffre d'affaires (€)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Répartition par mode de paiement">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByPayment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="count" fill="#ef4444" name="Nombre de ventes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Payment Methods Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {salesByPayment.map((payment) => (
          <Card key={payment.method}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{payment.label}</p>
                <p className="text-2xl font-bold text-white">{payment.count} ventes</p>
                <p className="text-sm text-green-400">€{payment.revenue.toLocaleString()}</p>
              </div>
              <div className="text-4xl">
                {getPaymentIcon(payment.method)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sales Table */}
      <Card title="Historique de vos ventes">
        <Table
          data={filteredSales}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Détails de la vente #${selectedSale?.id?.toString().padStart(6, '0')}`}
        size="lg"
      >
        {selectedSale && (
          <SaleDetails
            sale={selectedSale}
            onClose={() => setDetailsModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MySales;