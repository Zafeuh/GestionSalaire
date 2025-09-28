export const API_URL ="http://localhost:7000/api";

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
};

export const loginUser = async (email, password) => {
  try {
    console.log('Envoi de la requête à:', `${API_URL}${ENDPOINTS.auth.login}`);
    const response = await fetch(`${API_URL}${ENDPOINTS.auth.login}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Réponse status:', response.status);

    if (!response.ok) {
      console.error('Erreur de connexion:', data);
      throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    if (!data.data || (!data.data.accessToken && !data.data.refreshToken)) {
      console.error('Réponse invalide du serveur:', data);
      throw new Error('Format de réponse invalide du serveur');
    }

    return data.data; // { accessToken, refreshToken }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

export const logoutUser = async (token) => {
  const response = await fetch(`${API_URL}${ENDPOINTS.auth.logout}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur de déconnexion');
  }

  const data = await response.json();
  return data;
};

// Dashboard functions
export const getKPIs = async (token, entrepriseId = null) => {
  let url = `${API_URL}/dashboard/kpis`;
  if (entrepriseId) {
    url += `?entrepriseId=${entrepriseId}`;
  }
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du chargement des KPIs');
  }

  const data = await response.json();
  return data.data;
};

export const getCharts = async (type, token, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/dashboard/charts/${type}${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors du chargement des graphiques');
    }

    const rawData = await response.json();
    console.log(`Données reçues pour ${type}:`, rawData);

    // Données par défaut selon le type
    const defaultData = {
      'payments-by-month': [
        { name: 'Jan', value: 0 },
        { name: 'Fév', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Avr', value: 0 },
        { name: 'Mai', value: 0 },
        { name: 'Jun', value: 0 }
      ],
      'employees-by-poste': [
        { name: 'Aucune donnée', value: 0 }
      ],
      'payments-by-type': [
        { name: 'Espèces', value: 0 },
        { name: 'Virement', value: 0 },
        { name: 'Mobile Money', value: 0 }
      ]
    };

    // Si pas de données ou format invalide, retourner les données par défaut
    if (!rawData || !rawData.data || typeof rawData.data !== 'object') {
      console.warn(`Données invalides reçues pour ${type}, utilisation des données par défaut`);
      return defaultData[type] || [];
    }

    // Formatage des données selon le type de graphique
    try {
      // Assume API returns {labels: [...], data: [...]} or {data: {key: value}}
      if (rawData.labels && rawData.data) {
        // Array format
        return rawData.labels.map((label, i) => ({
          name: label,
          value: parseFloat(rawData.data[i]) || 0
        }));
      } else if (rawData.data && typeof rawData.data === 'object') {
        // Object format
        return Object.entries(rawData.data).map(([key, value]) => ({
          name: key,
          value: parseFloat(value) || 0
        }));
      }

      // Si le type n'est pas reconnu, retourner les données brutes ou un tableau vide
      return Array.isArray(rawData.data) ? rawData.data.map((item, i) => ({
        name: item.name || `Item ${i}`,
        value: parseFloat(item.value) || 0
      })) : [];
    } catch (error) {
      console.error(`Erreur lors du formatage des données pour ${type}:`, error);
      return defaultData[type] || [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données du graphique:', error);
    throw error;
  }
};

// Entreprises functions
export const getEntreprises = async (token, params = '') => {
  const url = `${API_URL}/entreprises${params ? `?${params}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du chargement des entreprises');
  }

  const data = await response.json();
  return data.data;
};

export const createEntreprise = async (data, token) => {
  const formData = new FormData();
  formData.append('nom', data.nom);
  formData.append('devise', data.devise);
  formData.append('adresse', data.adresse);
  if (data.logo) formData.append('logo', data.logo);
  formData.append('primaryColor', data.primaryColor);
  formData.append('secondaryColor', data.secondaryColor);
  formData.append('periodeType', data.periodeType);
  formData.append('nombreAdmins', data.nombreAdmins);
  formData.append('nombreCaissiers', data.nombreCaissiers);

  const response = await fetch(`${API_URL}/entreprises`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de l\'entreprise');
  }

  const result = await response.json();
  return result.data;
};

