import React, { useState, useEffect } from 'react';
import { Save, Settings, Database, Shield, Bell, Palette, Globe } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { settingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SettingsList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    company_name: 'IT Sales Manager',
    company_address: '',
    company_phone: '',
    company_email: '',
    
    // Tax & Currency
    default_tax_rate: 20,
    currency: 'EUR',
    currency_symbol: '€',
    
    // Sales Settings
    max_discount_percent: 10,
    enable_stock_alerts: true,
    low_stock_threshold: 5,
    
    // System Settings
    auto_backup: true,
    backup_frequency: 'daily',
    session_timeout: 60,
    
    // Notifications
    email_notifications: true,
    stock_alerts: true,
    sales_notifications: false,
    
    // Appearance
    theme: 'dark',
    primary_color: '#ef4444',
    language: 'fr',
  });

  // Only allow admin access
  if (user?.role?.nom !== 'admin') {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Accès refusé</h2>
        <p className="text-gray-400">Seuls les administrateurs peuvent accéder aux paramètres.</p>
      </div>
    );
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.getAll();
      setSettings({ ...settings, ...data });
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Paramètres système</h1>
        <Button onClick={handleSave} loading={loading}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card title="Informations générales">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adresse
              </label>
              <textarea
                value={settings.company_address}
                onChange={(e) => handleInputChange('company_address', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.company_phone}
                  onChange={(e) => handleInputChange('company_phone', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => handleInputChange('company_email', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tax & Currency */}
        <Card title="Taxes et devise">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taux de TVA par défaut (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.default_tax_rate}
                onChange={(e) => handleInputChange('default_tax_rate', parseFloat(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Devise
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                  <option value="GBP">Livre Sterling (GBP)</option>
                  <option value="XOF">Franc CFA (XOF)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Symbole
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Sales Settings */}
        <Card title="Paramètres de vente">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Remise maximale autorisée (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.max_discount_percent}
                onChange={(e) => handleInputChange('max_discount_percent', parseInt(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Seuil de stock bas
              </label>
              <input
                type="number"
                min="0"
                value={settings.low_stock_threshold}
                onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enable_stock_alerts"
                checked={settings.enable_stock_alerts}
                onChange={(e) => handleInputChange('enable_stock_alerts', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="enable_stock_alerts" className="text-sm text-gray-300">
                Activer les alertes de stock
              </label>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card title="Paramètres système">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Timeout de session (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={settings.session_timeout}
                onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fréquence de sauvegarde
              </label>
              <select
                value={settings.backup_frequency}
                onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto_backup"
                checked={settings.auto_backup}
                onChange={(e) => handleInputChange('auto_backup', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="auto_backup" className="text-sm text-gray-300">
                Sauvegarde automatique
              </label>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="email_notifications"
                checked={settings.email_notifications}
                onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="email_notifications" className="text-sm text-gray-300">
                Notifications par email
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="stock_alerts"
                checked={settings.stock_alerts}
                onChange={(e) => handleInputChange('stock_alerts', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="stock_alerts" className="text-sm text-gray-300">
                Alertes de stock
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sales_notifications"
                checked={settings.sales_notifications}
                onChange={(e) => handleInputChange('sales_notifications', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="sales_notifications" className="text-sm text-gray-300">
                Notifications de vente
              </label>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card title="Apparence">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Thème
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="auto">Automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Couleur principale
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-12 h-10 bg-gray-900 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={loadSettings}>
          Annuler
        </Button>
        <Button onClick={handleSave} loading={loading}>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};

export default SettingsList;