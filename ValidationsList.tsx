import React, { useState, useEffect } from 'react';
import { Check, X, Clock, TriangleAlert as AlertTriangle, User, Package, Tag, ShoppingCart } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { Validation } from '../../types';
import { validationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ValidationsList: React.FC = () => {
  const { user } = useAuth();
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Only allow admin access
  if (user?.role?.nom !== 'admin') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Accès refusé</h2>
        <p className="text-gray-400">Seuls les administrateurs peuvent accéder aux validations.</p>
      </div>
    );
  }

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    try {
      const data = await validationAPI.getAll();
      setValidations(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des validations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (validation: Validation, action: 'approve' | 'reject') => {
    setSelectedValidation(validation);
    setActionType(action);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedValidation) return;

    try {
      if (actionType === 'approve') {
        await validationAPI.approve(selectedValidation.id);
        toast.success('Demande approuvée avec succès');
      } else {
        await validationAPI.reject(selectedValidation.id);
        toast.success('Demande rejetée');
      }
      
      setModalOpen(false);
      setSelectedValidation(null);
      loadValidations();
    } catch (error) {
      toast.error('Erreur lors du traitement de la demande');
    }
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'categorie': return <Tag className="w-4 h-4" />;
      case 'produit': return <Package className="w-4 h-4" />;
      case 'vente': return <ShoppingCart className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getObjectLabel = (type: string) => {
    switch (type) {
      case 'user': return 'Utilisateur';
      case 'categorie': return 'Catégorie';
      case 'produit': return 'Produit';
      case 'vente': return 'Vente';
      default: return type;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'suppression': return 'Suppression';
      case 'restauration': return 'Restauration';
      default: return action;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: Clock },
      'approuve': { color: 'bg-green-100 text-green-800', text: 'Approuvé', icon: Check },
      'rejete': { color: 'bg-red-100 text-red-800', text: 'Rejeté', icon: X },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.en_attente;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const pendingValidations = validations.filter(v => v.status === 'en_attente');
  const processedValidations = validations.filter(v => v.status !== 'en_attente');

  const columns = [
    {
      key: 'type_objet',
      title: 'Type',
      render: (type: string) => (
        <div className="flex items-center space-x-2 text-gray-300">
          {getObjectIcon(type)}
          <span>{getObjectLabel(type)}</span>
        </div>
      ),
    },
    {
      key: 'objet_id',
      title: 'Objet ID',
      render: (id: number) => (
        <div className="font-mono text-white">#{id}</div>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      render: (action: string) => (
        <div className="text-gray-300">{getActionLabel(action)}</div>
      ),
    },
    {
      key: 'requester',
      title: 'Demandé par',
      render: (_, record: Validation) => (
        <div className="text-gray-300">
          {record.requester ? `${record.requester.prenom} ${record.requester.nom}` : 'N/A'}
        </div>
      ),
    },
    {
      key: 'date_demande',
      title: 'Date demande',
      render: (date: string) => (
        <div>
          <div className="text-white">{new Date(date).toLocaleDateString('fr-FR')}</div>
          <div className="text-sm text-gray-400">{new Date(date).toLocaleTimeString('fr-FR')}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (status: string) => getStatusBadge(status),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Validation) => (
        record.status === 'en_attente' ? (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="success"
              onClick={() => handleAction(record, 'approve')}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleAction(record, 'reject')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-gray-400">
            {record.validator ? `Par ${record.validator.prenom} ${record.validator.nom}` : 'Traité'}
          </div>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Validations</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {pendingValidations.length} demande(s) en attente
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">En attente</p>
              <p className="text-2xl font-bold text-yellow-400">{pendingValidations.length}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Approuvées</p>
              <p className="text-2xl font-bold text-green-400">
                {validations.filter(v => v.status === 'approuve').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Rejetées</p>
              <p className="text-2xl font-bold text-red-400">
                {validations.filter(v => v.status === 'rejete').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-500">
              <X className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Validations */}
      {pendingValidations.length > 0 && (
        <Card title="Demandes en attente">
          <Table
            data={pendingValidations}
            columns={columns}
            loading={loading}
          />
        </Card>
      )}

      {/* Processed Validations */}
      <Card title="Historique des validations">
        <Table
          data={processedValidations}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${actionType === 'approve' ? 'Approuver' : 'Rejeter'} la demande`}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
            <p className="font-medium">Confirmation requise</p>
          </div>
          
          {selectedValidation && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{getObjectLabel(selectedValidation.type_objet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Action:</span>
                  <span className="text-white">{getActionLabel(selectedValidation.action)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Demandé par:</span>
                  <span className="text-white">
                    {selectedValidation.requester ? 
                      `${selectedValidation.requester.prenom} ${selectedValidation.requester.nom}` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-300">
            Êtes-vous sûr de vouloir {actionType === 'approve' ? 'approuver' : 'rejeter'} cette demande ?
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant={actionType === 'approve' ? 'success' : 'danger'}
              onClick={confirmAction}
            >
              {actionType === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ValidationsList;