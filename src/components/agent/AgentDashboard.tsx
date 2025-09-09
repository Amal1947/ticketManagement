import React, { useState, useEffect } from 'react';
import AgentLogin from './AgentLogin';
import axios from 'axios';
import AgentTicketList from './AgentTicketList';
import AgentChatInterface from './AgentChatInterface';
import { MessageSquare, Clock, CheckCircle, Users, Play, Pause, StopCircle } from 'lucide-react';
import { Ticket } from '../../types';
import { API_BASE_URL } from '../../config/api';

export default function AgentDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('agentToken'));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'available' | 'busy' | 'offline'>('available');

  useEffect(() => {
    if (token) {
      localStorage.setItem('agentToken', token);
      axios.get<{ tickets: any[] }>(API_BASE_URL+'/api/agent/tickets', { headers: { Authorization: `Bearer ${token}` } })
        .then((res: { data: { tickets: any[] } }) => {
          // Map backend ticket to frontend Ticket type
          const mappedTickets: Ticket[] = res.data.tickets.map((t: any) => ({
            id: t._id,
            subject: t.subject,
            message: t.message,
            status: t.status,
            priority: t.priority || 'low',
            customerId: t.customer?._id || '',
            customerName: t.customer?.name || '',
            agentId: t.agent?._id || '',
            agentName: t.agent?.user?.name || '',
            createdAt: t.createdAt,
            updatedAt: t.updatedAt || t.createdAt,
            category: t.category || '',
          }));
          setTickets(mappedTickets);
        })
        .catch(() => setTickets([]));
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Play size={16} className="text-white" />;
      case 'busy': return <Pause size={16} className="text-white" />;
      case 'offline': return <StopCircle size={16} className="text-white" />;
      default: return <StopCircle size={16} className="text-white" />;
    }
  };

  if (!token) {
    return <AgentLogin onLogin={setToken} />;
  }

  if (selectedTicket) {
    return (
      <AgentChatInterface 
        ticketId={selectedTicket} 
        onBack={() => setSelectedTicket(null)}
        token={token}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
            <p className="text-gray-600">Manage your assigned tickets and help customers.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <select
                value={agentStatus}
                onChange={(e) => setAgentStatus(e.target.value as 'available' | 'busy' | 'offline')}
                className="text-sm font-medium border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className={`w-12 h-12 rounded-full ${getStatusColor(agentStatus)} flex items-center justify-center`}>
              {getStatusIcon(agentStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">All Tickets</p>
              <p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status !== 'resolved').length}</p>
            </div>
            <MessageSquare className="text-blue-500" size={24} />
          </div>
        </div>
        {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div> */}
        {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Response</p>
              <p className="text-2xl font-bold text-purple-600">4m</p>
            </div>
            <Clock className="text-purple-500" size={24} />
          </div>
        </div> */}
        {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-orange-600">98%</p>
            </div>
            <Users className="text-orange-500" size={24} />
          </div>
        </div> */}
      </div>

      {/* Tickets Section */}
      <AgentTicketList tickets={tickets} onTicketSelect={setSelectedTicket} />
    </div>
  );
}