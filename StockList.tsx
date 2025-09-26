import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, RotateCcw, TriangleAlert as AlertTriangle, Package, Search } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Product, StockMovement, Category } from '../../types';
import { productAPI, stockAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StockMovementForm from './StockMovementForm';
import toast from 'react-hot-toast';

const StockList: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'movements'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAddMovement = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    loadData();
  };

  const getStockStatus = (product: Product) => {
    if (product.quantite_stock <= 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Rupture' };
    }
    if (product.quantite_stock <= product.seuil_min) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Stock bas' };
    }
    return { status: 'ok', color: 'bg-green-100 text-green-800', text: 'En stock' };
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entree': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'sortie': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'retour': return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'perte': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entree': return 'Entrée';
      case 'sortie': return 'Sortie';
      case 'retour': return 'Retour';
      case 'perte': return 'Perte';
      default: return type;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categorie_id.toString() === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.quantite_stock <= product.seuil_min && product.quantite_stock > 0;
    } else if (stockFilter === 'out') {
      matchesStock = product.quantite_stock <= 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const productColumns = [
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
      title: 'Stock actuel',
      render: (_, record: Product) => {
        const status = getStockStatus(record);
        return (
          <div>
            <div className="text-white font-medium">{record.quantite_stock}</div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
              {status.text}
            </span>
          </div>
        );
      },
    },
    {
      key: 'seuil_min',
      title: 'Seuil minimum',
      render: (seuil: number) => (
        <div className="text-gray-300">{seuil}</div>
      ),
    },
    {
      key: 'prix_vente',
      title: 'Valeur stock',
      render: (_, record: Product) => (
        <div className="text-white font-medium">
          {(record.quantite_stock * record.prix_achat).toLocaleString()} €
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Product) => (
        <Button
          size="sm"
          onClick={() => handleAddMovement(record)}
          disabled={user?.role?.nom === 'cashier'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Mouvement
        </Button>
      ),
    },
  ];

  const movementColumns = [
    {
      key: 'type',
      title: 'Type',
      render: (type: string) => (
        <div className="flex items-center space-x-2">
          {getMovementIcon(type)}
          <span className="text-white">{getMovementLabel(type)}</span>
        </div>
      ),
    },
    {
      key: 'product',
      title: 'Produit',
      render: (_, record: StockMovement) => (
        <div className="text-white">
          {record.product?.nom || `Produit #${record.produit_id}`}
        </div>
      ),
    },
    {
      key: 'quantite',
      title: 'Quantité',
      render: (_, record: StockMovement) => (
        <div className={`font-medium ${
          record.type === 'entree' || record.type === 'retour' 
            ? 'text-green-400' 
            : 'text-red-400'
        }`}>
          {record.type === 'entree' || record.type === 'retour' ? '+' : '-'}{record.quantite}
        </div>
      ),
    },
    {
      key: 'user',
      title: 'Utilisateur',
      render: (_, record: StockMovement) => (
        <div className="text-gray-300">
          {record.user ? `${record.user.prenom} ${record.user.nom}` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'date_mouvement',
      title: 'Date',
      render: (date: string) => (
        <div>
          <div className="text-white">{new Date(date).toLocaleDateString('fr-FR')}</div>
          <div className="text-sm text-gray-400">{new Date(date).toLocaleTimeString('fr-FR')}</div>
        </div>
      ),
    },
    {
      key: 'commentaire',
      title: 'Commentaire',
      render: (commentaire: string) => (
        <div className="text-gray-300 max-w-xs truncate">
          {commentaire || '-'}
        </div>
      ),
    },
  ];

  const lowStockProducts = products.filter(p => p.quantite_stock <= p.seuil_min && p.quantite_stock > 0);
  const outOfStockProducts = products.filter(p => p.quantite_stock <= 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion du stock</h1>
      </div>

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-200 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-medium">Produits en rupture ({outOfStockProducts.length})</h3>
              </div>
              <div className="space-y-1">
                {outOfStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="text-sm text-red-100">
                    {product.nom}
                  </div>
                ))}
                {outOfStockProducts.length > 3 && (
                  <div className="text-sm text-red-200">
                    +{outOfStockProducts.length - 3} autres...
                  </div>
                )}
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-200 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-medium">Stock bas ({lowStockProducts.length})</h3>
              </div>
              <div className="space-y-1">
                {lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="text-sm text-yellow-100">
                    {product.nom} ({product.quantite_stock} restant)
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <div className="text-sm text-yellow-200">
                    +{lowStockProducts.length - 3} autres...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Produits en stock
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Mouvements de stock
          </button>
        </nav>
      </div>

      {activeTab === 'products' && (
        <>
          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
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
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="all">Tous les stocks</option>
                <option value="low">Stock bas</option>
                <option value="out">Rupture de stock</option>
              </select>
            </div>
          </Card>

          <Card>
            <Table
              data={filteredProducts}
              columns={productColumns}
              loading={loading}
            />
          </Card>
        </>
      )}

      {activeTab === 'movements' && (
        <Card>
          <Table
            data={movements}
            columns={movementColumns}
            loading={loading}
          />
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Mouvement de stock - ${selectedProduct?.nom}`}
        size="lg"
      >
        {selectedProduct && (
          <StockMovementForm
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default StockList;