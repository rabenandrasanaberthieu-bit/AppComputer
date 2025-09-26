import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Sale } from '../../types';

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would generate and download a PDF invoice
    console.log('Download PDF for sale:', sale.id);
  };

  const getPaymentLabel = (mode: string) => {
    switch (mode) {
      case 'cash': return 'Espèces';
      case 'carte': return 'Carte bancaire';
      case 'mobile_money': return 'Mobile Money';
      default: return mode;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">
            Vente #{sale.id.toString().padStart(6, '0')}
          </h3>
          <p className="text-gray-400">
            {new Date(sale.date_vente).toLocaleDateString('fr-FR')} à {new Date(sale.date_vente).toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Sale Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-3">Informations de vente</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Caissier:</span>
              <span className="text-white">
                {sale.cashier ? `${sale.cashier.prenom} ${sale.cashier.nom}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Mode de paiement:</span>
              <span className="text-white">{getPaymentLabel(sale.mode_paiement)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">État:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                sale.etat === 'valide' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {sale.etat === 'valide' ? 'Validé' : 'En attente'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-white mb-3">Montants</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Total HT:</span>
              <span className="text-white">{sale.total_ht.toFixed(2)} €</span>
            </div>
            {sale.remise && sale.remise > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Remise:</span>
                <span>-{sale.remise.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-300">TVA:</span>
              <span className="text-white">{sale.tva.toFixed(2)} €</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between text-lg font-medium">
                <span className="text-white">Total TTC:</span>
                <span className="text-red-400">{sale.total_ttc.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Details */}
      {sale.details && sale.details.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-3">Détails des produits</h4>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Prix unitaire
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {sale.details.map((detail, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-white">
                      {detail.product?.nom || `Produit #${detail.produit_id}`}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {detail.quantite}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {detail.prix_unitaire.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {detail.total_ligne.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default SaleDetails;