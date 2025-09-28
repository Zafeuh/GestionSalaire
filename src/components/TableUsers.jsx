import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Filter } from 'lucide-react';
import { getUsers } from '../config/api.js';
import { useAuth } from '../contexte/useAuth';

const TableUsers = ({ onCreate, onEdit, onDelete }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ role: '', entrepriseId: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let params = `page=${page}&limit=${limit}`;
        if (filters.role) params += `&role=${filters.role}`;
        if (filters.entrepriseId) params += `&entrepriseId=${filters.entrepriseId}`;
        const data = await getUsers(token, params);
        setUsers(data.users || data); // Assume API returns {users: [], total: N}
        setTotal(data.total || data.length);
      } catch (error) {
        console.error('Erreur fetch users:', error);
        // toast.error(error.message); // Integrate toast in parent
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, limit, filters]);

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => Math.ceil(total / limit) > page && setPage(page + 1);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter
  };

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
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">Tous les rôles</option>
                <option value="Admin">Admin</option>
                <option value="Caissier">Caissier</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={filters.entrepriseId}
                onChange={(e) => handleFilterChange('entrepriseId', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">Toutes les entreprises</option>
                {/* Dynamically populate with entreprises from context or prop */}
                <option value="1">Teranga Pay</option>
                <option value="2">Sen Pay</option>
                {/* Add more as fetched */}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                whileHover={{ backgroundColor: '#f8fafc' }}
                transition={{ duration: 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.entreprise?.nom || 'Non assignée'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-sky-600 hover:text-sky-900 p-1 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
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
          Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} utilisateurs
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

export default TableUsers;
