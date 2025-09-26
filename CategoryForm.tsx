import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { Category } from '../../types';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: category?.nom || '',
    description: category?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoryAPI.update(category.id, formData);
        toast.success('Catégorie modifiée avec succès');
      } else {
        await categoryAPI.create(formData);
        toast.success('Catégorie créée avec succès');
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
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Nom de la catégorie *
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          placeholder="Ex: Ordinateurs portables"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          rows={3}
          placeholder="Description de la catégorie..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {category ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;