import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import UserList from './pages/Users/UserList';
import CategoryList from './pages/Categories/CategoryList';
import ProductList from './pages/Products/ProductList';
import SalesList from './pages/Sales/SalesList';
import StockList from './pages/Stock/StockList';
import ValidationsList from './pages/Validations/ValidationsList';
import ReportsList from './pages/Reports/ReportsList';
import SettingsList from './pages/Settings/SettingsList';
import StockReports from './pages/Reports/StockReports';
import MySales from './pages/Sales/MySales';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <UserList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="categories" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'stock_manager']}>
                    <CategoryList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="products" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'stock_manager', 'cashier']}>
                    <ProductList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="sales" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'cashier']}>
                    <SalesList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="stock" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'stock_manager']}>
                    <StockList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="validations" 
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <ValidationsList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="reports" 
                element={
                  <ReportsList />
                } 
              />
              <Route 
                path="stock-reports" 
                element={
                  <ProtectedRoute requiredRole={['stock_manager']}>
                    <StockReports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="my-sales" 
                element={
                  <ProtectedRoute requiredRole={['cashier']}>
                    <MySales />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <SettingsList />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F9FAFB',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F9FAFB',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;