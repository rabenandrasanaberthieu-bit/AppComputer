import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, TriangleAlert as AlertTriangle, Package, Search } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Product, Category } from '../../types';
import { productAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProductForm from './ProductForm';
import toast from 'react-hot-toast';

const ProductList: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      if (user?.role?.nom === 'admin') {
        await productAPI.delete(productToDelete.id);
        toast.success('Produit supprimé avec succès');
      } else {
        await productAPI.requestDeletion(productToDelete.id);
        toast.success('Demande de suppression envoyée à l\'administrateur');
      }
      
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingProduct(null);
    loadData();
  };

  const getStatusBadge = (etat: string) => {
    const statusConfig = {
      'actif': { color: 'bg-green-100 text-green-800', text: 'Actif' },
      'en_attente_suppression': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      'supprimé': { color: 'bg-red-100 text-red-800', text: 'Supprimé' },
    };
    
    const config = statusConfig[etat as keyof typeof statusConfig] || statusConfig.actif;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStockBadge = (product: Product) => {
    if (product.quantite_stock <= 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rupture</span>;
    }
    if (product.quantite_stock <= product.seuil_min) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Stock bas</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">En stock</span>;
  };

  const canEdit = (product: Product) => {
    if (user?.role?.nom === 'admin') return true;
    if (user?.role?.nom === 'stock_manager' && product.cree_par === user.id) return true;
    return false;
  };

  const canDelete = (product: Product) => {
    if (user?.role?.nom === 'admin') return true;
    if (user?.role?.nom === 'stock_manager' && product.cree_par === user.id) return true;
    return false;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categorie_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
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
            <div className="text-sm text-gray-400 max-w-xs truncate">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Catégorie',
      render: (_, record: Product) => (
        <span className="text-gray-300">
          {record.category?.nom || 'N/A'}
        </span>
      ),
    },
    {
      key: 'prix_vente',
      title: 'Prix',
      render: (_, record: Product) => (
        <div>
          <div className="text-white font-medium">{record.prix_vente.toLocaleString()} €</div>
          <div className="text-sm text-gray-400">Achat: {record.prix_achat.toLocaleString()} €</div>
        </div>
      ),
    },
    {
      key: 'quantite_stock',
      title: 'Stock',
      render: (_, record: Product) => (
        <div>
          <div className="text-white font-medium">{record.quantite_stock}</div>
          <div className="text-sm text-gray-400">Min: {record.seuil_min}</div>
          {getStockBadge(record)}
        </div>
      ),
    },
    {
      key: 'etat',
      title: 'État',
      render: (etat: string) => getStatusBadge(etat),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Product) => (
        <div className="flex space-x-2">
          {canEdit(record) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleEdit(record)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {canDelete(record) && record.etat === 'actif' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(record)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion des produits</h1>
        {(user?.role?.nom === 'admin' || user?.role?.nom === 'stock_manager') && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </Card>

      <Card>
        <Table
          data={filteredProducts}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="xl"
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
            <p className="font-medium">Attention</p>
          </div>
          <p className="text-gray-300">
            Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.nom}" ?
          </p>
          {user?.role?.nom !== 'admin' && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                En tant que gestionnaire de stock, votre demande sera envoyée à l'administrateur pour validation.
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              {user?.role?.nom === 'admin' ? 'Supprimer' : 'Demander la suppression'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;