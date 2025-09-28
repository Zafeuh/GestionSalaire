import React, { useState } from 'react';
import { useDashboard } from '../contexte/DashboardContext';
import { useAuth } from '../contexte/useAuth';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createEmploye, updateEmploye, deleteEmploye, activerEmploye, desactiverEmploye } from '../config/api.js';

const TableEmployes = ({ data: propData, onRefresh, ...props }) => {
  const { employes: contextEmployes, loading, fetchEmployes } = useDashboard();
  const safeEmployes = propData || contextEmployes || [];
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ statut: '', poste: '', typeContrat: '' });
  const itemsPerPage = 10;

  const filteredEmployes = safeEmployes.filter((employe) => {
    return (
      (!filters.statut || employe.statut === filters.statut) &&
      (!filters.poste || employe.poste.toLowerCase().includes(filters.poste.toLowerCase())) &&
      (!filters.typeContrat || employe.typeContrat === filters.typeContrat)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployes = filteredEmployes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployes.length / itemsPerPage);

  const handleEdit = (employe) => {
    useDashboard().openModal('edit', 'employe', employe);
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await deleteEmploye(id, token);
        toast.success('Employé supprimé avec succès');
        fetchEmployes();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleActiver = async (id) => {
    try {
      await activerEmploye(id, token);
      toast.success('Employé activé avec succès');
      fetchEmployes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDesactiver = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet employé ?')) {
      try {
        await desactiverEmploye(id, token);
        toast.success('Employé désactivé avec succès');
        fetchEmployes();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getStatutBadge = (statut) => {
    const className = statut === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const icon = statut === 'ACTIF' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${className}`}>
        {icon}
        {statut}
      </span>
    );
  };

  if (loading) return <div className="text-center py-4">Chargement...</div>;
  if (!safeEmployes.length) return <div className="text-center py-4">Aucun employé trouvé.</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filtres */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="INACTIF">Inactif</option>
          </select>
          <input
            type="text"
            placeholder="Filtrer par poste"
            value={filters.poste}
            onChange={(e) => setFilters({ ...filters, poste: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={filters.typeContrat}
            onChange={(e) => setFilters({ ...filters, typeContrat: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Tous les types de contrat</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Contrat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salaire (FCFA)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte Bancaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEmployes.map((employe) => (
              <tr key={employe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employe.nomComplet}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employe.poste}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employe.typeContrat}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employe.tauxSalaire.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employe.compteBancaire}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatutBadge(employe.statut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(employe)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(employe.id)} className="text-red-600 hover:text-red-900 mr-4">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {employe.statut === 'INACTIF' && (
                    <button onClick={() => handleActiver(employe.id)} className="text-green-600 hover:text-green-900 mr-4">
                      Activer
                    </button>
                  )}
                  {employe.statut === 'ACTIF' && (
                    <button onClick={() => handleDesactiver(employe.id)} className="text-gray-600 hover:text-gray-900">
                      Désactiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredEmployes.length)} sur {filteredEmployes.length} résultats
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">Page {currentPage} sur {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableEmployes;
