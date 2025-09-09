import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { mockStats } from '../../data/mockData';
import TicketManagement from './TicketManagement';
import AgentManagement from './AgentManagement';
import { API_BASE_URL } from '../../config/api';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'agents'>('overview');
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Users }
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let url = `${API_BASE_URL}/api/tickets`;
        if (user.role === 'admin' || user.role === 'agent') {
          url = `${API_BASE_URL}/api/tickets?all=true`;
        }
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        // handle error
      }
    };
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        // handle error
      }
    };
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/agents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : []);
      } catch (err) {
        // handle error
      }
    };
    fetchTickets();
    fetchUsers();
    fetchAgents();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your support operations.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.total}</p>
                </div>
                <MessageSquare className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-orange-600">{mockStats.open}</p>
                </div>
                <Clock className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned</p>
                  <p className="text-2xl font-bold text-blue-600">{mockStats.assigned}</p>
                </div>
                <AlertCircle className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{mockStats.resolved}</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{mockStats.highPriority}</p>
                </div>
                <AlertCircle className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Customers, Active Tickets, and Available Agents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customers List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Customers</h2>
              <ul className="divide-y divide-gray-200">
                {users.filter(u => u.role === 'customer').map((customer) => (
                  <li key={customer._id || customer.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{customer.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{customer.email}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Customer</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Active Tickets List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Tickets</h2>
              <ul className="divide-y divide-gray-200">
                {tickets.filter(t => t.status === 'open' || t.status === 'assigned').map((ticket) => (
                  <li key={ticket._id || ticket.id} className="py-3 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{ticket.subject}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>{String(ticket.status).toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-gray-500">{ticket.customerName || ticket.customer} • {ticket.category}</div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Available Agents List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Agents</h2>
              <ul className="divide-y divide-gray-200">
                {agents.filter(a => a.status === 'available').map((agent) => (
                  <li key={agent._id || agent.id} className="py-3 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{agent.name}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Available</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent High Priority Tickets</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {tickets
                ?.map((ticket) => (
                  <div key={ticket._id || ticket.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                        <p className="text-sm text-gray-600">{ticket.customerName || ticket.customer} • {ticket.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-orange-100 text-orange-800' : ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {String(ticket.status).toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Tickets</h2>
          <ul className="divide-y divide-gray-200">
            {tickets.length === 0 ? (
              <li className="py-6 text-center text-gray-500">No tickets found.</li>
            ) : (
              tickets.map((ticket) => (
                <li key={ticket._id || ticket.id} className="py-3 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{ticket.subject}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-orange-100 text-orange-800' : ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{String(ticket.status).toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-500">{ticket.customerName || ticket.customer} • {ticket.category}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {activeTab === 'agents' && <AgentManagement />}
    </div>
  );
}