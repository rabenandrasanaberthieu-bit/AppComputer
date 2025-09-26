import React, { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Package, Users, DollarSign, FileText, ListFilter as Filter } from 'lucide-react';
import { Card, StatsCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState<'sales' | 'stock' | 'users'>('sales');

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    try {
      const data = await reportsAPI.getReportData(reportType, dateRange.startDate, dateRange.endDate);
      setReportData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await reportsAPI.exportReport(reportType, format, dateRange.startDate, dateRange.endDate);
      toast.success(`Rapport exporté en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const salesData = [
    { month: 'Jan', revenue: 4000, sales: 24 },
    { month: 'Fév', revenue: 3000, sales: 18 },
    { month: 'Mar', revenue: 5000, sales: 32 },
    { month: 'Avr', revenue: 4500, sales: 28 },
    { month: 'Mai', revenue: 6000, sales: 42 },
    { month: 'Jun', revenue: 5500, sales: 38 },
  ];

  const categoryData = [
    { name: 'Ordinateurs', value: 45, color: '#ef4444' },
    { name: 'Accessoires', value: 30, color: '#f97316' },
    { name: 'Imprimantes', value: 15, color: '#eab308' },
    { name: 'Autres', value: 10, color: '#6b7280' },
  ];

  const topProducts = [
    { name: 'Dell XPS 13', sales: 45, revenue: 54000 },
    { name: 'MacBook Pro', sales: 32, revenue: 64000 },
    { name: 'HP Pavilion', sales: 28, revenue: 28000 },
    { name: 'Logitech MX Master', sales: 67, revenue: 5360 },
    { name: 'Canon Pixma', sales: 23, revenue: 6900 },
  ];

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Chiffre d'affaires"
          value="€45,230"
          change="+12% vs période précédente"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatsCard
          title="Nombre de ventes"
          value="187"
          change="+8% vs période précédente"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatsCard
          title="Panier moyen"
          value="€242"
          change="+3% vs période précédente"
          icon={<Package className="w-6 h-6 text-white" />}
          color="yellow"
        />
        <StatsCard
          title="Clients uniques"
          value="156"
          change="+15% vs période précédente"
          icon={<Users className="w-6 h-6 text-white" />}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Évolution des ventes">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
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
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Répartition par catégorie">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Products */}
      <Card title="Top 5 des produits">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Produit</th>
                <th className="text-right py-3 text-gray-400 font-medium">Ventes</th>
                <th className="text-right py-3 text-gray-400 font-medium">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-3 text-white">{product.name}</td>
                  <td className="py-3 text-right text-white">{product.sales}</td>
                  <td className="py-3 text-right text-green-400 font-medium">
                    €{product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderStockReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Valeur du stock"
          value="€125,430"
          change="+5% vs mois dernier"
          icon={<Package className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatsCard
          title="Produits en stock"
          value="1,247"
          change="23 nouveaux produits"
          icon={<Package className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatsCard
          title="Stock bas"
          value="15"
          change="Nécessitent réapprovisionnement"
          icon={<Package className="w-6 h-6 text-white" />}
          color="yellow"
        />
        <StatsCard
          title="Ruptures"
          value="3"
          change="Produits en rupture"
          icon={<Package className="w-6 h-6 text-white" />}
          color="red"
        />
      </div>

      <Card title="Mouvements de stock par mois">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
            />
            <Bar dataKey="sales" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderUsersReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Utilisateurs actifs"
          value="12"
          change="2 nouveaux ce mois"
          icon={<Users className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatsCard
          title="Administrateurs"
          value="2"
          change="Accès complet"
          icon={<Users className="w-6 h-6 text-white" />}
          color="red"
        />
        <StatsCard
          title="Caissiers"
          value="8"
          change="Personnel de vente"
          icon={<Users className="w-6 h-6 text-white" />}
          color="blue"
        />
      </div>

      <Card title="Activité des utilisateurs">
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <p>Rapport d'activité des utilisateurs</p>
          <p className="text-sm">Connexions, actions, performances par utilisateur</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Rapports</h1>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type de rapport
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="sales">Ventes</option>
              <option value="stock">Stock</option>
              {user?.role?.nom === 'admin' && (
                <option value="users">Utilisateurs</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={loadReportData} className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>
          {reportType === 'sales' && renderSalesReport()}
          {reportType === 'stock' && renderStockReport()}
          {reportType === 'users' && user?.role?.nom === 'admin' && renderUsersReport()}
        </>
      )}
    </div>
  );
};

export default ReportsList;