import { Cancellation, MenuItem, Message, Order, OrderItem, OrderStatus, PaymentMethod, Sale, Table, TableStatus, User } from '../types';
import { supabase } from '../supabaseClient';
import { mapCancellationRow, mapMenuItemRow, mapMessageRow, mapOrderRow, mapPaymentMethodsToDb, mapSaleRow, mapTableRow } from './mappers';

const handleSupabaseError = (error: { message: string } | null, context: string) => {
  if (error) {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Supabase error in ${context}: ${error.message}`);
  }
};

const withRestaurantFilter = (query: any, restaurantId?: string) =>
  restaurantId ? query.eq('restaurant_id', restaurantId) : query;
const api = {
  getTables: async (restaurantId?: string): Promise<Table[]> => {
const { data, error } = await (withRestaurantFilter(supabase.from('tables').select('*').order('name'), restaurantId) as any);    handleSupabaseError(error, 'getTables');
    return (data ?? []).map(mapTableRow);
  },

  getMenuItems: async (restaurantId?: string): Promise<MenuItem[]> => {
const { data, error } = await (withRestaurantFilter(supabase.from('menu_items').select('*'), restaurantId) as any);    handleSupabaseError(error, 'getMenuItems');
    return (data ?? []).map(mapMenuItemRow);
  },

  getOrders: async (restaurantId?: string): Promise<Order[]> => {
const { data, error } = await (withRestaurantFilter(supabase.from('orders').select('*'), restaurantId) as any);    handleSupabaseError(error, 'getOrders');
    return (data ?? []).map(mapOrderRow);
  },

  getSales: async (restaurantId?: string): Promise<Sale[]> => {
const { data, error } = await (withRestaurantFilter(supabase.from('sales').select('*'), restaurantId) as any);    handleSupabaseError(error, 'getSales');
    return (data ?? []).map(mapSaleRow);
  },

  getSalesSummary: async (restaurantId: string) => {
  const today = new Date().toISOString().split('T')[0];

const { data, error } = await (supabase
  .from('sales')
  .select('*')
  .eq('restaurant_id', restaurantId)
  .gte('closed_at', today)
  .lt('closed_at', today + 'T23:59:59') as any);

  handleSupabaseError(error, 'getSalesSummary');

  let efectivo = 0;
  let tarjeta = 0;
  let transferencia = 0;

  data?.forEach((sale: any) => {
    const methods = sale.payment_methods || [];

    methods.forEach((m: any) => {
      if (m.method === 'Efectivo') efectivo += m.amount;
      if (m.method === 'Tarjeta') tarjeta += m.amount;
      if (m.method === 'Transferencia') transferencia += m.amount;
    });
  });

  return {
    efectivo,
    tarjeta,
    transferencia,
    total: efectivo + tarjeta + transferencia,
  };
},

  getCancellations: async (restaurantId?: string): Promise<Cancellation[]> => {
const { data, error } = await (withRestaurantFilter(supabase.from('cancellations').select('*'), restaurantId) as any);    handleSupabaseError(error, 'getCancellations');
    return (data ?? []).map(mapCancellationRow);
  },

  getMessages: async (restaurantId?: string): Promise<Message[]> => {
    const { data, error } = await withRestaurantFilter(supabase.from('messages').select('*'), restaurantId);
    handleSupabaseError(error, 'getMessages');
    return (data ?? []).map(mapMessageRow);
  },

  getOrderById: async (orderId: string): Promise<Order | null> => {
const { data, error } = await (supabase.from('orders').select('*').eq('id', orderId).single() as any);    handleSupabaseError(error, 'getOrderById');
    return data ? mapOrderRow(data) : null;
  },

  openTable: async (tableId: string, waiterId: string, restaurantId: string) => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ table_id: tableId, waiter_id: waiterId, restaurant_id: restaurantId, items: [] })
      .select()
      .single();
    handleSupabaseError(orderError, 'openTable:insertOrder');

    if (orderData) {
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: TableStatus.OCCUPIED, order_id: orderData.id })
        .eq('id', tableId);
      handleSupabaseError(tableError, 'openTable:updateTable');
    }

    return orderData ? mapOrderRow(orderData) : null;
  },

  updateOrder: async (orderId: string, items: OrderItem[], canceledItems: OrderItem[], waiter: User) => {
    if (canceledItems.length > 0) {
      const newCancellations = canceledItems.map((item) => ({
        order_id: orderId,
        menu_item_name: item.name,
        waiter_id: waiter.id,
        waiter_name: waiter.name,
        restaurant_id: waiter.restaurantId,
        order_item_id: item.id,
      }));

      const { error } = await supabase.from('cancellations').insert(newCancellations);
      handleSupabaseError(error, 'updateOrder:insertCancellations');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ items })
      .eq('id', orderId)
      .select()
      .single();

    handleSupabaseError(error, 'updateOrder');
    return data ? mapOrderRow(data) : null;
  },

  sendOrderToKitchen: async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: OrderStatus.NEW })
      .eq('id', orderId)
      .select()
      .single();

    handleSupabaseError(error, 'sendOrderToKitchen');
    return data ? mapOrderRow(data) : null;
  },

  closeTable: async (orderId: string, paymentDetails: { method: PaymentMethod; amount: number }[]) => {
    const order = await api.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data, error: saleError } = await supabase
      .from('sales')
      .insert({
        order_id: order.id,
        table_id: order.tableId,
        total_amount: totalAmount,
        payment_methods: mapPaymentMethodsToDb(paymentDetails),
        restaurant_id: order.restaurantId,
      })
      .select()
      .single();

    handleSupabaseError(saleError, 'closeTable:insertSale');

    const { error: tableError } = await supabase
      .from('tables')
      .update({ status: TableStatus.FREE, order_id: null })
      .eq('id', order.tableId);
    handleSupabaseError(tableError, 'closeTable:updateTable');

    const { error: orderError } = await supabase.from('orders').delete().eq('id', orderId);
    handleSupabaseError(orderError, 'closeTable:deleteOrder');

    return data ? mapSaleRow(data) : null;
  },

  cancelTable: async (orderId: string, waiter: User) => {
    const order = await api.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const itemsToCancel = order.items.filter((item) => item.status === 'sent');
    if (itemsToCancel.length > 0) {
      const newCancellations = itemsToCancel.map((item) => ({
        order_id: orderId,
        menu_item_name: item.name,
        waiter_id: waiter.id,
        waiter_name: waiter.name,
        restaurant_id: order.restaurantId,
        order_item_id: item.id,
      }));

      const { error } = await supabase.from('cancellations').insert(newCancellations);
      handleSupabaseError(error, 'cancelTable:insertCancellations');
    }

    const { error: tableError } = await supabase
      .from('tables')
      .update({ status: TableStatus.FREE, order_id: null })
      .eq('id', order.tableId);
    handleSupabaseError(tableError, 'cancelTable:updateTable');

    const { error: orderError } = await supabase.from('orders').delete().eq('id', orderId);
    handleSupabaseError(orderError, 'cancelTable:deleteOrder');

    return { success: true, tableId: order.tableId };
  },
};

export default api;
