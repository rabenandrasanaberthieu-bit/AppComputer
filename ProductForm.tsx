import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { Product, Category } from '../../types';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: product?.nom || '',
    description: product?.description || '',
    prix_achat: product?.prix_achat || 0,
    prix_vente: product?.prix_vente || 0,
    quantite_stock: product?.quantite_stock || 0,
    seuil_min: product?.seuil_min || 5,
    categorie_id: product?.categorie_id || (categories[0]?.id || 1),
    image_url: product?.image_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error('Le nom du produit est obligatoire');
      return;
    }

    if (formData.prix_achat <= 0 || formData.prix_vente <= 0) {
      toast.error('Les prix doivent être supérieurs à 0');
      return;
    }

    if (formData.prix_vente <= formData.prix_achat) {
      toast.error('Le prix de vente doit être supérieur au prix d\'achat');
      return;
    }

    setLoading(true);
    try {
      if (product) {
        await productAPI.update(product.id, formData);
        toast.success('Produit modifié avec succès');
      } else {
        await productAPI.create(formData);
        toast.success('Produit créé avec succès');
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
            Nom du produit *
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            placeholder="Ex: Dell XPS 13"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Catégorie *
          </label>
          <select
            value={formData.categorie_id}
            onChange={(e) => setFormData({ ...formData, categorie_id: parseInt(e.target.value) })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>
        </div>
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
          placeholder="Description du produit..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prix d'achat (€) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.prix_achat}
            onChange={(e) => setFormData({ ...formData, prix_achat: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prix de vente (€) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.prix_vente}
            onChange={(e) => setFormData({ ...formData, prix_vente: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Quantité en stock
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantite_stock}
            onChange={(e) => setFormData({ ...formData, quantite_stock: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Seuil minimum
          </label>
          <input
            type="number"
            min="0"
            value={formData.seuil_min}
            onChange={(e) => setFormData({ ...formData, seuil_min: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          URL de l'image
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {formData.prix_achat > 0 && formData.prix_vente > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Marge unitaire:</span>
              <span className="text-green-400 font-medium ml-2">
                {(formData.prix_vente - formData.prix_achat).toFixed(2)} €
              </span>
            </div>
            <div>
              <span className="text-gray-400">Marge (%):</span>
              <span className="text-green-400 font-medium ml-2">
                {(((formData.prix_vente - formData.prix_achat) / formData.prix_achat) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {product ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;