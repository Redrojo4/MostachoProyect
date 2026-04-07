export enum Role {
  WAITER = 'Mesero',
  KITCHEN = 'Cocina',
  MANAGER = 'Gerente',
}

export enum TableStatus {
  FREE = 'Libre',
  OCCUPIED = 'Ocupada',
}

export enum OrderStatus {
  NEW = 'Nuevo',
  IN_PROGRESS = 'En preparacion',
  READY = 'Listo',
  SERVED = 'Servido',
  CANCELED = 'Cancelado',
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  CARD = 'Tarjeta',
  TRANSFER = 'Transferencia',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  restaurantId: string;
  status: 'active' | 'inactive';
}

export interface Table {
  id: string;
  name: string;
  shape: 'normal' | 'circular';
  status: TableStatus;
  restaurantId: string;
  orderId?: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  restaurantId: string;
  isPromotion?: boolean;
  promotionType?: '2x1';
  promotionOptions?: string[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  name: string;
  status: 'pending' | 'sent' | 'canceled';
  note?: string;
  promotionSelections?: {
    menuItemId: string;
    name: string;
  }[];
}

export interface Order {
  id: string;
  tableId: string;
  waiterId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  restaurantId: string;
}

export interface SubBill {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod | null;
  paid: boolean;
}

export interface Sale {
  id: string;
  orderId: string;
  tableId: string;
  totalAmount: number;
  paymentMethods: { method: PaymentMethod; amount: number }[];
  closedAt: Date;
  restaurantId: string;
}

export interface Cancellation {
  id: string;
  orderItemId: string;
  orderId: string;
  menuItemName: string;
  waiterId: string;
  waiterName: string;
  canceledAt: Date;
  restaurantId: string;
}

export interface Message {
  id: string;
  text: string;
  priority: 'Baja' | 'Media' | 'Urgente';
  status: 'Nuevo' | 'Visto' | 'Atendido';
  createdAt: Date;
  kitchenUserId: string;
  restaurantId: string;
}
