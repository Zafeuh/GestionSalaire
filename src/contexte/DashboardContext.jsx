import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getKPIs, getCharts, getEntreprises, getUsers, getEmployes, getPayRuns } from '../config/api.js';
import { useAuth } from './useAuth';

const DashboardContext = createContext();

const initialState = {
  kpis: null,
  charts: {
    paymentsByMonth: null,
    employeesByPoste: null,
    paymentsByType: null,
  },
  entreprises: [],
  users: [],
  employes: [],
  payRuns: [],
  loading: false,
  error: null,
  modalOpen: false,
  modalType: null,
  modalEntityType: null,
  modalData: null,
};

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_KPIS':
      return { ...state, kpis: action.payload };
    case 'SET_CHARTS':
      return { ...state, charts: action.payload };
    case 'SET_ENTREPRISES':
      return { ...state, entreprises: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_EMPLOYES':
      return { ...state, employes: action.payload };
    case 'SET_PAYRUNS':
      return { ...state, payRuns: action.payload };
    case 'OPEN_MODAL':
      return { 
        ...state, 
        modalOpen: true, 
        modalType: action.payload.type, 
        modalEntityType: action.payload.entityType, 
        modalData: action.payload.data 
      };
    case 'CLOSE_MODAL':
      return { 
        ...state, 
        modalOpen: false, 
        modalType: null, 
        modalEntityType: null, 
        modalData: null 
      };
    case 'REFRESH_DATA':
      return { ...state, loading: true, error: null };
    default:
      return state;
  }
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user, token } = useAuth();

  // Mémoisation des fonctions pour éviter les re-créations inutiles
  const fetchKPIs = useCallback(async () => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const data = await getKPIs(token, entrepriseId);
      dispatch({ 
        type: 'SET_KPIS', 
        payload: data || {
          totalEmployes: 0,
          employesActifs: 0,
          masseSalarialeTotale: 0,
          payRunsBrouillon: 0,
          payRunsApprouves: 0,
          payRunsClotures: 0,
          paiementsEnAttente: 0,
          paiementsPayes: 0
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement des indicateurs' });
    }
  }, [token, user]);

  const fetchCharts = useCallback(async () => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const dateDebut = new Date();
      dateDebut.setMonth(dateDebut.getMonth() - 6);
      const dateFin = new Date();
      const params = {
        dateDebut: dateDebut.toISOString().split('T')[0],
        dateFin: dateFin.toISOString().split('T')[0],
        ...(entrepriseId && { entrepriseId })
      };

      const [paymentsByMonth, employeesByPoste, paymentsByType] = await Promise.all([
        getCharts('payments-by-month', token, params),
        getCharts('employees-by-poste', token, params),
        getCharts('payments-by-type', token, params)
      ]);
      
      dispatch({ 
        type: 'SET_CHARTS', 
        payload: {
          paymentsByMonth: paymentsByMonth || [],
          employeesByPoste: employeesByPoste || [],
          paymentsByType: paymentsByType || []
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des graphiques:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement des graphiques' });
    }
  }, [token, user]);

  const fetchEntreprises = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const data = await getEntreprises(token, params);
      dispatch({ type: 'SET_ENTREPRISES', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const fetchUsers = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const data = await getUsers(token, params);
      dispatch({ type: 'SET_USERS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const fetchEmployes = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const queryParams = new URLSearchParams({ ...params, ...(entrepriseId && { entrepriseId }) }).toString();
      const data = await getEmployes(token, queryParams ? `?${queryParams}` : '');
      dispatch({ type: 'SET_EMPLOYES', payload: data.employes || data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token, user]);

  const fetchPayRuns = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const queryParams = new URLSearchParams({ ...params, ...(entrepriseId && { entrepriseId }) }).toString();
      const data = await getPayRuns(token, queryParams ? `?${queryParams}` : '');
      dispatch({ type: 'SET_PAYRUNS', payload: data.payRuns || data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token, user]);

  // Fonction de chargement des données avec gestion optimisée
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    
    dispatch({ type: 'REFRESH_DATA' });
    
    try {
      // Utilisation de Promise.allSettled pour une meilleure gestion d'erreur
      const results = await Promise.allSettled([
        fetchKPIs(),
        fetchCharts(),
        fetchEntreprises(),
        fetchUsers(),
        fetchEmployes(),
        fetchPayRuns(),
      ]);

      // Log des erreurs potentielles
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Erreur lors du chargement de la donnée ${index}:`, result.reason);
        }
      });

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Erreur générale lors du chargement:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement des données' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, user, fetchKPIs, fetchCharts, fetchEntreprises, fetchUsers, fetchEmployes, fetchPayRuns]);

  // Fonctions de modal mémorisées
  const openModal = useCallback((type, entityType, data = null) => {
    dispatch({ type: 'OPEN_MODAL', payload: { type, entityType, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Effet avec dépendances correctes
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, user, loadDashboardData]);

  const value = {
    ...state,
    fetchKPIs,
    fetchCharts,
    fetchEntreprises,
    fetchUsers,
    fetchEmployes,
    fetchPayRuns,
    loadDashboardData,
    openModal,
    closeModal,
    refreshData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard doit être utilisé dans un DashboardProvider');
  }
  return context;
};

export default DashboardProvider;