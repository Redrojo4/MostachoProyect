import { Cancellation, MenuItem, Message, Order, OrderItem, OrderStatus, PaymentMethod, Sale, Table, TableStatus } from '../types';
import { Database, Json } from '../types_db';

type Tables = Database['public']['Tables'];
type TableRow = Tables['tables']['Row'];
type MenuItemRow = Tables['menu_items']['Row'];
type OrderRow = Tables['orders']['Row'];
type SaleRow = Tables['sales']['Row'];
type CancellationRow = Tables['cancellations']['Row'];
type MessageRow = Tables['messages']['Row'];

const parseOrderItems = (value: Json | null): OrderItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as unknown as OrderItem[];
};

export const mapTableRow = (row: TableRow): Table => ({
  id: row.id,
  name: row.name,
  shape: row.shape === 'circular' ? 'circular' : 'normal',
  status: row.status as TableStatus,
  restaurantId: row.restaurant_id,
  orderId: row.order_id,
});

export const mapMenuItemRow = (row: MenuItemRow): MenuItem => ({
  id: row.id,
  name: row.name,
  price: row.price,
  category: row.category,
  restaurantId: row.restaurant_id,
  isPromotion: row.is_promotion,
  promotionType: row.promotion_type === '2x1' ? '2x1' : undefined,
  promotionOptions: row.promotion_options ?? undefined,
});

export const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  tableId: row.table_id,
  waiterId: row.waiter_id,
  items: parseOrderItems(row.items),
  status: row.status as OrderStatus,
  createdAt: new Date(row.created_at),
  restaurantId: row.restaurant_id,
});

export const mapSaleRow = (row: SaleRow): Sale => ({
  id: row.id,
  orderId: row.order_id,
  tableId: row.table_id ?? '',
  totalAmount: row.total_amount,
  paymentMethods: (row.payment_methods as Sale['paymentMethods'] | null) ?? [],
  closedAt: new Date(row.closed_at),
  restaurantId: row.restaurant_id,
});

export const mapCancellationRow = (row: CancellationRow): Cancellation => ({
  id: row.id,
  orderItemId: row.order_item_id ?? '',
  orderId: row.order_id,
  menuItemName: row.menu_item_name,
  waiterId: row.waiter_id,
  waiterName: row.waiter_name,
  canceledAt: new Date(row.canceled_at),
  restaurantId: row.restaurant_id,
});

export const mapMessageRow = (row: MessageRow): Message => ({
  id: row.id,
  text: row.text,
  priority: row.priority,
  status: row.status,
  createdAt: new Date(row.created_at),
  kitchenUserId: row.kitchen_user_id ?? '',
  restaurantId: row.restaurant_id,
});

export const mapPaymentMethodsToDb = (paymentMethods: { method: PaymentMethod; amount: number }[]) =>
  paymentMethods as unknown as Json;
