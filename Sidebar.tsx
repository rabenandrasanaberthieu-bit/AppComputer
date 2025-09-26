import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hop as Home, Users, Package, ShoppingCart, ChartBar as BarChart3, Settings, SquareCheck as CheckSquare, Archive, Tag, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
    ];

    if (user?.role?.nom === 'admin') {
      return [
        ...baseItems,
        { icon: Users, label: 'Utilisateurs', path: '/users' },
        { icon: Tag, label: 'Catégories', path: '/categories' },
        { icon: Package, label: 'Produits', path: '/products' },
        { icon: ShoppingCart, label: 'Ventes', path: '/sales' },
        { icon: Archive, label: 'Stock', path: '/stock' },
        { icon: CheckSquare, label: 'Validations', path: '/validations' },
        { icon: BarChart3, label: 'Rapports', path: '/reports' },
        { icon: Settings, label: 'Paramètres', path: '/settings' },
      ];
    }

    if (user?.role?.nom === 'stock_manager') {
      return [
        ...baseItems,
        { icon: Tag, label: 'Catégories', path: '/categories' },
        { icon: Package, label: 'Produits', path: '/products' },
        { icon: Archive, label: 'Stock', path: '/stock' },
        { icon: BarChart3, label: 'Rapports Stock', path: '/stock-reports' },
      ];
    }

    if (user?.role?.nom === 'cashier') {
      return [
        ...baseItems,
        { icon: ShoppingCart, label: 'Ventes', path: '/sales' },
        { icon: Package, label: 'Produits', path: '/products', readOnly: true },
        { icon: BarChart3, label: 'Mes Ventes', path: '/my-sales' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-red-500">IT Sales Manager</h1>
        <p className="text-sm text-gray-400 mt-1">
          {user?.prenom} {user?.nom}
        </p>
        <p className="text-xs text-red-400 capitalize">
          {user?.role?.nom?.replace('_', ' ')}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;