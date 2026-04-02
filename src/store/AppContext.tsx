import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, Order, Product, Category, SubCategory, PaymentRecord, AppSettings, OrderStatus } from '../types';
import { loadState, saveState } from '../data/seedData';

// ============================================================
// ACTIONS
// ============================================================
type Action =
  | { type: 'ADD_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER'; id: string; updates: Partial<Order> }
  | { type: 'DELETE_ORDER'; id: string }
  | { type: 'SET_ORDER_STATUS'; id: string; status: OrderStatus }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; id: string; updates: Partial<Product> }
  | { type: 'DELETE_PRODUCT'; id: string }
  | { type: 'REORDER_PRODUCTS'; products: Product[] }
  | { type: 'ADD_CATEGORY'; category: Category }
  | { type: 'UPDATE_CATEGORY'; id: string; updates: Partial<Category> }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'ADD_SUB_CATEGORY'; sub: SubCategory }
  | { type: 'UPDATE_SUB_CATEGORY'; id: string; updates: Partial<SubCategory> }
  | { type: 'DELETE_SUB_CATEGORY'; id: string }
  | { type: 'ADD_PAYMENT'; payment: PaymentRecord }
  | { type: 'DELETE_PAYMENT'; id: string }
  | { type: 'UPDATE_SETTINGS'; updates: Partial<AppSettings> };

// ============================================================
// REDUCER
// ============================================================
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.order] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.id ? { ...o, ...action.updates, lastUpdated: new Date().toISOString() } : o
        ),
      };
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter(o => o.id !== action.id) };
    case 'SET_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.id ? { ...o, status: action.status, lastUpdated: new Date().toISOString() } : o
        ),
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.id ? { ...p, ...action.updates } : p),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.id) };
    case 'REORDER_PRODUCTS':
      return { ...state, products: action.products };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.category] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.id ? { ...c, ...action.updates } : c),
      };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.id) };
    case 'ADD_SUB_CATEGORY':
      return { ...state, subCategories: [...state.subCategories, action.sub] };
    case 'UPDATE_SUB_CATEGORY':
      return {
        ...state,
        subCategories: state.subCategories.map(s => s.id === action.id ? { ...s, ...action.updates } : s),
      };
    case 'DELETE_SUB_CATEGORY':
      return { ...state, subCategories: state.subCategories.filter(s => s.id !== action.id) };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payment] };
    case 'DELETE_PAYMENT':
      return { ...state, payments: state.payments.filter(p => p.id !== action.id) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.updates } };
    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience helpers
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addOrder = useCallback((order: Order) => dispatch({ type: 'ADD_ORDER', order }), []);
  const updateOrder = useCallback((id: string, updates: Partial<Order>) => dispatch({ type: 'UPDATE_ORDER', id, updates }), []);
  const setOrderStatus = useCallback((id: string, status: OrderStatus) => dispatch({ type: 'SET_ORDER_STATUS', id, status }), []);
  const updateSettings = useCallback((updates: Partial<AppSettings>) => dispatch({ type: 'UPDATE_SETTINGS', updates }), []);

  return (
    <AppContext.Provider value={{ state, dispatch, addOrder, updateOrder, setOrderStatus, updateSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
