
import { Database } from '@/integrations/supabase/types';

// Extract types from Supabase generated types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type WorkOrder = Database['public']['Tables']['work_orders']['Row'];
export type WorkOrderComment = Database['public']['Tables']['work_order_comments']['Row'];

// Enums from Supabase
export type WorkOrderStatus = Database['public']['Enums']['work_order_status'];
export type WorkOrderPriority = Database['public']['Enums']['work_order_priority'];

// Form submission types (for creating/updating)
export type WorkOrderFormData = Omit<WorkOrder, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
export type AssetFormData = Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
export type WorkOrderCommentFormData = {
  comment: string;
  work_order_id: string;
};

// We can extend these types with UI-specific properties as needed
export interface WorkOrderWithRelations extends WorkOrder {
  asset?: Asset | null;
  assignee?: Profile | null;
  creator?: Profile | null;
  comments?: WorkOrderComment[];
}
