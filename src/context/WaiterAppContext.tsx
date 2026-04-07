import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../supabaseClient';
import { Cancellation, MenuItem, Message, Order, Sale, Table, User } from '../types';

interface WaiterAppContextType {
  currentUser: User;
  restaurantId: string;
  logout: () => void;
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  sales: Sale[];
  cancellations: Cancellation[];
  messages: Message[];
  fetchData: () => Promise<void>;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  error: string | null;
}

const WaiterAppContext = createContext<WaiterAppContextType | undefined>(undefined);

export const WaiterAppProvider: React.FC<{ children: ReactNode; currentUser: User }> = ({ children, currentUser }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = currentUser.restaurantId;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [fetchedTables, fetchedMenuItems, fetchedOrders, fetchedSales, fetchedCancellations, fetchedMessages] = await Promise.all([
        api.getTables(restaurantId),
        api.getMenuItems(restaurantId),
        api.getOrders(restaurantId),
        api.getSales(restaurantId),
        api.getCancellations(restaurantId),
        api.getMessages(restaurantId),
      ]);

      setTables(fetchedTables);
      setMenuItems(fetchedMenuItems);
      setOrders(fetchedOrders);
      setSales(fetchedSales);
      setCancellations(fetchedCancellations);
      setMessages(fetchedMessages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Unexpected error during waiter data fetch:', err);
      setError(`No se pudieron cargar los datos: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();

    const channel = supabase
      .channel(`waiter-db-changes-${restaurantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const value: WaiterAppContextType = {
    currentUser,
    restaurantId,
    logout: () => window.location.reload(),
    tables,
    menuItems,
    orders,
    sales,
    cancellations,
    messages,
    fetchData,
    setTables,
    setOrders,
    setMessages,
    isLoading,
    error,
  };

  return <WaiterAppContext.Provider value={value}>{children}</WaiterAppContext.Provider>;
};

export const useWaiterAppContext = () => {
  const context = useContext(WaiterAppContext);
  if (!context) {
    throw new Error('useWaiterAppContext must be used within a WaiterAppProvider');
  }
  return context;
};
