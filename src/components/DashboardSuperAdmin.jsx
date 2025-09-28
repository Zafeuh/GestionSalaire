import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import KPICard from './KPICard';
import ChartComponent from './ChartComponent';
import TableEntreprises from './TableEntreprises';
import TableUsers from './TableUsers';
import TableEmployes from './TableEmployes';
import TablePayRuns from './TablePayRuns';
import TablePayslips from './TablePayslips';
import TablePaiements from './TablePaiements';
import ModalCRUD from './ModalCRUD';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { Users, DollarSign, TrendingUp, FileText, Clock, CheckCircle, AlertCircle, CreditCard, Building2, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createEntreprise, updateEntreprise, deleteEntreprise, createUser, updateUser, deleteUser, approvePayRun, closePayRun } from '../config/api.js';

export default function DashboardSuperAdmin() {
  const { token, logout } = useAuth();
  const {
    kpis,
    charts,
    entreprises,
    users,
    employes,
    payRuns,
    payslips,
    paiements,
    loading,
    error,
    modalOpen,
    modalType,
    modalEntityType,
    modalData,
    openModal,
    closeModal,
    refreshData,
    clearError,
  } = useDashboard();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Gestionnaires d'événements mémorisés
  const handleCreate = useCallback((entityType) => {
    openModal('create', entityType);
  }, [openModal]);

  const handleEdit = useCallback((data, entityType) => {
    openModal('update', entityType, data);
  }, [openModal]);

  const handleDelete = useCallback(async (id, entityType) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) return;

    try {
      let result;
      if (entityType === 'entreprise') {
        result = await deleteEntreprise(id, token);
      } else if (entityType === 'user') {
        result = await deleteUser(id, token);
      }
      toast.success('Élément supprimé avec succès');
      refreshData();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  }, [token, refreshData]);

  const handleModalSuccess = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Gestion des erreurs avec auto-clear
  useEffect(() => {
    if (error) {
      toast.error(error);
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Chargement initial des données
  useEffect(() => {
    refreshData();
  }, []);

  // Données des KPIs
  const employesInactifs = (kpis?.totalEmployes || 0) - (kpis?.employesActifs || 0);
  const kpiData = [
    { 
      icon: Building2, 
      title: 'Entreprises', 
      value: entreprises?.length || 0,
      color: 'blue',
      trend: '+12%'
    },
    { 
      icon: Users, 
      title: 'Employés Totaux', 
      value: kpis?.totalEmployes || 0,
      color: 'sky',
      trend: '+8%'
    },
    { 
      icon: UserCheck, 
      title: 'Employés Actifs', 
      value: kpis?.employesActifs || 0,
      color: 'green',
      trend: '+5%'
    },
    { 
      icon: AlertCircle, 
      title: 'Employés Inactifs', 
      value: employesInactifs,
      color: 'orange',
      trend: '-2%'
    },
    { 
      icon: DollarSign, 
      title: 'Masse Salariale', 
      value: kpis?.masseSalarialeTotale || 0, 
      unit: ' FCFA',
      color: 'emerald',
      trend: '+15%'
    },
    { 
      icon: FileText, 
      title: 'PayRuns Brouillon', 
      value: kpis?.payRunsBrouillon || 0,
      color: 'yellow',
      trend: '0%'
    },
    { 
      icon: Clock, 
      title: 'Paiements en Attente', 
      value: kpis?.paiementsEnAttente || 0,
      color: 'red',
      trend: '-10%'
    },
    { 
      icon: CreditCard, 
      title: 'Paiements Payés', 
      value: kpis?.paiementsPaye || 0,
      color: 'green',
      trend: '+25%'
    },
  ];

  // Données des graphiques
  const salaryDistributionData = charts?.salaryDistribution || [];
  const employeesByPosteData = charts?.employeesByPoste || [];
  const paymentsByMonthData = charts?.paymentsByMonth || [];
  const paymentsByTypeData = charts?.paymentsByType || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Vue d'ensemble</h2>
                <p className="text-gray-600">Tableau de bord administrateur principal</p>
              </div>
              <button
                onClick={refreshData}
                className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Actualisation...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Actualiser
                  </>
                )}
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <KPICard
                    icon={kpi.icon}
                    title={kpi.title}
                    value={kpi.value}
                    unit={kpi.unit}
                    color={kpi.color}
                    trend={kpi.trend}
                  />
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Distribution des Salaires */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ChartComponent 
                  type="bar" 
                  data={salaryDistributionData}
                  colors={['#0ea5e9', '#06b6d4', '#0891b2']}
                  title="Distribution des Salaires"
                  valueSuffix=" employés"
                  height={350}
                  gradient={true}
                />
              </motion.div>

              {/* Employés par Poste */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ChartComponent 
                  type="pie" 
                  data={employeesByPosteData}
                  colors={['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']}
                  title="Répartition par Poste"
                  height={350}
                  gradient={true}
                />
              </motion.div>

              {/* Évolution des Paiements */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ChartComponent 
                  type="area" 
                  data={paymentsByMonthData}
                  colors={['#0ea5e9']}
                  title="Évolution des Paiements (6 mois)"
                  valueSuffix=" FCFA"
                  height={350}
                  gradient={true}
                />
              </motion.div>

              {/* Types de Paiements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <ChartComponent 
                  type="bar" 
                  data={paymentsByTypeData}
                  colors={['#10b981', '#f59e0b', '#8b5cf6', '#ef4444']}
                  title="Types de Paiements"
                  height={350}
                  gradient={true}
                />
              </motion.div>
            </div>

            {/* Tableau des dernières activités */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Dernières Activités</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(paiements || []).slice(0, 5).map((paiement, index) => (
                      <tr key={paiement.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {paiement.payslip?.employe?.nomComplet?.charAt(0) || 'E'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {paiement.payslip?.employe?.nomComplet || 'Employé inconnu'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Paiement {paiement.type || 'VIREMENT'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {(parseFloat(paiement.montant) || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {paiement.datePaiement ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Payé
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        );

      case 'entreprises':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TableEntreprises
              data={entreprises}
              onCreate={() => handleCreate('entreprise')}
              onEdit={(data) => handleEdit(data, 'entreprise')}
              onDelete={(id) => handleDelete(id, 'entreprise')}
              loading={loading}
              onRefresh={refreshData}
            />
          </motion.div>
        );

      case 'users':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TableUsers
              data={users}
              onCreate={() => handleCreate('user')}
              onEdit={(data) => handleEdit(data, 'user')}
              onDelete={(id) => handleDelete(id, 'user')}
              loading={loading}
              onRefresh={refreshData}
            />
          </motion.div>
        );

      case 'employes':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Employés</h3>
                <button
                  onClick={() => handleCreate('employe')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ajouter Employé
                </button>
              </div>
              <TableEmployes
                data={employes}
                onEdit={(data) => handleEdit(data, 'employe')}
                onDelete={(id) => handleDelete(id, 'employe')}
                loading={loading}
                onRefresh={refreshData}
              />
            </div>
          </motion.div>
        );

      case 'payruns':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Cycles de Paie</h3>
                <button
                  onClick={() => handleCreate('payrun')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-lg transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Nouveau Cycle
                </button>
              </div>
              <TablePayRuns
                data={payRuns}
                onEdit={(data) => handleEdit(data, 'payrun')}
                onDelete={(id) => handleDelete(id, 'payrun')}
                onApprove={(id) => approvePayRun(id, token).then(refreshData)}
                onClose={(id) => closePayRun(id, token).then(refreshData)}
                loading={loading}
                onRefresh={refreshData}
              />
            </div>
          </motion.div>
        );

      case 'payslips':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Bulletins de Paie</h3>
              </div>
              <TablePayslips
                data={payslips}
                onEdit={(data) => handleEdit(data, 'payslip')}
                onDelete={(id) => handleDelete(id, 'payslip')}
                loading={loading}
                onRefresh={refreshData}
              />
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h3>
                <button
                  onClick={() => handleCreate('paiement')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg transition-all duration-200"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Enregistrer Paiement
                </button>
              </div>
              <TablePaiements
                data={paiements}
                onEdit={(data) => handleEdit(data, 'paiement')}
                onDelete={(id) => handleDelete(id, 'paiement')}
                loading={loading}
                onRefresh={refreshData}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-sky-50">
      {/* Sidebar */}
      <Sidebar 
        onSectionChange={setActiveSection} 
        activeSection={activeSection}
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <Header 
          onToggleSidebar={handleToggleSidebar}
          onLogout={logout}
        />

        {/* Main */}
        <main className="flex-1 p-8 mt-16 overflow-y-auto">
          {renderSection()}
        </main>
      </div>

      {/* Modal CRUD */}
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