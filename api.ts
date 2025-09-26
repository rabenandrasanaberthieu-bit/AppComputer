import axios from 'axios';
import { User, Category, Product, Sale, StockMovement, Validation, DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for development
const mockUsers: User[] = [
  {
    id: 1,
    nom: 'Admin',
    prenom: 'Super',
    email: 'admin@system.com',
    role_id: 1,
    role: { id: 1, nom: 'admin', description: 'Administrateur système' },
    etat: 'actif',
    date_creation: '2024-01-01T00:00:00Z',
    dernier_login: new Date().toISOString(),
  },
  {
    id: 2,
    nom: 'Doe',
    prenom: 'John',
    email: 'stock@company.com',
    role_id: 2,
    role: { id: 2, nom: 'stock_manager', description: 'Gestionnaire de stock' },
    etat: 'actif',
    date_creation: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    nom: 'Smith',
    prenom: 'Jane',
    email: 'cashier@company.com',
    role_id: 3,
    role: { id: 3, nom: 'cashier', description: 'Caissier/Vendeur' },
    etat: 'actif',
    date_creation: '2024-01-01T00:00:00Z',
  },
];

const mockCategories: Category[] = [
  { id: 1, nom: 'Ordinateurs', description: 'PC et portables', etat: 'actif', cree_par: 1, date_creation: '2024-01-01' },
  { id: 2, nom: 'Accessoires', description: 'Périphériques et accessoires', etat: 'actif', cree_par: 1, date_creation: '2024-01-01' },
  { id: 3, nom: 'Imprimantes', description: 'Imprimantes et scanners', etat: 'actif', cree_par: 1, date_creation: '2024-01-01' },
];

const mockProducts: Product[] = [
  {
    id: 1,
    nom: 'Dell XPS 13',
    description: 'Ordinateur portable professionnel',
    prix_achat: 800,
    prix_vente: 1200,
    quantite_stock: 15,
    seuil_min: 5,
    categorie_id: 1,
    etat: 'actif',
    cree_par: 2,
    date_creation: '2024-01-01',
  },
  {
    id: 2,
    nom: 'Souris Logitech MX',
    description: 'Souris sans fil ergonomique',
    prix_achat: 45,
    prix_vente: 80,
    quantite_stock: 3,
    seuil_min: 10,
    categorie_id: 2,
    etat: 'actif',
    cree_par: 2,
    date_creation: '2024-01-01',
  },
];

export const authAPI = {
  login: async (email: string, password: string) => {
    // Mock authentication
    return new Promise<{ user: User; token: string }>((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'password123') {
          resolve({
            user,
            token: 'mock-jwt-token',
          });
        } else {
          reject(new Error('Email ou mot de passe incorrect'));
        }
      }, 1000);
    });
  },
};

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockUsers), 500));
  },
  
  create: async (userData: Partial<User>): Promise<User> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newUser = {
          id: Date.now(),
          ...userData,
          date_creation: new Date().toISOString(),
          etat: 'actif' as const,
        } as User;
        mockUsers.push(newUser);
        resolve(newUser);
      }, 500);
    });
  },
  
  update: async (id: number, userData: Partial<User>): Promise<User> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...userData };
          resolve(mockUsers[index]);
        }
      }, 500);
    });
  },
};

// ✅ CORRIGÉ: categoryAPI avec toutes les méthodes dans une seule déclaration
export const categoryAPI = {
  getAll: async (): Promise<Category[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCategories), 500));
  },
  
  create: async (categoryData: Partial<Category>): Promise<Category> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newCategory = {
          id: Date.now(),
          ...categoryData,
          date_creation: new Date().toISOString(),
          etat: 'actif' as const,
        } as Category;
        mockCategories.push(newCategory);
        resolve(newCategory);
      }, 500);
    });
  },

  // Méthodes ajoutées directement ici
  update: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          mockCategories[index] = { ...mockCategories[index], ...categoryData };
          resolve(mockCategories[index]);
        }
      }, 500);
    });
  },

  delete: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  requestDeletion: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },
};

