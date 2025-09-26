import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Category } from '../../types';
import { categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CategoryForm from './CategoryForm';
import toast from 'react-hot-toast';

const CategoryList: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      if (user?.role?.nom === 'admin') {
        // Admin can delete directly
        await categoryAPI.delete(categoryToDelete.id);
        toast.success('Catégorie supprimée avec succès');
      } else {
        // Stock manager requests deletion
        await categoryAPI.requestDeletion(categoryToDelete.id);
        toast.success('Demande de suppression envoyée à l\'administrateur');
      }
      
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingCategory(null);
    loadCategories();
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

  const canEdit = (category: Category) => {
    if (user?.role?.nom === 'admin') return true;
    if (user?.role?.nom === 'stock_manager' && category.cree_par === user.id) return true;
    return false;
  };

  const canDelete = (category: Category) => {
    if (user?.role?.nom === 'admin') return true;
    if (user?.role?.nom === 'stock_manager' && category.cree_par === user.id) return true;
    return false;
  };

  const columns = [
    {
      key: 'nom',
      title: 'Nom',
      render: (nom: string) => (
        <div className="font-medium text-white">{nom}</div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (description: string) => (
        <div className="text-gray-300 max-w-xs truncate">{description}</div>
      ),
    },
    {
      key: 'etat',
      title: 'État',
      render: (etat: string) => getStatusBadge(etat),
    },
    {
      key: 'created_by',
      title: 'Créé par',
      render: (_, record: Category) => (
        <div className="text-gray-300">
          {record.created_by ? `${record.created_by.prenom} ${record.created_by.nom}` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'date_creation',
      title: 'Date création',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Category) => (
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
        <h1 className="text-2xl font-bold text-white">Gestion des catégories</h1>
        {(user?.role?.nom === 'admin' || user?.role?.nom === 'stock_manager') && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      <Card>
        <Table
          data={categories}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        size="lg"
      >
        <CategoryForm
          category={editingCategory}
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
            Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.nom}" ?
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

export default CategoryList;