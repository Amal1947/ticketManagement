import React from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Ticket } from '../../types';

interface AgentTicketListProps {
  tickets: Ticket[];
  onTicketSelect: (ticketId: string) => void;
}

export default function AgentTicketList({ tickets, onTicketSelect }: AgentTicketListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock size={16} className="text-orange-500" />;
      case 'assigned': return <AlertCircle size={16} className="text-blue-500" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeTickets = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  if (!tickets.length) {
    return <div className="text-gray-500">No tickets found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Active Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Tickets ({activeTickets.length})</h2>
        </div>

        {activeTickets.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active tickets</h3>
            <p className="text-gray-600">You're all caught up! New tickets will appear here when assigned.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className="border-b border-gray-200 last:border-b-0">
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{ticket.subject}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{typeof ticket.status === 'string' ? ticket.status.toUpperCase() : String(ticket.status).toUpperCase()}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{ticket.customerName}</span>
                        </span>
                        <span>#{ticket.id}</span>
                        <span>{ticket.category}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => onTicketSelect(ticket.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <MessageSquare size={14} />
                        <span>Respond</span>
                      </button>
                      {ticket.status === 'assigned' && (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Resolved */}
      {resolvedTickets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Resolved ({resolvedTickets.length})</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {resolvedTickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="border-b border-gray-200 last:border-b-0 p-4 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle size={12} />
                        <span className="ml-1">RESOLVED</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{ticket.customerName}</span>
                      <span>Resolved: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}