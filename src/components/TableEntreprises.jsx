import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus } from 'lucide-react';
import { getEntreprises } from '../config/api.js';
import { useAuth } from '../contexte/useAuth';

const TableEntreprises = ({ onCreate, onEdit, onDelete }) => {
  const { token } = useAuth();
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        setLoading(true);
        const params = `page=${page}&limit=${limit}`;
        const data = await getEntreprises(token, params);
        setEntreprises(data.entreprises || data); // Assume API returns {entreprises: [], total: N}
        setTotal(data.total || data.length);
      } catch (error) {
        console.error('Erreur fetch entreprises:', error);
        // toast.error(error.message); // Integrate toast in parent
      } finally {
        setLoading(false);
      }
    };

    fetchEntreprises();
  }, [token, page, limit]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => Math.ceil(total / limit) > page && setPage(page + 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Entreprises</h3>
          <button
            onClick={onCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admins/Caissiers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entreprises.map((entreprise) => (
              <motion.tr
                key={entreprise.id}
                whileHover={{ backgroundColor: '#f8fafc' }}
                transition={{ duration: 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entreprise.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entreprise.devise}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entreprise.periodeType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={entreprise.logo || '/placeholder-logo.svg'} alt={entreprise.nom} className="h-8 w-8 rounded object-cover" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entreprise.nombreAdmins || 0} / {entreprise.nombreCaissiers || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(entreprise)}
                    className="text-sky-600 hover:text-sky-900 p-1 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entreprise.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} entreprises
        </div>
        <div className="space-x-2">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            onClick={handleNext}
            disabled={page === Math.ceil(total / limit)}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableEntreprises;
