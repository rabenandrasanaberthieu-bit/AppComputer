export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role_id: number;
  role?: Role;
  etat: 'actif' | 'désactivé';
  date_creation: string;
  dernier_login?: string;
}

export interface Role {
  id: number;
  nom: 'admin' | 'stock_manager' | 'cashier';
  description: string;
}

export interface Category {
  id: number;
  nom: string;
  description: string;
  etat: 'actif' | 'en_attente_suppression' | 'supprimé';
  cree_par: number;
  date_creation: string;
  created_by?: User;
}

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix_achat: number;
  prix_vente: number;
  quantite_stock: number;
  seuil_min: number;
  categorie_id: number;
  category?: Category;
  image_url?: string;
  etat: 'actif' | 'en_attente_suppression' | 'supprimé';
  cree_par: number;
  date_creation: string;
  created_by?: User;
}

export interface StockMovement {
  id: number;
  produit_id: number;
  product?: Product;
  type: 'entree' | 'sortie' | 'retour' | 'perte';
  quantite: number;
  utilisateur_id: number;
  user?: User;
  date_mouvement: string;
  commentaire?: string;
}

export interface Sale {
  id: number;
  caissier_id: number;
  cashier?: User;
  total_ht: number;
  tva: number;
  remise?: number;
  total_ttc: number;
  mode_paiement: 'cash' | 'carte' | 'mobile_money';
  etat: 'valide' | 'en_attente_suppression' | 'supprimé';
  date_vente: string;
  details?: SaleDetail[];
}

export interface SaleDetail {
  id: number;
  vente_id: number;
  produit_id: number;
  product?: Product;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
}

export interface Validation {
  id: number;
  type_objet: 'user' | 'categorie' | 'produit' | 'vente';
  objet_id: number;
  action: 'suppression' | 'restauration';
  status: 'en_attente' | 'approuve' | 'rejete';
  demande_par: number;
  requester?: User;
  valide_par?: number;
  validator?: User;
  date_demande: string;
  date_validation?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  todaySales: number;
  todayRevenue: number;
}