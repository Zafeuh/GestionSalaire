import React, { useState } from 'react';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { Edit, Trash2, Check, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createPayRun, updatePayRun, deletePayRun, approvePayRun, closePayRun } from '../config/api.js';

const TablePayRuns = ({ data: propData, onRefresh, ...props }) => {
  const { payRuns: contextPayRuns, loading, fetchPayRuns } = useDashboard();
  const safePayRuns = propData || contextPayRuns || [];
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', statut: '' });
  const itemsPerPage = 10;

  const filteredPayRuns = safePayRuns.filter((payRun) => {
    return (
      (!filters.type || payRun.type === filters.type) &&
      (!filters.statut || payRun.statut === filters.statut)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayRuns = filteredPayRuns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayRuns.length / itemsPerPage);

  const handleEdit = (payRun) => {
    useDashboard().openModal('edit', 'payrun', payRun);
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce PayRun ?')) {
      try {
        await deletePayRun(id, token);
        toast.success('PayRun supprimé avec succès');
        fetchPayRuns();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await approvePayRun(id, token);
      toast.success('PayRun approuvé avec succès');
      fetchPayRuns();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClose = async (id) => {
    try {
      await closePayRun(id, token);
      toast.success('PayRun clôturé avec succès');
      fetchPayRuns();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatutBadge = (statut) => {
    let className, icon;
    switch (statut) {
      case 'BROUILLON':
        className = 'bg-blue-100 text-blue-800';
        icon = <Check className="h-3 w-3" />;
        break;
      case 'APPROUVE':
        className = 'bg-green-100 text-green-800';
        icon = <Check className="h-3 w-3" />;
        break;
      case 'CLOTURE':
        className = 'bg-yellow-100 text-yellow-800';
        icon = <Lock className="h-3 w-3" />;
        break;
      default:
        className = 'bg-gray-100 text-gray-800';
        icon = null;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${className}`}>
        {icon}
        {statut}
      </span>
    );
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (!safePayRuns.length) return <div className="text-center py-4">Aucun PayRun trouvé.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Contrôles supérieurs */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="text-lg font-semibold text-gray-900">Liste des PayRuns</h3>
        <button
          onClick={() => useDashboard().openModal('create', 'payrun')}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          Nouveau PayRun
        </button>
      </div>
      {/* Filtres */}
      {/* Filtres */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Tous les types</option>
            <option value="MENSUELLE">Mensuelle</option>
            <option value="HEBDOMADAIRE">Hebdomadaire</option>
          </select>
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="APPROUVE">Approuvé</option>
            <option value="CLOTURE">Clôturé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPayRuns.map((payRun) => (
              <tr key={payRun.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payRun.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payRun.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payRun.dateDebut).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payRun.dateFin).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatutBadge(payRun.statut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {payRun.statut === 'BROUILLON' && (
                    <>
                      <button onClick={() => handleEdit(payRun)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(payRun.id)} className="text-red-600 hover:text-red-900 mr-4">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleApprove(payRun.id)} className="text-green-600 hover:text-green-900 mr-4">
                        Approuver
                      </button>
                    </>
                  )}
                  {payRun.statut === 'APPROUVE' && (
                    <>
                      <button onClick={() => handleClose(payRun.id)} className="text-yellow-600 hover:text-yellow-900">
                        Clôturer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
        <div className="text-sm text-gray-600">
          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredPayRuns.length)} sur {filteredPayRuns.length} résultats
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg">Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePayRuns;
