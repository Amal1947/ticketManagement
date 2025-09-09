import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, User, Headphones } from 'lucide-react';
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

interface ChatInterfaceProps {
  ticketId: string;
  onBack: () => void;
}

// Helper to decode JWT and get user info
function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return { id: '', name: 'You' };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // id should be the MongoDB ObjectId string
    return { id: payload.id || '', name: payload.name || 'You' };
  } catch {
    return { id: '', name: 'You' };
  }
}

export default function ChatInterface({ ticketId, onBack }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<string>('assigned');
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

    // Join ticket room
    console.log('Socket connected:', socket.id);
    socket.emit('joinTicket', { ticketId });
    console.log('Joining ticket room:', ticketId);

    // Listen for incoming messages
    socket.on('chatMessage', (msg: ChatMessage) => {
      console.log('Received chatMessage:', msg);
      setMessages((prev) => [...prev, msg]);
    });
    // Optionally fetch existing messages from backend
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
        setAgentName(data.agentName || null);
        setTicketStatus(data.ticketStatus || 'assigned');
      }
    };
    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socketRef.current) {
      const user = getUserFromToken();
      if (!user.id || user.id.length !== 24) {
        alert('Invalid user id. Please log in again.');
        return;
      }
      const msgObj: ChatMessage = {
        ticketId,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'customer',
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('chatMessage', msgObj);
      setMessage(''); // Only clear input, do not add message locally
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
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
                <h2 className="font-semibold text-gray-900">Ticket #{ticketId}</h2>
                <p className="text-sm text-gray-600">Status: {ticketStatus.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ticketStatus === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {ticketStatus.toUpperCase()}
              </span>
              {agentName && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Headphones size={14} />
                  <span>{agentName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${msg.senderRole === 'customer' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-end space-x-2 ${msg.senderRole === 'customer' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.senderRole === 'customer' 
                      ? 'bg-blue-500' 
                      : 'bg-emerald-500'
                  }`}>
                    {msg.senderRole === 'customer' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Headphones size={16} className="text-white" />
                    )}
                  </div>
                  <div className={`rounded-lg px-3 py-2 max-w-full ${
                    msg.senderRole === 'customer' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${msg.senderRole === 'customer' ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSend} className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}