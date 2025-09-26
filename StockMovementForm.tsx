import React, { useState } from 'react';
import { Button } from '../../components/UI/Button';
import { Product } from '../../types';
import { stockAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface StockMovementFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'entree' as 'entree' | 'sortie' | 'retour' | 'perte',
    quantite: 1,
    commentaire: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantite <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    if ((formData.type === 'sortie' || formData.type === 'perte') && formData.quantite > product.quantite_stock) {
      toast.error('Quantité insuffisante en stock');
      return;
    }

    setLoading(true);
    try {
      await stockAPI.addMovement({
        produit_id: product.id,
        type: formData.type,
        quantite: formData.quantite,
        commentaire: formData.commentaire || undefined,
      });
      
      toast.success('Mouvement de stock enregistré avec succès');
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du mouvement');
    } finally {
      setLoading(false);
    }
  };

  const getNewStock = () => {
    const currentStock = product.quantite_stock;
    const quantity = formData.quantite;
    
    switch (formData.type) {
      case 'entree':
      case 'retour':
        return currentStock + quantity;
      case 'sortie':
      case 'perte':
        return Math.max(0, currentStock - quantity);
      default:
        return currentStock;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Info */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-white mb-2">Informations produit</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Stock actuel:</span>
            <span className="text-white font-medium ml-2">{product.quantite_stock}</span>
          </div>
          <div>
            <span className="text-gray-400">Seuil minimum:</span>
            <span className="text-white font-medium ml-2">{product.seuil_min}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Type de mouvement *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          required
        >
          <option value="entree">Entrée (réception de marchandise)</option>
          <option value="sortie">Sortie (vente, prélèvement)</option>
          <option value="retour">Retour (retour client)</option>
          <option value="perte">Perte (casse, vol, péremption)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Quantité *
        </label>
        <input
          type="number"
          min="1"
          max={formData.type === 'sortie' || formData.type === 'perte' ? product.quantite_stock : undefined}
          value={formData.quantite}
          onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          required
        />
        {(formData.type === 'sortie' || formData.type === 'perte') && (
          <p className="text-sm text-gray-400 mt-1">
            Maximum disponible: {product.quantite_stock}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Commentaire
        </label>
        <textarea
          value={formData.commentaire}
          onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
          className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
          rows={3}
          placeholder="Commentaire optionnel..."
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-white mb-2">Aperçu</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Stock actuel:</span>
            <span className="text-white font-medium ml-2">{product.quantite_stock}</span>
          </div>
          <div>
            <span className="text-gray-400">Nouveau stock:</span>
            <span className={`font-medium ml-2 ${
              getNewStock() <= product.seuil_min ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {getNewStock()}
            </span>
          </div>
        </div>
        {getNewStock() <= product.seuil_min && (
          <div className="mt-2 text-yellow-400 text-sm">
            ⚠️ Le stock sera en dessous du seuil minimum après ce mouvement
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          Enregistrer le mouvement
        </Button>
      </div>
    </form>
  );
};

export default StockMovementForm;