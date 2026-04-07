export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cancellations: {
        Row: {
          canceled_at: string;
          id: string;
          menu_item_name: string;
          order_id: string;
          order_item_id: string | null;
          restaurant_id: string;
          waiter_id: string;
          waiter_name: string;
        };
        Insert: {
          canceled_at?: string;
          id?: string;
          menu_item_name: string;
          order_id: string;
          order_item_id?: string | null;
          restaurant_id: string;
          waiter_id: string;
          waiter_name: string;
        };
        Update: {
          canceled_at?: string;
          id?: string;
          menu_item_name?: string;
          order_id?: string;
          order_item_id?: string | null;
          restaurant_id?: string;
          waiter_id?: string;
          waiter_name?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          category: string;
          id: string;
          is_promotion: boolean;
          name: string;
          price: number;
          promotion_options: string[] | null;
          promotion_type: string | null;
          restaurant_id: string;
        };
        Insert: {
          category: string;
          id?: string;
          is_promotion?: boolean;
          name: string;
          price: number;
          promotion_options?: string[] | null;
          promotion_type?: string | null;
          restaurant_id: string;
        };
        Update: {
          category?: string;
          id?: string;
          is_promotion?: boolean;
          name?: string;
          price?: number;
          promotion_options?: string[] | null;
          promotion_type?: string | null;
          restaurant_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          created_at: string;
          id: string;
          kitchen_user_id: string | null;
          priority: 'Baja' | 'Media' | 'Urgente';
          restaurant_id: string;
          status: 'Nuevo' | 'Visto' | 'Atendido';
          text: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kitchen_user_id?: string | null;
          priority: 'Baja' | 'Media' | 'Urgente';
          restaurant_id: string;
          status?: 'Nuevo' | 'Visto' | 'Atendido';
          text: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kitchen_user_id?: string | null;
          priority?: 'Baja' | 'Media' | 'Urgente';
          restaurant_id?: string;
          status?: 'Nuevo' | 'Visto' | 'Atendido';
          text?: string;
        };
        Relationships: [];
      };
      orders: {
  Row: {
    created_at: string | null;
    id: string;
    items: any;
    restaurant_id: string;
    status: 'Nuevo' | 'En preparacion' | 'Listo' | 'Servido' | 'Cancelado';
    table_id: string;
    waiter_id: string;
  };
  Insert: {
    created_at?: string | null;
    id?: string;
    items?: any;
    restaurant_id: string;
    status?: 'Nuevo' | 'En preparacion' | 'Listo' | 'Servido' | 'Cancelado';
    table_id: string;
    waiter_id: string;
  };
  Update: {
    created_at?: string | null;
    id?: string;
    items?: any;
    restaurant_id?: string;
    status?: 'Nuevo' | 'En preparacion' | 'Listo' | 'Servido' | 'Cancelado';
    table_id?: string;
    waiter_id?: string;
  };
  Relationships: [];
};
      sales: {
  Row: {
    closed_at: string | null;
    id: string;
    order_id: string;
    payment_methods: any;
    restaurant_id: string;
    table_id: string | null;
    total_amount: number;
  };
  Insert: {
    closed_at?: string | null;
    id?: string;
    order_id: string;
    payment_methods?: any;
    restaurant_id: string;
    table_id?: string | null;
    total_amount: number;
  };
  Update: {
    closed_at?: string | null;
    id?: string;
    order_id?: string;
    payment_methods?: any;
    restaurant_id?: string;
    table_id?: string | null;
    total_amount?: number;
  };
  Relationships: [];
};
      tables: {
        Row: {
          id: string;
          name: string;
          order_id: string | null;
          restaurant_id: string;
          shape: string;
          status: 'Libre' | 'Ocupada';
        };
        Insert: {
          id?: string;
          name: string;
          order_id?: string | null;
          restaurant_id: string;
          shape?: string;
          status?: 'Libre' | 'Ocupada';
        };
        Update: {
          id?: string;
          name?: string;
          order_id?: string | null;
          restaurant_id?: string;
          shape?: string;
          status?: 'Libre' | 'Ocupada';
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
