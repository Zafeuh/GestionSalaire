import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard as Edit, Trash2, Download, Eye, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { toast } from 'react-hot-toast';
import { updatePaiement, deletePaiement, generatePaiementPdf } from '../config/api.js';

const TablePaiements = ({ 
  data: propData, 
  onEdit, 
  onDelete, 
  onView,
  loading: propLoading,
  onRefresh 
}) => {
  const { paiements: contextPaiements, loading: contextLoading, fetchPaiements } = useDashboard();
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ 
    type: '', 
    search: '',
    dateDebut: '',
    dateFin: '',
    montantMin: '',
    montantMax: ''
  });
  const [sortBy, setSortBy] = useState('datePaiement');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const safePaiements = propData || contextPaiements || [];
  const loading = propLoading !== undefined ? propLoading : contextLoading;
  const itemsPerPage = 10;

  useEffect(() => {
    if (!propData && fetchPaiements) {
      fetchPaiements();
    }
  }, [propData, fetchPaiements]);

  // Filtrage et tri
  const filteredPaiements = safePaiements
    .filter((paiement) => {
      const montant = parseFloat(paiement.montant) || 0;
      const montantMin = parseFloat(filters.montantMin) || 0;
      const montantMax = parseFloat(filters.montantMax) || Infinity;
      
      return (
        (!filters.type || paiement.type === filters.type) &&
        (!filters.search || 
          paiement.payslip?.employe?.nomComplet?.toLowerCase().includes(filters.search.toLowerCase()) ||
          paiement.id.toString().includes(filters.search) ||
          paiement.notes?.toLowerCase().includes(filters.search.toLowerCase())
        ) &&
        (!filters.dateDebut || new Date(paiement.datePaiement) >= new Date(filters.dateDebut)) &&
        (!filters.dateFin || new Date(paiement.datePaiement) <= new Date(filters.dateFin)) &&
        (montant >= montantMin && montant <= montantMax)
      );
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'employe') {
        aValue = a.payslip?.employe?.nomComplet || '';
        bValue = b.payslip?.employe?.nomComplet || '';
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
  const currentPaiements = filteredPaiements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);

  const handleEdit = (paiement) => {
    if (onEdit) {
      onEdit(paiement, 'paiement');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      try {
        await deletePaiement(id, token);
        toast.success('Paiement supprimé avec succès');
        if (onRefresh) onRefresh();
        else if (fetchPaiements) fetchPaiements();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleView = (paiement) => {
    if (onView) {
      onView(paiement);
    }
  };

  const handleDownloadPdf = async (paiement) => {
    try {
      const blob = await generatePaiementPdf(paiement.id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `recu-paiement-${paiement.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Reçu téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du reçu');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ESPECES':
        return <Banknote className="h-4 w-4" />;
      case 'VIREMENT':
        return <CreditCard className="h-4 w-4" />;
      case 'ORANGE_MONEY':
      case 'WAVE':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type) => {
    const config = {
      'ESPECES': { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Espèces'
      },
      'VIREMENT': { 
        className: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Virement'
      },
      'ORANGE_MONEY': { 
        className: 'bg-orange-100 text-orange-800 border-orange-200', 
        label: 'Orange Money'
      },
      'WAVE': { 
        className: 'bg-purple-100 text-purple-800 border-purple-200', 
        label: 'Wave'
      }
    };

    const { className, label } = config[type] || config['VIREMENT'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${className} flex items-center gap-1`}>
        {getTypeIcon(type)}
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

  // Calculs des statistiques
  const totalMontant = filteredPaiements.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
  const paiementsParType = filteredPaiements.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header avec statistiques */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Gestion des Paiements</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{filteredPaiements.length} paiement{filteredPaiements.length > 1 ? 's' : ''}</span>
              <span className="font-medium text-green-600">
                Total: {totalMontant.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(paiementsParType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border text-xs">
                {getTypeIcon(type)}
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          />
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          >
            <option value="">Tous les types</option>
            <option value="ESPECES">Espèces</option>
            <option value="VIREMENT">Virement</option>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="WAVE">Wave</option>
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

          <input
            type="number"
            placeholder="Montant min"
            value={filters.montantMin}
            onChange={(e) => setFilters({ ...filters, montantMin: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          />

          <input
            type="number"
            placeholder="Montant max"
            value={filters.montantMax}
            onChange={(e) => setFilters({ ...filters, montantMax: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          />
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
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('montant')}
              >
                <div className="flex items-center gap-1">
                  Montant
                  {sortBy === 'montant' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {sortBy === 'type' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('datePaiement')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortBy === 'datePaiement' && (
                    <span className="text-sky-500">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPaiements.map((paiement, index) => (
              <motion.tr
                key={paiement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{paiement.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {paiement.payslip?.employe?.nomComplet?.charAt(0) || 'E'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {paiement.payslip?.employe?.nomComplet || 'Employé inconnu'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Bulletin #{paiement.payslipId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {(parseFloat(paiement.montant) || 0).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(paiement.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(paiement.datePaiement).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={paiement.notes}>
                    {paiement.notes || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(paiement)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(paiement)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors"
                      title="Télécharger reçu"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(paiement)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(paiement.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredPaiements.length)} sur {filteredPaiements.length} résultats
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
      {!loading && filteredPaiements.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
          <p className="text-gray-500">
            {filters.search || filters.type || filters.dateDebut || filters.dateFin
              ? 'Aucun paiement ne correspond à vos critères de recherche.'
              : 'Aucun paiement n\'a été enregistré pour le moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TablePaiements;