import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, TriangleAlert as AlertTriangle, ShoppingCart, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Sale } from '../../types';
import { salesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SaleForm from './SaleForm';
import SaleDetails from './SaleDetails';
import toast from 'react-hot-toast';

const SalesList: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await salesAPI.getAll();
      setSales(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsModalOpen(true);
  };

  const handleDelete = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!saleToDelete) return;

    try {
      if (user?.role?.nom === 'admin') {
        await salesAPI.delete(saleToDelete.id);
        toast.success('Vente supprimée avec succès');
      } else {
        await salesAPI.requestDeletion(saleToDelete.id);
        toast.success('Demande de suppression envoyée à l\'administrateur');
      }
      
      setDeleteModalOpen(false);
      setSaleToDelete(null);
      loadSales();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    loadSales();
  };

  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'carte': return <CreditCard className="w-4 h-4" />;
      case 'mobile_money': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
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

  const getStatusBadge = (etat: string) => {
    const statusConfig = {
      'valide': { color: 'bg-green-100 text-green-800', text: 'Validé' },
      'en_attente_suppression': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      'supprimé': { color: 'bg-red-100 text-red-800', text: 'Supprimé' },
    };
    
    const config = statusConfig[etat as keyof typeof statusConfig] || statusConfig.valide;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const canDelete = (sale: Sale) => {
    if (user?.role?.nom === 'admin') return true;
    if (user?.role?.nom === 'cashier' && sale.caissier_id === user.id) return true;
    return false;
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
      key: 'cashier',
      title: 'Caissier',
      render: (_, record: Sale) => (
        <div className="text-gray-300">
          {record.cashier ? `${record.cashier.prenom} ${record.cashier.nom}` : 'N/A'}
        </div>
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
          {getPaymentIcon(mode)}
          <span>{getPaymentLabel(mode)}</span>
        </div>
      ),
    },
    {
      key: 'etat',
      title: 'État',
      render: (etat: string) => getStatusBadge(etat),
    },
    {
      key: 'date_vente',
      title: 'Date',
      render: (date: string) => (
        <div>
          <div className="text-white">{new Date(date).toLocaleDateString('fr-FR')}</div>
          <div className="text-sm text-gray-400">{new Date(date).toLocaleTimeString('fr-FR')}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Sale) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewDetails(record)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {canDelete(record) && record.etat === 'valide' && (
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
        <h1 className="text-2xl font-bold text-white">Gestion des ventes</h1>
        {(user?.role?.nom === 'admin' || user?.role?.nom === 'cashier') && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle vente
          </Button>
        )}
      </div>

      <Card>
        <Table
          data={sales}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouvelle vente"
        size="xl"
      >
        <SaleForm
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

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
            Êtes-vous sûr de vouloir supprimer la vente #{saleToDelete?.id?.toString().padStart(6, '0')} ?
          </p>
          {user?.role?.nom !== 'admin' && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                En tant que caissier, votre demande sera envoyée à l'administrateur pour validation.
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

export default SalesList;