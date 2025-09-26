import React, { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, TriangleAlert as AlertTriangle, TrendingUp, Users, Calendar, FileText } from 'lucide-react';
import { StatsCard, Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';
import { DashboardStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    if (hour >= 18) greeting = 'Bonsoir';
    else if (hour >= 12) greeting = 'Bon après-midi';
    
    return `${greeting}, ${user?.prenom}!`;
  };

  const getRoleSpecificStats = () => {
    if (!stats) return [];

    const baseStats = [
      {
        title: 'Chiffre d\'affaires total',
        value: `${stats.totalRevenue.toLocaleString()} €`,
        change: '+12% vs mois dernier',
        icon: <DollarSign className="w-6 h-6 text-white" />,
        color: 'green' as const,
      },
      {
        title: 'Ventes aujourd\'hui',
        value: stats.todaySales,
        change: `${stats.todayRevenue.toLocaleString()} € aujourd'hui`,
        icon: <ShoppingCart className="w-6 h-6 text-white" />,
        color: 'blue' as const,
      },
    ];

    if (user?.role?.nom === 'admin' || user?.role?.nom === 'stock_manager') {
      baseStats.push(
        {
          title: 'Produits en stock',
          value: stats.totalProducts,
          change: `${stats.lowStockCount} en rupture`,
          icon: <Package className="w-6 h-6 text-white" />,
          color: 'yellow' as const,
        },
        {
          title: 'Alertes stock',
          value: stats.lowStockCount,
          change: 'Nécessitent attention',
          icon: <AlertTriangle className="w-6 h-6 text-white" />,
          color: 'red' as const,
        }
      );
    }

    return baseStats;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-400">
          Voici un aperçu de votre activité commerciale aujourd'hui.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getRoleSpecificStats().map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
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

        {/* Category Distribution */}
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
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card title="Ventes récentes">
          <div className="space-y-4">
            {[
              { id: 1, product: 'Dell XPS 13', amount: 1200, time: '10:30' },
              { id: 2, product: 'Souris Logitech', amount: 80, time: '11:15' },
              { id: 3, product: 'Clavier mécanique', amount: 150, time: '12:45' },
            ].map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="text-white font-medium">{sale.product}</p>
                  <p className="text-gray-400 text-sm">{sale.time}</p>
                </div>
                <div className="text-green-400 font-medium">
                  +{sale.amount} €
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Actions rapides">
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
              <ShoppingCart className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Nouvelle vente</p>
            </button>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
              <Package className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Gérer stock</p>
            </button>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
              <FileText className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Rapports</p>
            </button>
            <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group">
              <Users className="w-8 h-8 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Utilisateurs</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;