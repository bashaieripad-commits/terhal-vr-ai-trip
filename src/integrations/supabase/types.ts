export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      content: {
        Row: {
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          location: string | null
          price: number | null
          title: string
          updated_at: string | null
          vr_content: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          location?: string | null
          price?: number | null
          title: string
          updated_at?: string | null
          vr_content?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          location?: string | null
          price?: number | null
          title?: string
          updated_at?: string | null
          vr_content?: string | null
        }
        Relationships: []
      }
      flights: {
        Row: {
          aircraft_type: string | null
          airline: string
          arrival_time: string
          available_seats: number
          base_price: number
          created_at: string | null
          departure_time: string
          flight_number: string
          from_city: string
          gate: string | null
          id: string
          status: string
          terminal: string | null
          to_city: string
          total_seats: number
          updated_at: string | null
        }
        Insert: {
          aircraft_type?: string | null
          airline: string
          arrival_time: string
          available_seats?: number
          base_price: number
          created_at?: string | null
          departure_time: string
          flight_number: string
          from_city: string
          gate?: string | null
          id?: string
          status?: string
          terminal?: string | null
          to_city: string
          total_seats?: number
          updated_at?: string | null
        }
        Update: {
          aircraft_type?: string | null
          airline?: string
          arrival_time?: string
          available_seats?: number
          base_price?: number
          created_at?: string | null
          departure_time?: string
          flight_number?: string
          from_city?: string
          gate?: string | null
          id?: string
          status?: string
          terminal?: string | null
          to_city?: string
          total_seats?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_broadcast: boolean | null
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_broadcast?: boolean | null
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          reservation_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          reservation_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_disabled: boolean | null
          phone: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_disabled?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_disabled?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          details: Json | null
          guests: number | null
          id: string
          item_name: string
          status: string
          total_price: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          details?: Json | null
          guests?: number | null
          id?: string
          item_name: string
          status?: string
          total_price?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          details?: Json | null
          guests?: number | null
          id?: string
          item_name?: string
          status?: string
          total_price?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          item_id: string
          item_type: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          item_id: string
          item_type: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          item_id?: string
          item_type?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          city: string | null
          created_at: string
          dedupe_bucket: number | null
          id: string
          language: string | null
          normalized_query: string | null
          query: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          dedupe_bucket?: number | null
          id?: string
          language?: string | null
          normalized_query?: string | null
          query: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          dedupe_bucket?: number | null
          id?: string
          language?: string | null
          normalized_query?: string | null
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      seats: {
        Row: {
          created_at: string | null
          flight_id: string
          id: string
          is_aisle: boolean | null
          is_available: boolean | null
          is_window: boolean | null
          price_modifier: number | null
          reservation_id: string | null
          reserved_by: string | null
          seat_class: string
          seat_column: string
          seat_number: string
          seat_row: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flight_id: string
          id?: string
          is_aisle?: boolean | null
          is_available?: boolean | null
          is_window?: boolean | null
          price_modifier?: number | null
          reservation_id?: string | null
          reserved_by?: string | null
          seat_class: string
          seat_column: string
          seat_number: string
          seat_row: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flight_id?: string
          id?: string
          is_aisle?: boolean | null
          is_available?: boolean | null
          is_window?: boolean | null
          price_modifier?: number | null
          reservation_id?: string | null
          reserved_by?: string | null
          seat_class?: string
          seat_column?: string
          seat_number?: string
          seat_row?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seats_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          log_type: string
          message: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type: string
          message: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string | null
          event_date: string
          event_name: string
          id: string
          is_resellable: boolean | null
          is_valid: boolean | null
          qr_code: string | null
          resell_price: number | null
          resell_status: string | null
          reservation_id: string | null
          ticket_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_date: string
          event_name: string
          id?: string
          is_resellable?: boolean | null
          is_valid?: boolean | null
          qr_code?: string | null
          resell_price?: number | null
          resell_status?: string | null
          reservation_id?: string | null
          ticket_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_date?: string
          event_name?: string
          id?: string
          is_resellable?: boolean | null
          is_valid?: boolean | null
          qr_code?: string | null
          resell_price?: number | null
          resell_status?: string | null
          reservation_id?: string | null
          ticket_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      seats_public: {
        Row: {
          created_at: string | null
          flight_id: string | null
          id: string | null
          is_aisle: boolean | null
          is_available: boolean | null
          is_window: boolean | null
          price_modifier: number | null
          seat_class: string | null
          seat_column: string | null
          seat_number: string | null
          seat_row: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flight_id?: string | null
          id?: string | null
          is_aisle?: boolean | null
          is_available?: boolean | null
          is_window?: boolean | null
          price_modifier?: number | null
          seat_class?: string | null
          seat_column?: string | null
          seat_number?: string | null
          seat_row?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flight_id?: string | null
          id?: string | null
          is_aisle?: boolean | null
          is_available?: boolean | null
          is_window?: boolean | null
          price_modifier?: number | null
          seat_class?: string | null
          seat_column?: string | null
          seat_number?: string | null
          seat_row?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_flight_seats: {
        Args: { p_aircraft_type?: string; p_flight_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_search_query: { Args: { q: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
