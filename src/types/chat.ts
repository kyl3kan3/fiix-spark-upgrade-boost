
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  online: boolean;
  unread: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
