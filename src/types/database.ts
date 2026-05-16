export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          teacher_id: string
          title: string
          description: string | null
          file_path: string
          file_url: string
          file_size: number | null
          page_count: number | null
          status: 'processing' | 'ready' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          title: string
          description?: string | null
          file_path: string
          file_url: string
          file_size?: number | null
          page_count?: number | null
          status?: 'processing' | 'ready' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          file_path?: string
          file_url?: string
          file_size?: number | null
          page_count?: number | null
          status?: 'processing' | 'ready' | 'error'
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          book_id: string
          teacher_id: string
          title: string
          description: string | null
          page_number: number | null
          order_index: number
          infographic_url: string | null
          infographic_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          teacher_id: string
          title: string
          description?: string | null
          page_number?: number | null
          order_index?: number
          infographic_url?: string | null
          infographic_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          page_number?: number | null
          order_index?: number
          infographic_url?: string | null
          infographic_path?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Book = Database['public']['Tables']['books']['Row']
export type Topic = Database['public']['Tables']['topics']['Row']
export type BookInsert = Database['public']['Tables']['books']['Insert']
export type TopicInsert = Database['public']['Tables']['topics']['Insert']
export type TopicUpdate = Database['public']['Tables']['topics']['Update']
