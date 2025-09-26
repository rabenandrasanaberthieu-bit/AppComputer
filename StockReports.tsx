import React, { useState, useEffect } from 'react';
import { Download, Package, TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, FileText, ListFilter as Filter } from 'lucide-react';
import { Card, StatsCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Product, Category, StockMovement } from '../../types';
import { productAPI, categoryAPI, stockAPI, reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const StockReports: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [dateRange, selectedCategory]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, movementsData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        stockAPI.getMovements()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setMovements(movementsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await reportsAPI.exportReport('stock', format, dateRange.startDate, dateRange.endDate);
      toast.success(`Rapport de stock exporté en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  // Calculate stock statistics
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, product) => sum + (product.quantite_stock * product.prix_achat), 0);
  const lowStockProducts = products.filter(p => p.quantite_stock <= p.seuil_min && p.quantite_stock > 0);
  const outOfStockProducts = products.filter(p => p.quantite_stock <= 0);

  // Stock by category data
  const stockByCategory = categories.map(category => {
    const categoryProducts = products.filter(p => p.categorie_id === category.id);
    const totalValue = categoryProducts.reduce((sum, product) => sum + (product.quantite_stock * product.prix_achat), 0);
    const totalQuantity = categoryProducts.reduce((sum, product) => sum + product.quantite_stock, 0);
    
    return {
      name: category.nom,
      value: totalValue,
      quantity: totalQuantity,
      products: categoryProducts.length,
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][categories.indexOf(category) % 6]
    };
  });

  // Movement trends (last 6 months)
  const movementTrends = [
    { month: 'Jan', entrees: 45, sorties: 32, pertes: 2 },
    { month: 'Fév', entrees: 38, sorties: 28, pertes: 1 },
    { month: 'Mar', entrees: 52, sorties: 41, pertes: 3 },
    { month: 'Avr', entrees: 41, sorties: 35, pertes: 2 },
    { month: 'Mai', entrees: 48, sorties: 39, pertes: 1 },
    { month: 'Jun', entrees: 55, sorties: 42, pertes: 4 },
  ];

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categorie_id.toString() === selectedCategory)
    : products;

  const stockColumns = [
    {
      key: 'nom',
      title: 'Produit',
      render: (_, record: Product) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-white">{record.nom}</div>
            <div className="text-sm text-gray-400">{record.category?.nom}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'quantite_stock',
      title: 'Stock',
      render: (_, record: Product) => {
        const isLowStock = record.quantite_stock <= record.seuil_min && record.quantite_stock > 0;
        const isOutOfStock = record.quantite_stock <= 0;
        
        return (
          <div>
            <div className={`font-medium ${
              isOutOfStock ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-white'
            }`}>
              {record.quantite_stock}
            </div>
            <div className="text-sm text-gray-400">Min: {record.seuil_min}</div>
          </div>
        );
      },
    },
    {
      key: 'prix_achat',
      title: 'Prix d\'achat',
      render: (prix: number) => (
        <div className="text-white">{prix.toLocaleString()} €</div>
      ),
    },
    {
      key: 'stock_value',
      title: 'Valeur stock',
      render: (_, record: Product) => (
        <div className="text-green-400 font-medium">
          {(record.quantite_stock * record.prix_achat).toLocaleString()} €
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (_, record: Product) => {
        if (record.quantite_stock <= 0) {
          return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rupture</span>;
        }
        if (record.quantite_stock <= record.seuil_min) {
          return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Stock bas</span>;
        }
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">En stock</span>;
      },
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
        <h1 className="text-2xl font-bold text-white">Rapports de Stock</h1>
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

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Catégorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Produits en stock"
          value={totalProducts}
          change={`${categories.length} catégories`}
          icon={<Package className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatsCard
          title="Valeur totale"
          value={`€${totalStockValue.toLocaleString()}`}
          change="Valeur d'achat"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="green"
        />
        <StatsCard
          title="Stock bas"
          value={lowStockProducts.length}
          change="Nécessitent réapprovisionnement"
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="yellow"
        />
        <StatsCard
          title="Ruptures"
          value={outOfStockProducts.length}
          change="Produits épuisés"
          icon={<TrendingDown className="w-6 h-6 text-white" />}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Mouvements de stock">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementTrends}>
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
              <Bar dataKey="entrees" fill="#22c55e" name="Entrées" />
              <Bar dataKey="sorties" fill="#ef4444" name="Sorties" />
              <Bar dataKey="pertes" fill="#f97316" name="Pertes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Répartition par catégorie">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {stockByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Valeur']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stockByCategory.map((entry, index) => (
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

      {/* Stock Details Table */}
      <Card title="Détail des stocks">
        <Table
          data={filteredProducts}
          columns={stockColumns}
          loading={loading}
        />
      </Card>

      {/* Alerts Section */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {outOfStockProducts.length > 0 && (
            <Card title="Produits en rupture">
              <div className="space-y-3">
                {outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-900 border border-red-700 rounded-lg">
                    <div>
                      <div className="font-medium text-red-100">{product.nom}</div>
                      <div className="text-sm text-red-200">{product.category?.nom}</div>
                    </div>
                    <div className="text-red-200 text-sm">
                      Stock: {product.quantite_stock}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lowStockProducts.length > 0 && (
            <Card title="Stock bas">
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-100">{product.nom}</div>
                      <div className="text-sm text-yellow-200">{product.category?.nom}</div>
                    </div>
                    <div className="text-yellow-200 text-sm">
                      Stock: {product.quantite_stock} / Min: {product.seuil_min}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StockReports;