import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Product } from '../../types';
import { productAPI, salesAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface SaleItem {
  produit_id: number;
  product?: Product;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [formData, setFormData] = useState({
    mode_paiement: 'cash' as 'cash' | 'carte' | 'mobile_money',
    remise: 0,
    tva: 20, // 20% VAT by default
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data.filter(p => p.etat === 'actif' && p.quantite_stock > 0));
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    }
  };

  const addItem = () => {
    if (products.length === 0) {
      toast.error('Aucun produit disponible');
      return;
    }

    const firstProduct = products[0];
    const newItem: SaleItem = {
      produit_id: firstProduct.id,
      product: firstProduct,
      quantite: 1,
      prix_unitaire: firstProduct.prix_vente,
      total_ligne: firstProduct.prix_vente,
    };

    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'produit_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        item.produit_id = product.id;
        item.product = product;
        item.prix_unitaire = product.prix_vente;
        item.total_ligne = item.quantite * product.prix_vente;
      }
    } else if (field === 'quantite') {
      const quantity = parseInt(value) || 1;
      const maxQuantity = item.product?.quantite_stock || 0;
      
      if (quantity > maxQuantity) {
        toast.error(`Stock insuffisant. Maximum: ${maxQuantity}`);
        return;
      }
      
      item.quantite = quantity;
      item.total_ligne = item.quantite * item.prix_unitaire;
    } else if (field === 'prix_unitaire') {
      item.prix_unitaire = parseFloat(value) || 0;
      item.total_ligne = item.quantite * item.prix_unitaire;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const total_ht = items.reduce((sum, item) => sum + item.total_ligne, 0);
    const remise_amount = (total_ht * formData.remise) / 100;
    const total_ht_after_discount = total_ht - remise_amount;
    const tva_amount = (total_ht_after_discount * formData.tva) / 100;
    const total_ttc = total_ht_after_discount + tva_amount;

    return {
      total_ht,
      remise_amount,
      total_ht_after_discount,
      tva_amount,
      total_ttc,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }

    const totals = calculateTotals();

    setLoading(true);
    try {
      const saleData = {
        total_ht: totals.total_ht_after_discount,
        tva: totals.tva_amount,
        remise: formData.remise > 0 ? totals.remise_amount : null,
        total_ttc: totals.total_ttc,
        mode_paiement: formData.mode_paiement,
        details: items.map(item => ({
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          total_ligne: item.total_ligne,
        })),
      };

      await salesAPI.create(saleData);
      toast.success('Vente enregistrée avec succès');
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Produits</h3>
          <Button type="button" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Produit
                  </label>
                  <select
                    value={item.produit_id}
                    onChange={(e) => updateItem(index, 'produit_id', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nom} (Stock: {product.quantite_stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Quantité
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'quantite', Math.max(1, item.quantite - 1))}
                      className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product?.quantite_stock || 1}
                      value={item.quantite}
                      onChange={(e) => updateItem(index, 'quantite', e.target.value)}
                      className="w-20 bg-gray-900 border border-gray-600 text-white px-2 py-1 rounded text-center focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateItem(index, 'quantite', Math.min(item.product?.quantite_stock || 1, item.quantite + 1))}
                      className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Prix unitaire (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.prix_unitaire}
                    onChange={(e) => updateItem(index, 'prix_unitaire', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Total ligne
                  </label>
                  <div className="text-white font-medium py-2">
                    {item.total_ligne.toFixed(2)} €
                  </div>
                </div>

                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Aucun produit ajouté. Cliquez sur "Ajouter un produit" pour commencer.
            </div>
          )}
        </div>
      </div>

      {/* Payment and totals */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mode de paiement
              </label>
              <select
                value={formData.mode_paiement}
                onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value as any })}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="cash">Espèces</option>
                <option value="carte">Carte bancaire</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Remise (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.remise}
                onChange={(e) => setFormData({ ...formData, remise: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                TVA (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tva}
                onChange={(e) => setFormData({ ...formData, tva: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-4">Récapitulatif</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Sous-total HT:</span>
                <span className="text-white">{totals.total_ht.toFixed(2)} €</span>
              </div>
              {formData.remise > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Remise ({formData.remise}%):</span>
                  <span>-{totals.remise_amount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Total HT:</span>
                <span className="text-white">{totals.total_ht_after_discount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">TVA ({formData.tva}%):</span>
                <span className="text-white">{totals.tva_amount.toFixed(2)} €</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-white">Total TTC:</span>
                  <span className="text-red-400">{totals.total_ttc.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading} disabled={items.length === 0}>
          Enregistrer la vente
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;