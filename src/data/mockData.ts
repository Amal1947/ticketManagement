import { User, Ticket, ChatMessage, Agent, TicketStats } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: ' Customer', email: 'john@example.com', role: 'customer' },
  { id: '2', name: ' Agent', email: 'sarah@support.com', role: 'agent' },
  { id: '3', name: ' Admin', email: 'mike@admin.com', role: 'admin' },
];

export const mockTickets: Ticket[] = [
  {
    id: 'T001',
    subject: 'Login Issues',
    message: 'I cannot log into my account. Getting password error.',
    status: 'assigned',
    priority: 'high',
    customerId: '1',
    customerName: 'John Customer',
    agentId: '2',
    agentName: 'Sarah Agent',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    category: 'Technical'
  },
  {
    id: 'T002',
    subject: 'Billing Question',
    message: 'I have a question about my last invoice.',
    status: 'open',
    priority: 'medium',
    customerId: '1',
    customerName: 'John Customer',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    category: 'Billing'
  },
  {
    id: 'T003',
    subject: 'Feature Request',
    message: 'Could you add dark mode to the application?',
    status: 'resolved',
    priority: 'low',
    customerId: '1',
    customerName: 'John Customer',
    agentId: '2',
    agentName: 'Sarah Agent',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    category: 'Feature'
  }
];

export const mockAgents: Agent[] = [
  {
    id: '2',
    name: 'Sarah Agent',
    email: 'sarah@support.com',
    role: 'agent',
    status: 'available',
    activeTickets: 3,
    resolvedToday: 8
  },
  {
    id: '4',
    name: 'Tom Wilson',
    email: 'tom@support.com',
    role: 'agent',
    status: 'busy',
    activeTickets: 5,
    resolvedToday: 12
  },
  {
    id: '5',
    name: 'Lisa Chen',
    email: 'lisa@support.com',
    role: 'agent',
    status: 'offline',
    activeTickets: 0,
    resolvedToday: 6
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'M001',
    ticketId: 'T001',
    senderId: '1',
    senderName: 'John Customer',
    senderRole: 'customer',
    message: 'Hi, I need help with my login issue.',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 'M002',
    ticketId: 'T001',
    senderId: '2',
    senderName: 'Sarah Agent',
    senderRole: 'agent',
    message: 'Hello John! I\'ll be happy to help you with that. Can you tell me what error message you\'re seeing?',
    timestamp: '2024-01-15T10:32:00Z'
  },
  {
    id: 'M003',
    ticketId: 'T001',
    senderId: '1',
    senderName: 'John Customer',
    senderRole: 'customer',
    message: 'It says "Invalid credentials" but I\'m sure my password is correct.',
    timestamp: '2024-01-15T10:35:00Z'
  },
  {
    id: 'M004',
    ticketId: 'T001',
    senderId: '2',
    senderName: 'Sarah Agent',
    senderRole: 'agent',
    message: 'Let me check your account. Can you try resetting your password using the "Forgot Password" link?',
    timestamp: '2024-01-15T10:40:00Z'
  }
];

export const mockStats: TicketStats = {
  total: 156,
  open: 23,
  assigned: 45,
  resolved: 88,
  highPriority: 12
};