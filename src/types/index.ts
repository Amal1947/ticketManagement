export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  avatar?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'assigned' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'agent';
  message: string;
  timestamp: string;
}

export interface Agent extends User {
  status: 'available' | 'busy' | 'offline';
  activeTickets: number;
  resolvedToday: number;
}

export interface TicketStats {
  total: number;
  open: number;
  assigned: number;
  resolved: number;
  highPriority: number;
}