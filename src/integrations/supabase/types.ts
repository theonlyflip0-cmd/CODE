// Hand-written database types mirroring supabase/migrations/0001_init.sql.
// Regenerate from your project with:
//   npx supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = "new" | "accepted" | "ready" | "delivered";
export type OrderType = "delivery" | "pickup";

/** Shape of each entry stored in `orders.items` (jsonb). */
export interface OrderItemJson {
  id: string;
  slug: string;
  name: string;
  qty: number;
  price: number; // unit price incl. options
  options: Json;
}

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string;
          slug: string;
          name_nl: string;
          name_en: string;
          description_nl: string | null;
          description_en: string | null;
          price: number;
          category: string;
          sort_order: number;
          is_popular: boolean;
          available: boolean;
          calories: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_nl: string;
          name_en: string;
          description_nl?: string | null;
          description_en?: string | null;
          price: number;
          category: string;
          sort_order?: number;
          is_popular?: boolean;
          available?: boolean;
          calories?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: { id: number; ordering_closed: boolean; updated_at: string };
        Insert: { id?: number; ordering_closed?: boolean; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          postcode: string | null;
          order_type: OrderType;
          items: OrderItemJson[];
          subtotal: number;
          delivery_fee: number;
          tip: number;
          discount: number;
          total: number;
          status: OrderStatus;
          ready_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          customer_name: string;
          customer_phone: string;
          customer_address?: string | null;
          postcode?: string | null;
          order_type: OrderType;
          items: OrderItemJson[];
          subtotal: number;
          delivery_fee: number;
          tip: number;
          discount: number;
          total: number;
          status?: OrderStatus;
          ready_minutes?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; email: string | null; is_admin: boolean; created_at: string };
        Insert: { id: string; email?: string | null; is_admin?: boolean; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      claim_admin_if_first: { Args: Record<PropertyKey, never>; Returns: undefined };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      order_status: OrderStatus;
      order_type: OrderType;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