// ✅ CORRIGÉ: productAPI avec toutes les méthodes dans une seule déclaration
export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockProducts), 500));
  },
  
  create: async (productData: Partial<Product>): Promise<Product> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newProduct = {
          id: Date.now(),
          ...productData,
          date_creation: new Date().toISOString(),
          etat: 'actif' as const,
        } as Product;
        mockProducts.push(newProduct);
        resolve(newProduct);
      }, 500);
    });
  },

  // Méthodes ajoutées directement ici
  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProducts[index] = { ...mockProducts[index], ...productData };
          resolve(mockProducts[index]);
        }
      }, 500);
    });
  },

  delete: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  requestDeletion: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },
};

export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalSales: 150,
          totalRevenue: 45000,
          totalProducts: mockProducts.length,
          lowStockCount: mockProducts.filter(p => p.quantite_stock <= p.seuil_min).length,
          todaySales: 12,
          todayRevenue: 3500,
        });
      }, 500);
    });
  },
};

// Additional API endpoints for new modules
export const stockAPI = {
  getMovements: async (): Promise<StockMovement[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const movements: StockMovement[] = [
          {
            id: 1,
            produit_id: 1,
            product: mockProducts[0],
            type: 'entree',
            quantite: 10,
            utilisateur_id: 2,
            user: mockUsers[1],
            date_mouvement: new Date().toISOString(),
            commentaire: 'Réception commande fournisseur',
          },
          {
            id: 2,
            produit_id: 2,
            product: mockProducts[1],
            type: 'sortie',
            quantite: 2,
            utilisateur_id: 3,
            user: mockUsers[2],
            date_mouvement: new Date(Date.now() - 86400000).toISOString(),
            commentaire: 'Vente client',
          },
        ];
        resolve(movements);
      }, 500);
    });
  },

  addMovement: async (movementData: Partial<StockMovement>): Promise<StockMovement> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newMovement = {
          id: Date.now(),
          ...movementData,
          date_mouvement: new Date().toISOString(),
        } as StockMovement;
        resolve(newMovement);
      }, 500);
    });
  },
};

export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const sales: Sale[] = [
          {
            id: 1,
            caissier_id: 3,
            cashier: mockUsers[2],
            total_ht: 1000,
            tva: 200,
            total_ttc: 1200,
            mode_paiement: 'carte',
            etat: 'valide',
            date_vente: new Date().toISOString(),
            details: [
              {
                id: 1,
                vente_id: 1,
                produit_id: 1,
                product: mockProducts[0],
                quantite: 1,
                prix_unitaire: 1200,
                total_ligne: 1200,
              },
            ],
          },
        ];
        resolve(sales);
      }, 500);
    });
  },

  create: async (saleData: any): Promise<Sale> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newSale = {
          id: Date.now(),
          caissier_id: 3,
          ...saleData,
          etat: 'valide',
          date_vente: new Date().toISOString(),
        } as Sale;
        resolve(newSale);
      }, 500);
    });
  },

  delete: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  requestDeletion: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },
};

export const validationAPI = {
  getAll: async (): Promise<Validation[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const validations: Validation[] = [
          {
            id: 1,
            type_objet: 'produit',
            objet_id: 1,
            action: 'suppression',
            status: 'en_attente',
            demande_par: 2,
            requester: mockUsers[1],
            date_demande: new Date().toISOString(),
          },
          {
            id: 2,
            type_objet: 'categorie',
            objet_id: 2,
            action: 'suppression',
            status: 'approuve',
            demande_par: 2,
            requester: mockUsers[1],
            valide_par: 1,
            validator: mockUsers[0],
            date_demande: new Date(Date.now() - 86400000).toISOString(),
            date_validation: new Date().toISOString(),
          },
        ];
        resolve(validations);
      }, 500);
    });
  },

  approve: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },

  reject: async (id: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 500));
  },
};

export const reportsAPI = {
  getReportData: async (type: string, startDate: string, endDate: string): Promise<any> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          type,
          startDate,
          endDate,
          data: {},
        });
      }, 500);
    });
  },

  exportReport: async (type: string, format: string, startDate: string, endDate: string): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Exporting ${type} report as ${format} from ${startDate} to ${endDate}`);
        resolve();
      }, 1000);
    });
  },
};

export const settingsAPI = {
  getAll: async (): Promise<any> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          company_name: 'IT Sales Manager',
          default_tax_rate: 20,
          currency: 'EUR',
          max_discount_percent: 10,
        });
      }, 500);
    });
  },

  update: async (settings: any): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Settings updated:', settings);
        resolve();
      }, 500);
    });
  },
};