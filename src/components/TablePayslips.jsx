import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard as Edit, Trash2, Eye, Download, ListFilter as Filter, Search } from 'lucide-react';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { toast } from 'react-hot-toast';
import { updatePayslip, deletePayslip } from '../config/api.js';

const TablePayslips = ({ 
  data: propData, 
  onEdit, 
  onDelete, 
  onView,
  loading: propLoading,
  onRefresh 
}) => {
  const { payslips: contextPayslips, loading: contextLoading, fetchPayslips } = useDashboard();
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ 
    statut: '', 
    search: '',
    payRunId: '',
    dateDebut: '',
    dateFin: ''
  });
  const [sortBy, setSortBy] = useState('dateCreation');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const safePayslips = propData || contextPayslips || [];
  const loading = propLoading !== undefined ? propLoading : contextLoading;
  const itemsPerPage = 10;

  useEffect(() => {
    if (!propData && fetchPayslips) {
      fetchPayslips();
    }
  }, [propData, fetchPayslips]);

  // Filtrage et tri
  const filteredPayslips = safePayslips
    .filter((payslip) => {
      return (
        (!filters.statut || payslip.statut === filters.statut) &&
        (!filters.search || 
          payslip.employe?.nomComplet?.toLowerCase().includes(filters.search.toLowerCase()) ||
          payslip.id.toString().includes(filters.search)
        ) &&
        (!filters.payRunId || payslip.payRunId.toString() === filters.payRunId) &&
        (!filters.dateDebut || new Date(payslip.dateCreation) >= new Date(filters.dateDebut)) &&
        (!filters.dateFin || new Date(payslip.dateCreation) <= new Date(filters.dateFin))
      );
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'employe') {
        aValue = a.employe?.nomComplet || '';
        bValue = b.employe?.nomComplet || '';
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayslips = filteredPayslips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayslips.length / itemsPerPage);

  const handleEdit = (payslip) => {
    if (onEdit) {
      onEdit(payslip, 'payslip');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bulletin ?')) {
      try {
        await deletePayslip(id, token);
        toast.success('Bulletin supprimé avec succès');
        if (onRefresh) onRefresh();
        else if (fetchPayslips) fetchPayslips();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleView = (payslip) => {
    if (onView) {
      onView(payslip);
    }
  };

  const handleDownload = async (payslip) => {
    try {
      // Logique de téléchargement PDF
      toast.success('Téléchargement du bulletin en cours...');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getStatutBadge = (statut) => {
    const config = {
      'EN_ATTENTE': { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: '⏳',
        label: 'En Attente'
      },
      'PARTIEL': { 
        className: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: '⚠️',
        label: 'Partiel'
      },
      'PAYE': { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        icon: '✅',
        label: 'Payé'
      }
    };

    const { className, icon, label } = config[statut] || config['EN_ATTENTE'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${className} flex items-center gap-1`}>
        <span>{icon}</span>
        {label}
      </span>
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des bulletins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header avec filtres */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Bulletins de Paie</h3>
            <p className="text-sm text-gray-600">
              {filteredPayslips.length} bulletin{filteredPayslips.length > 1 ? 's' : ''} trouvé{filteredPayslips.length > 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              />
            </div>
            
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En Attente</option>
              <option value="PARTIEL">Partiel</option>
              <option value="PAYE">Payé</option>
            </select>

            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              placeholder="Date début"
            />

            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              placeholder="Date fin"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  ID
                  {sortBy === 'id' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('employe')}
              >
                <div className="flex items-center gap-1">
                  Employé
                  {sortBy === 'employe' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('salaireBrut')}
              >
                <div className="flex items-center gap-1">
                  Salaire Brut
                  {sortBy === 'salaireBrut' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('salaireNet')}
              >
                <div className="flex items-center gap-1">
                  Salaire Net
                  {sortBy === 'salaireNet' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('statut')}
              >
                <div className="flex items-center gap-1">
                  Statut
                  {sortBy === 'statut' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPayslips.map((payslip, index) => (
              <motion.tr
                key={payslip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{payslip.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {payslip.employe?.nomComplet?.charAt(0) || 'E'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payslip.employe?.nomComplet || 'Employé inconnu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payslip.employe?.poste || 'Poste non défini'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {payslip.payRun?.type || 'MENSUELLE'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payslip.payRun?.dateDebut && payslip.payRun?.dateFin ? (
                        `${new Date(payslip.payRun.dateDebut).toLocaleDateString('fr-FR')} - ${new Date(payslip.payRun.dateFin).toLocaleDateString('fr-FR')}`
                      ) : (
                        'Période non définie'
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">
                    {(payslip.salaireBrut || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                  {payslip.deductions > 0 && (
                    <div className="text-xs text-red-600">
                      -{(payslip.deductions || 0).toLocaleString('fr-FR')} FCFA
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {(payslip.salaireNet || 0).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatutBadge(payslip.statut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(payslip)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(payslip)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors"
                      title="Télécharger PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {payslip.payRun?.statut === 'BROUILLON' && (
                      <>
                        <button
                          onClick={() => handleEdit(payslip)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payslip.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-600">
          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredPayslips.length)} sur {filteredPayslips.length} résultats
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && filteredPayslips.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bulletin trouvé</h3>
          <p className="text-gray-500">
            {filters.search || filters.statut || filters.dateDebut || filters.dateFin
              ? 'Aucun bulletin ne correspond à vos critères de recherche.'
              : 'Aucun bulletin de paie n\'a été créé pour le moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TablePayslips;