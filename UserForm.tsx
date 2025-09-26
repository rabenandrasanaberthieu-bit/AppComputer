import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { User, Role } from '../../types';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const roles: Role[] = [
  { id: 1, nom: 'admin', description: 'Administrateur système' },
  { id: 2, nom: 'stock_manager', description: 'Gestionnaire de stock' },
  { id: 3, nom: 'cashier', description: 'Caissier/Vendeur' },
];

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    role_id: user?.role_id || 3, // Default to cashier
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.email || !formData.role_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user && !formData.mot_de_passe) {
      toast.error('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    if (formData.mot_de_passe && formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role_id: formData.role_id,
        ...(formData.mot_de_passe && { mot_de_passe: formData.mot_de_passe }),
      };

      if (user) {
        await userAPI.update(user.id, userData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await userAPI.create(userData);
        toast.success('Utilisateur créé avec succès');
      }
      
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nom *
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Rôle *
        </label>
        <select
          value={formData.role_id}
          onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          required
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.nom.replace('_', ' ').toUpperCase()} - {role.description}
            </option>
          ))}
        </select>
      </div>

      {!user && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mot de passe *
            </label>
            <input
              type="password"
              value={formData.mot_de_passe}
              onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              value={formData.confirmer_mot_de_passe}
              onChange={(e) => setFormData({ ...formData, confirmer_mot_de_passe: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>
        </>
      )}

      {user && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Note:</strong> Laissez les champs mot de passe vides pour conserver le mot de passe actuel.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {user ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;