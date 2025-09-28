export const API_URL = "http://localhost:7000";

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  dashboard: {
    kpis: '/dashboard/kpis',
    charts: '/dashboard/charts/:type',
  },
  entreprises: {
    list: '/entreprises',
    get: '/entreprises/:id',
    create: '/entreprises',
    update: '/entreprises/:id',
    delete: '/entreprises/:id',
  },
  users: {
    list: '/users',
    create: '/users',
    update: '/users/:id',
    delete: '/users/:id',
  },
  employes: {
    list: '/employes',
    get: '/employes/:id',
    create: '/employes',
    update: '/employes/:id',
    delete: '/employes/:id',
    activate: '/employes/:id/activer',
    deactivate: '/employes/:id/desactiver',
  },
  payruns: {
    list: '/payruns',
    get: '/payruns/:id',
    create: '/payruns',
    update: '/payruns/:id',
    delete: '/payruns/:id',
    approve: '/payruns/:id/approve',
    close: '/payruns/:id/close',
  },
  payslips: {
    list: '/payslips',
    get: '/payslips/:id',
    create: '/payslips',
    update: '/payslips/:id',
    delete: '/payslips/:id',
  },
  paiements: {
    list: '/paiements',
    get: '/paiements/:id',
    create: '/paiements',
    update: '/paiements/:id',
    delete: '/paiements/:id',
    generatePdf: '/paiements/:id/generate-pdf',
  },
};

// Fonction utilitaire pour les requêtes API
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Authentification
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    if (!data.data || (!data.data.accessToken && !data.data.refreshToken)) {
      throw new Error('Format de réponse invalide du serveur');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

export const logoutUser = async (token) => {
  return apiRequest('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Dashboard
export const getKPIs = async (token, entrepriseId = null) => {
  const params = entrepriseId ? `?entrepriseId=${entrepriseId}` : '';
  return apiRequest(`/dashboard/kpis${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getCharts = async (type, token, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/dashboard/charts/${type}${query ? `?${query}` : ''}`;
    
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors du chargement des graphiques');
    }

    const rawData = await response.json();
    const data = rawData.data || rawData;

    // Formatage des données selon le type
    if (data && typeof data === 'object') {
      if (data.labels && data.data) {
        // Format {labels: [...], data: [...]}
        return data.labels.map((label, i) => ({
          name: label,
          value: parseFloat(data.data[i]) || 0
        }));
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        // Format {key: value}
        return Object.entries(data).map(([key, value]) => ({
          name: key,
          value: parseFloat(value) || 0
        }));
      } else if (Array.isArray(data)) {
        // Format déjà correct
        return data.map(item => ({
          name: item.name || item.label || 'Inconnu',
          value: parseFloat(item.value || item.count || 0)
        }));
      }
    }

    // Données par défaut si format invalide
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données du graphique ${type}:`, error);
    return [];
  }
};

// Entreprises
export const getEntreprises = async (token, params = '') => {
  return apiRequest(`/entreprises${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createEntreprise = async (data, token) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return apiRequest('/entreprises', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
};

export const updateEntreprise = async (id, data, token) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return apiRequest(`/entreprises/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
};

export const deleteEntreprise = async (id, token) => {
  return apiRequest(`/entreprises/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Users
export const getUsers = async (token, params = '') => {
  return apiRequest(`/users${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createUser = async (data, token) => {
  return apiRequest('/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const updateUser = async (id, data, token) => {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id, token) => {
  return apiRequest(`/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Employés
export const getEmployes = async (token, params = '') => {
  return apiRequest(`/employes${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createEmploye = async (data, token) => {
  return apiRequest('/employes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const updateEmploye = async (id, data, token) => {
  return apiRequest(`/employes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const deleteEmploye = async (id, token) => {
  return apiRequest(`/employes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const activerEmploye = async (id, token) => {
  return apiRequest(`/employes/${id}/activer`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const desactiverEmploye = async (id, token) => {
  return apiRequest(`/employes/${id}/desactiver`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// PayRuns
export const getPayRuns = async (token, params = '') => {
  return apiRequest(`/payruns${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createPayRun = async (data, token) => {
  return apiRequest('/payruns', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const updatePayRun = async (id, data, token) => {
  return apiRequest(`/payruns/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const deletePayRun = async (id, token) => {
  return apiRequest(`/payruns/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const approvePayRun = async (id, token) => {
  return apiRequest(`/payruns/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const closePayRun = async (id, token) => {
  return apiRequest(`/payruns/${id}/close`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Payslips
export const getPayslips = async (token, params = '') => {
  return apiRequest(`/payslips${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createPayslip = async (data, token) => {
  return apiRequest('/payslips', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const updatePayslip = async (id, data, token) => {
  return apiRequest(`/payslips/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const deletePayslip = async (id, token) => {
  return apiRequest(`/payslips/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Paiements
export const getPaiements = async (token, params = '') => {
  return apiRequest(`/paiements${params ? `?${params}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const createPaiement = async (data, token) => {
  return apiRequest('/paiements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const updatePaiement = async (id, data, token) => {
  return apiRequest(`/paiements/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const deletePaiement = async (id, token) => {
  return apiRequest(`/paiements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const generatePaiementPdf = async (id, token) => {
  const response = await fetch(`${API_URL}/paiements/${id}/generate-pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du PDF');
  }

  return response.blob();
};