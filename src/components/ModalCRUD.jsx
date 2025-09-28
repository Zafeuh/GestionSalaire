import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexte/useAuth';

const ModalCRUD = ({ isOpen, onClose, type, entityType, data = {}, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [entreprises, setEntreprises] = useState([]); // For user entrepriseId select

  useEffect(() => {
    if (isOpen) {
      if (type === 'update') {
        setFormData(data);
      } else {
        setFormData({
          nom: '',
          devise: '',
          adresse: '',
          logo: null,
          primaryColor: '#1DA1F2',
          secondaryColor: '#6B7280',
          periodeType: 'MENSUELLE',
          nombreAdmins: 1,
          nombreCaissiers: 1,
          email: '',
          password: '',
          role: 'Admin',
          entrepriseId: '',
        });
      }
    }
  }, [isOpen, type, data]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (entityType === 'entreprise') {
        if (type === 'create') {
          result = await createEntreprise(formData, token);
        } else {
          result = await updateEntreprise(data.id, formData, token);
        }
      } else if (entityType === 'user') {
        if (type === 'create') {
          result = await createUser(formData, token);
        } else {
          result = await updateUser(data.id, formData, token);
        }
      }
      toast.success(`${type === 'create' ? 'Créé' : 'Mis à jour'} avec succès`);
      onSuccess(result);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'create' ? 'Ajouter' : 'Modifier'} {entityType === 'entreprise' ? 'Entreprise' : 'Utilisateur'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {entityType === 'entreprise' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <input
                      type="text"
                      name="devise"
                      value={formData.devise || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <textarea
                      name="adresse"
                      value={formData.adresse || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <input
                      type="file"
                      name="logo"
                      onChange={handleChange}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Principale</label>
                      <input
                        type="color"
                        name="primaryColor"
                        value={formData.primaryColor || '#1DA1F2'}
                        onChange={handleChange}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Secondaire</label>
                      <input
                        type="color"
                        name="secondaryColor"
                        value={formData.secondaryColor || '#6B7280'}
                        onChange={handleChange}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Période</label>
                    <select
                      name="periodeType"
                      value={formData.periodeType || 'MENSUELLE'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="MENSUELLE">Mensuelle</option>
                      <option value="BI_MENSUELLE">Bi-mensuelle</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'Admins</label>
                      <input
                        type="number"
                        name="nombreAdmins"
                        value={formData.nombreAdmins || 1}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Caissiers</label>
                      <input
                        type="number"
                        name="nombreCaissiers"
                        value={formData.nombreCaissiers || 1}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  {type === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <select
                      name="role"
                      value={formData.role || 'Admin'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Caissier">Caissier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                    <select
                      name="entrepriseId"
                      value={formData.entrepriseId || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="">Sélectionner une entreprise</option>
                      {entreprises.map((ent) => (
                        <option key={ent.id} value={ent.id}>{ent.nom}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalCRUD;
