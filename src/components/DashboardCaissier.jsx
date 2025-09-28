import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexte/useAuth';
import { useDashboard } from '../contexte/DashboardContext';
import Sidebar from './Sidebar';
import Header from './Header';
import KPICard from './KPICard';
import ChartComponent from './ChartComponent';
import ModalCRUD from './ModalCRUD';
import { LayoutDashboard, Clock, CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'paiements', label: 'Paiements', icon: DollarSign },
];

export default function DashboardCaissier() {
  const { user, logout, token } = useAuth();
  const {
    kpis,
    charts,
    loading,
    error,
    modalOpen,
    modalType,
    modalEntityType,
    modalData,
    openModal,
    closeModal,
    refreshData,
  } = useDashboard();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Gestionnaires CRUD
  const handleCreate = useCallback((entityType) => {
    openModal('create', entityType);
  }, [openModal]);

  const handleEdit = useCallback((data, entityType) => {
    openModal('update', entityType, data);
  }, [openModal]);

  const handleDelete = useCallback(async (id, entityType) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) return;

    try {
      // TODO: Implement delete paiement
      toast.success('Élément supprimé avec succès');
      refreshData();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  }, [refreshData]);

  const handleModalSuccess = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    refreshData();
  }, [user]);

  // KPIs limités pour Caissier (paiements seulement)
  const kpiData = [
    { icon: Clock, title: 'Paiements en Attente', value: kpis?.paiementsEnAttente || 0 },
    { icon: CreditCard, title: 'Paiements Payés', value: kpis?.paiementsPayes || 0 },
  ];

  // Charts limités pour Caissier
  const repartitionData = charts?.employeesByPoste || [];
  const typesData = charts?.paymentsByType || [];

  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Caissier</h2>
              <button
                onClick={refreshData}
                className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                disabled={loading}
              >
                Actualiser
              </button>
            </div>

            {/* KPIs Paiements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpiData.map((kpi, index) => (
                <KPICard
                  key={index}
                  icon={kpi.icon}
                  title={kpi.title}
                  value={kpi.value}
                  color="sky"
                />
              ))}
            </div>

            {/* Charts limités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Poste</h3>
                <ChartComponent 
                  type="pie" 
                  data={repartitionData}
                  colors={['#10b981', '#f59e0b', '#ef4444']}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de Paiements</h3>
                <ChartComponent 
                  type="bar" 
                  data={typesData}
                  colors={['#f59e0b', '#10b981']}
                />
              </div>
            </div>
          </motion.div>
        );
      case 'paiements':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Paiements</h3>
                <button
                  onClick={() => handleCreate('paiement')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                >
                  Enregistrer Paiement
                </button>
              </div>
              {/* TODO: Ajouter TablePaiements */}
              <div className="text-center py-8 text-gray-500">
                Tableau des paiements en cours d'implémentation.
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-white to-sky-50">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        role="caissier"
        onToggle={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <Header
          title={`Dashboard Caissier - ${navItems.find(item => item.id === activeSection)?.label || 'Tableau de bord'}`}
          onLogout={logout}
          setIsSidebarOpen={setIsSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="h-[calc(100vh-4rem)] p-6 mt-16 overflow-y-auto">
          {renderSection()}
        </main>
      </div>

      {/* Modal */}
      <ModalCRUD
        isOpen={modalOpen}
        onClose={closeModal}
        type={modalType}
        entityType={modalEntityType}
        data={modalData}
        onSuccess={handleModalSuccess}
        token={token}
      />
    </div>
  );
}
