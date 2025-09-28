import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './contexte/AuthProvider';
import DashboardProvider from './contexte/DashboardContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthLayout from './components/layouts/AuthLayout';
import FormConnexion from './components/FormConnexion';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import DashboardSuperAdmin from './components/DashboardSuperAdmin';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCaissier from './components/DashboardCaissier';

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <DashboardProvider>
            <Toaster
              position="top-right"
              reverseOrder={true}
              gutter={16}
              containerClassName=""
              containerStyle={{
                top: 40
              }}
              toastOptions={{
                duration: 3000,
                className: '',
                style: {
                  background: '#fff',
                  color: '#363636',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: '14px',
                  maxWidth: '360px',
                },
                success: {
                  style: {
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d'
                  },
                  iconTheme: {
                    primary: '#15803d',
                    secondary: '#f0fdf4',
                  }
                },
                error: {
                  style: {
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c'
                  },
                  iconTheme: {
                    primary: '#b91c1c',
                    secondary: '#fef2f2',
                  }
                },
                loading: {
                  style: {
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    color: '#374151'
                  }
                }
              }}
            />
            <Routes>
              <Route 
                path="/" 
                element={
                  <AuthLayout title="Connectez-vous" subtitle="Entrez votre email et mot de passe pour accéder à votre compte">
                    <FormConnexion />
                  </AuthLayout>
                } 
              />
              <Route
                path="/dashboard-super-admin/*"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <DashboardSuperAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-admin/*"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard-caissier/*"
                element={
                  <ProtectedRoute allowedRoles={['CAISSIER']}>
                    <DashboardCaissier />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}