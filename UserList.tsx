import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Power, UserX } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Table } from '../../components/UI/Table';
import { Modal } from '../../components/UI/Modal';
import { User, Role } from '../../types';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import UserForm from './UserForm';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Only allow admin access
  if (currentUser?.role?.nom !== 'admin') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Accès refusé</h2>
        <p className="text-gray-400">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.etat === 'actif' ? 'désactivé' : 'actif';
      await userAPI.update(user.id, { etat: newStatus });
      await loadUsers();
      toast.success(`Utilisateur ${newStatus === 'actif' ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingUser(null);
    loadUsers();
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-600';
      case 'stock_manager': return 'bg-blue-600';
      case 'cashier': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const columns = [
    {
      key: 'nom',
      title: 'Nom complet',
      render: (_, record: User) => (
        <div>
          <div className="font-medium text-white">{record.prenom} {record.nom}</div>
          <div className="text-sm text-gray-400">{record.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Rôle',
      render: (_, record: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${getRoleBadgeColor(record.role?.nom || '')}`}>
          {record.role?.nom?.replace('_', ' ')?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'etat',
      title: 'État',
      render: (etat: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          etat === 'actif' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {etat}
        </span>
      ),
    },
    {
      key: 'date_creation',
      title: 'Créé le',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: User) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(record)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={record.etat === 'actif' ? 'danger' : 'success'}
            onClick={() => handleToggleStatus(record)}
            disabled={record.id === currentUser?.id}
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion des utilisateurs</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <Table
          data={users}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default UserList;