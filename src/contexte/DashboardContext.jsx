import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  getKPIs, 
  getCharts, 
  getEntreprises, 
  getUsers, 
  getEmployes, 
  getPayRuns,
  getPayslips,
  getPaiements
} from '../config/api.js';
import { useAuth } from './useAuth';

const DashboardContext = createContext();

const initialState = {
  kpis: null,
  charts: {
    salaryDistribution: [],
    employeesByPoste: [],
    paymentsByMonth: [],
    paymentsByType: [],
  },
  entreprises: [],
  users: [],
  employes: [],
  payRuns: [],
  payslips: [],
  paiements: [],
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
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_KPIS':
      return { ...state, kpis: action.payload };
    case 'SET_CHARTS':
      return { ...state, charts: { ...state.charts, ...action.payload } };
    case 'SET_ENTREPRISES':
      return { ...state, entreprises: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_EMPLOYES':
      return { ...state, employes: action.payload };
    case 'SET_PAYRUNS':
      return { ...state, payRuns: action.payload };
    case 'SET_PAYSLIPS':
      return { ...state, payslips: action.payload };
    case 'SET_PAIEMENTS':
      return { ...state, paiements: action.payload };
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
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user, token } = useAuth();

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

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
          payRunsApprouve: 0,
          payRunsCloture: 0,
          paiementsEnAttente: 0,
          paiementsPartiel: 0,
          paiementsPaye: 0
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

      const [salaryDistribution, employeesByPoste, paymentsByMonth, paymentsByType] = await Promise.all([
        getCharts('salary-distribution', token, params),
        getCharts('employees-by-poste', token, params),
        getCharts('payments-by-month', token, params),
        getCharts('payments-by-type', token, params)
      ]);
      
      dispatch({ 
        type: 'SET_CHARTS', 
        payload: {
          salaryDistribution: salaryDistribution || [],
          employeesByPoste: employeesByPoste || [],
          paymentsByMonth: paymentsByMonth || [],
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
      dispatch({ type: 'SET_ENTREPRISES', payload: Array.isArray(data) ? data : data.entreprises || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const fetchUsers = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const data = await getUsers(token, params);
      dispatch({ type: 'SET_USERS', payload: Array.isArray(data) ? data : data.users || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const fetchEmployes = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const queryParams = new URLSearchParams({ 
        ...Object.fromEntries(new URLSearchParams(params)), 
        ...(entrepriseId && { entrepriseId }) 
      }).toString();
      const data = await getEmployes(token, queryParams ? `?${queryParams}` : '');
      dispatch({ type: 'SET_EMPLOYES', payload: Array.isArray(data) ? data : data.employes || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token, user]);

  const fetchPayRuns = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const entrepriseId = user?.role !== 'SUPER_ADMIN' ? user.entrepriseId : null;
      const queryParams = new URLSearchParams({ 
        ...Object.fromEntries(new URLSearchParams(params)), 
        ...(entrepriseId && { entrepriseId }) 
      }).toString();
      const data = await getPayRuns(token, queryParams ? `?${queryParams}` : '');
      dispatch({ type: 'SET_PAYRUNS', payload: Array.isArray(data) ? data : data.payRuns || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des PayRuns:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token, user]);

  const fetchPayslips = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const data = await getPayslips(token, params);
      dispatch({ type: 'SET_PAYSLIPS', payload: Array.isArray(data) ? data : data.payslips || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des bulletins:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const fetchPaiements = useCallback(async (params = '') => {
    if (!token) return;
    try {
      const data = await getPaiements(token, params);
      dispatch({ type: 'SET_PAIEMENTS', payload: Array.isArray(data) ? data : data.paiements || [] });
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [token]);

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const promises = [
        fetchKPIs(),
        fetchCharts(),
      ];

      // Ajouter les données spécifiques selon le rôle
      if (user?.role === 'SUPER_ADMIN') {
        promises.push(
          fetchEntreprises(),
          fetchUsers(),
          fetchEmployes(),
          fetchPayRuns(),
          fetchPayslips(),
          fetchPaiements()
        );
      } else if (user?.role === 'ADMIN') {
        promises.push(
          fetchEmployes(),
          fetchPayRuns(),
          fetchPayslips(),
          fetchPaiements()
        );
      } else if (user?.role === 'CAISSIER') {
        promises.push(
          fetchPaiements()
        );
      }

      await Promise.allSettled(promises);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Erreur générale lors du chargement:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement des données' });
    }
  }, [token, user, fetchKPIs, fetchCharts, fetchEntreprises, fetchUsers, fetchEmployes, fetchPayRuns, fetchPayslips, fetchPaiements]);

  const openModal = useCallback((type, entityType, data = null) => {
    dispatch({ type: 'OPEN_MODAL', payload: { type, entityType, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const value = {
    ...state,
    fetchKPIs,
    fetchCharts,
    fetchEntreprises,
    fetchUsers,
    fetchEmployes,
    fetchPayRuns,
    fetchPayslips,
    fetchPaiements,
    loadDashboardData,
    openModal,
    closeModal,
    refreshData,
    clearError,
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