export const updateEntreprise = async (id, data, token) => {
  const formData = new FormData();
  if (data.nom) formData.append('nom', data.nom);
  if (data.devise) formData.append('devise', data.devise);
  if (data.adresse) formData.append('adresse', data.adresse);
  if (data.logo) formData.append('logo', data.logo);
  if (data.primaryColor) formData.append('primaryColor', data.primaryColor);
  if (data.secondaryColor) formData.append('secondaryColor', data.secondaryColor);
  if (data.periodeType) formData.append('periodeType', data.periodeType);
  if (data.nombreAdmins) formData.append('nombreAdmins', data.nombreAdmins);
  if (data.nombreCaissiers) formData.append('nombreCaissiers', data.nombreCaissiers);

  const response = await fetch(`${API_URL}/entreprises/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'entreprise');
  }

  const result = await response.json();
  return result.data;
};

export const deleteEntreprise = async (id, token) => {
  const response = await fetch(`${API_URL}/entreprises/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de l\'entreprise');
  }

  const result = await response.json();
  return result;
};

// Users functions
export const getUsers = async (token, params = '') => {
  const url = `${API_URL}/users${params ? `?${params}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du chargement des utilisateurs');
  }

  const data = await response.json();
  return data.data;
};

export const createUser = async (data, token) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email: data.email, password: data.password, role: data.role, entrepriseId: data.entrepriseId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
  }

  const result = await response.json();
  return result.data;
};

export const updateUser = async (id, data, token) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
  }

  const result = await response.json();
  return result.data;
};

export const deleteUser = async (id, token) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
  }

  const result = await response.json();
  return result;
};

// Employés functions
export const getEmployes = async (token, params = '') => {
  const url = `${API_URL}/employes${params ? `?${params}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du chargement des employés');
  }

  const data = await response.json();
  return data.data;
};

export const createEmploye = async (data, token) => {
  const response = await fetch(`${API_URL}/employes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de l\'employé');
  }

  const result = await response.json();
  return result.data;
};

export const updateEmploye = async (id, data, token) => {
  const response = await fetch(`${API_URL}/employes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'employé');
  }

  const result = await response.json();
  return result.data;
};

export const deleteEmploye = async (id, token) => {
  const response = await fetch(`${API_URL}/employes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de l\'employé');
  }

  const result = await response.json();
  return result;
};

export const activerEmploye = async (id, token) => {
  const response = await fetch(`${API_URL}/employes/${id}/activate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'activation de l\'employé');
  }

  const result = await response.json();
  return result;
};

export const desactiverEmploye = async (id, token) => {
  const response = await fetch(`${API_URL}/employes/${id}/deactivate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la désactivation de l\'employé');
  }

  const result = await response.json();
  return result;
};

// PayRuns functions
export const getPayRuns = async (token, params = '') => {
  const url = `${API_URL}/payruns${params ? `?${params}` : ''}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du chargement des payruns');
  }

  const data = await response.json();
  return data.data;
};



export const createPayRun = async (data, token) => {
  const response = await fetch(`${API_URL}/payruns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création du payrun');
  }

  const result = await response.json();
  return result.data;
};

export const updatePayRun = async (id, data, token) => {
  const response = await fetch(`${API_URL}/payruns/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du payrun');
  }

  const result = await response.json();
  return result.data;
};

export const deletePayRun = async (id, token) => {
  const response = await fetch(`${API_URL}/payruns/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression du payrun');
  }

  const result = await response.json();
  return result;
};

export const approvePayRun = async (id, token) => {
  const response = await fetch(`${API_URL}/payruns/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'approbation du payrun');
  }

  const result = await response.json();
  return result;
};

export const closePayRun = async (id, token) => {
  const response = await fetch(`${API_URL}/payruns/${id}/close`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la clôture du payrun');
  }

  const result = await response.json();
  return result;
};
