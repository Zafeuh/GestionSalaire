import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import KPICard from './KPICard';
import ChartComponent from './ChartComponent';
import TableEntreprises from './TableEntreprises';
import TableUsers from './TableUsers';
import ModalCRUD from './ModalCRUD';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { Users, DollarSign, TrendingUp, FileText, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createEntreprise, updateEntreprise, deleteEntreprise, createUser, updateUser, deleteUser, approvePayRun, closePayRun } from '../config/api.js';

export default function DashboardSuperAdmin() {
  const { token } = useAuth();
  const {
    kpis,
    charts,
    entreprises,
    users,
    employes,
    payRuns,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const ITEMS_PER_PAGE = 5;

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

  const handleModalSuccess = useCallback((result) => {
    refreshData();
  }, [refreshData]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Gestion des erreurs
  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Chargement initial des données
  useEffect(() => {
    refreshData();
  }, []); // Exécute uniquement au montage du composant

  // Données des KPIs - Ajusté pour matcher API et calculs
  const employesInactifs = (kpis?.totalEmployes || 0) - (kpis?.employesActifs || 0);
  const kpiData = [
    { icon: Users, title: 'Employés Totaux', value: kpis?.totalEmployes || 0 },
    { icon: Users, title: 'Employés Actifs', value: kpis?.employesActifs || 0 },
    { icon: Users, title: 'Employés Inactifs', value: employesInactifs },
    { icon: DollarSign, title: 'Masse Salariale Totale', value: kpis?.masseSalarialeTotale || 0, unit: ' FCFA' },
    { icon: FileText, title: 'PayRuns Brouillon', value: kpis?.payRunsBrouillon || 0 },
    { icon: Clock, title: 'Paiements en Attente', value: kpis?.paiementsEnAttente || 0 },
    { icon: CreditCard, title: 'Paiements Payés', value: kpis?.paiementsPayes || 0 },
  ];

  // Utiliser données réelles du context, sans fallback démo
  const evolutionMasseData = charts?.paymentsByMonth || [];
  const repartitionEmployesData = charts?.employeesByPoste || [];
  const statutsPayRunsData = charts?.paymentsByType || [];
  const safePayRuns = payRuns || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-white to-sky-50">
      {/* Sidebar */}
      <Sidebar onSectionChange={setActiveSection} activeSection={activeSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Main */}
        <main className="h-[calc(100vh-4rem)] p-6 mt-16 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col space-y-6"
          >
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
                  <button
                    onClick={refreshData}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </>
                    ) : (
                      'Actualiser'
                    )}
                  </button>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                  {kpiData.map((kpi, index) => (
                    <KPICard
                      key={index}
                      icon={kpi.icon}
                      title={kpi.title}
                      value={kpi.value}
                      unit={kpi.unit}
                      color="sky"
                    />
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6 flex-1 min-h-[500px]">
                  {/* Évolution Paiements */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Paiements</h3>
                    <ChartComponent 
                      type="line" 
                      data={evolutionMasseData}
                      colors={['#0ea5e9']}
                      valueSuffix=" FCFA"
                      title="Évolution sur 6 mois"
                    />
                  </div>

                  {/* Répartition Employés par Poste */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Employés par Poste</h3>
                    <ChartComponent 
                      type="pie" 
                      data={repartitionEmployesData}
                      colors={['#0ea5e9', '#10b981', '#f59e0b']}
                    />
                  </div>

                  {/* Types de Paiements */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de Paiements</h3>
                    <ChartComponent 
                      type="bar" 
                      data={statutsPayRunsData}
                      colors={['#f59e0b', '#10b981', '#ef4444']}
                    />
                  </div>

                  {/* Prochains Paiements - Utiliser données réelles si disponibles */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochains Paiements</h3>
                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employé
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
                          {safePayRuns.slice(0, 5).map((payRun) => (
                            <tr key={payRun.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payRun.nomEmploye || `Employé ${payRun.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payRun.montant || '150,000'} FCFA
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payRun.dateFin).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  payRun.statut === 'BROUILLON' ? 'bg-yellow-100 text-yellow-800' :
                                  payRun.statut === 'APPROUVE' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {payRun.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Entreprises Section */}
            {activeSection === 'entreprises' && (
              <TableEntreprises
                data={entreprises}
                onCreate={() => handleCreate('entreprise')}
                onEdit={(data) => handleEdit(data, 'entreprise')}
                onDelete={(id) => handleDelete(id, 'entreprise')}
                loading={loading}
                onRefresh={refreshData}
              />
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <TableUsers
                data={users}
                onCreate={() => handleCreate('user')}
                onEdit={(data) => handleEdit(data, 'user')}
                onDelete={(id) => handleDelete(id, 'user')}
                loading={loading}
                onRefresh={refreshData}
              />
            )}

            {/* Employés Section */}
            {activeSection === 'employes' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des Employés</h3>
                  <button
                    onClick={() => handleCreate('employe')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                  >
                    Ajouter Employé
                  </button>
                </div>
                <TableEmployes
                  data={employes || []}
                  onEdit={(data) => handleEdit(data, 'employe')}
                  onDelete={(id) => handleDelete(id, 'employe')}
                  loading={loading}
                  onRefresh={refreshData}
                />
              </div>
            )}

            {/* PayRuns Section */}
            {activeSection === 'payruns' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des Cycles de Paie</h3>
                  <button
                    onClick={() => handleCreate('payrun')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                  >
                    Nouveau Cycle
                  </button>
                </div>
                <TablePayRuns
                  data={payRuns || []}
                  onEdit={(data) => handleEdit(data, 'payrun')}
                  onDelete={(id) => handleDelete(id, 'payrun')}
                  onApprove={(id) => approvePayRun(id, token).then(refreshData)}
                  onClose={(id) => closePayRun(id, token).then(refreshData)}
                  loading={loading}
                  onRefresh={refreshData}
                />
              </div>
            )}

            {/* Payslips Section */}
            {activeSection === 'payslips' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Bulletins de Paie</h3>
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Bulletins gérés via PayRuns. Utilisez la section PayRuns pour générer automatiquement.</p>
                </div>
              </div>
            )}

            {/* Paiements Section */}
            {activeSection === 'paiements' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des Paiements</h3>
                  <button
                    onClick={() => handleCreate('paiement')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100"
                  >
                    Enregistrer Paiement
                  </button>
                </div>
                {/* TODO: Implémenter TablePaiements si disponible */}
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Tableau des paiements à implémenter.</p>
                </div>
              </div>
            )}
          </motion.div>
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
      />
    </div>
  );
}