import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, User, Headphones, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id?: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'agent';
  message: string;
  timestamp: string;
}

interface AgentChatInterfaceProps {
  ticketId: string;
  onBack: () => void;
  token: string;
}

// Helper to decode JWT and get agent info
function getAgentFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return { id: '', name: 'Agent' };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id || '', name: payload.name || 'Agent' };
  } catch {
    return { id: '', name: 'Agent' };
  }
}

export default function AgentChatInterface({ ticketId, onBack, token }: AgentChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ticket, setTicket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(API_BASE_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    socketRef.current = socket;
    console.log('Socket connected:', socket.id);
    // Join ticket room
    socket.emit('joinTicket', { ticketId });
    console.log('Joining ticket room:', ticketId);
    // Listen for incoming messages
    socket.on('chatMessage', (msg: ChatMessage) => {
      console.log('Received chatMessage:', msg);
      setMessages((prev) => [...prev, msg]);
    });
    // Fetch existing messages and ticket info from backend
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/chat/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    };
    const fetchTicket = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched ticket data:', data);
        setTicket(data.ticket || data);
      }
    };
    fetchMessages();
    fetchTicket();
    return () => {
      socket.disconnect();
    };
  }, [ticketId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socketRef.current) {
      const agent = getAgentFromToken();
      if (!agent.id || agent.id.length !== 24) {
        alert('Invalid agent id. Please log in again.');
        return;
      }
      const msgObj: ChatMessage = {
        ticketId,
        senderId: agent.id,
        senderName: agent.name,
        senderRole: 'agent',
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('chatMessage', msgObj);
      setMessage(''); // Only clear input, do not add message locally
    }
  };

  const handleRefresh = async () => {
    const res = await fetch(`${API_BASE_URL}/api/chat/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  const handleResolve = async () => {
    console.log("clicked this button");
    console.log("ticket._id:", ticket?._id, "ticket.id:", ticket?.id);
    const ticketIdToUse = ticket?._id || ticket?.id;
    if (!ticketIdToUse) {
      alert('No ticket ID found!');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId: ticketIdToUse }),
      });
      console.log('API response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        alert('Ticket marked as resolved!');
      } else {
        const errorText = await res.text();
        console.error('API error:', errorText);
        alert('Failed to resolve ticket.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Network error while resolving ticket.');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickResponses = [
    "Thank you for contacting support. I'll help you with this issue.",
    "I understand your concern. Let me investigate this for you.",
    "Could you please provide more details about when this started happening?",
    "I've found the solution to your issue. Here's what you need to do:",
    "Your issue has been resolved. Please let me know if you need further assistance."
  ];

  // Always show input, even if ticket is not loaded
  return (
    <div className="flex flex-col h-full">
      <button onClick={handleRefresh} className="self-end mb-2 px-3 py-1 bg-blue-500 text-white rounded">Refresh</button>
      <div className="max-w-5xl mx-auto p-6 flex-1">
        <div className="grid ">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 h-[700px] flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onBack}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="font-semibold text-gray-900">{ticket?.subject || 'Loading...'}</h2>
                      <p className="text-sm text-gray-600">Chat with {ticket?.customerName || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket?.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {(ticket?.status || '').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${msg.senderRole === 'agent' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-end space-x-2 ${msg.senderRole === 'agent' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.senderRole === 'agent' 
                            ? 'bg-emerald-500' 
                            : 'bg-blue-500'
                        }`}>
                          {msg.senderRole === 'agent' ? (
                            <Headphones size={16} className="text-white" />
                          ) : (
                            <User size={16} className="text-white" />
                          )}
                        </div>
                        <div className={`rounded-lg px-3 py-2 max-w-full ${
                          msg.senderRole === 'agent' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${msg.senderRole === 'agent' ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Responses */}
              <div className="border-t border-gray-100 p-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {quickResponses.slice(0, 3).map((response, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(response)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      {response.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Input always visible */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSend} className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Ticket Details Sidebar */}
          {/* <div className="space-y-4">
          
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Ticket Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-medium">{ticket?._id || ticket?.id || ''}</span>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-2 font-medium">{ticket?.customerName || ''}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    ticket?.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(ticket?.priority || '').toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{ticket?.category || ''}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>

       
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleResolve}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  disabled={ticket?.status === 2}
                >
                  <CheckCircle size={16} />
                  <span>Mark as Resolved</span>
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <AlertTriangle size={16} />
                  <span>Escalate</span>
                </button>
              </div>
            </div>

        
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Original Message</h3>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {ticket?.message || ''}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}