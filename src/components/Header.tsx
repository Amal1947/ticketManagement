import React from 'react';
import { User, LogOut, Bell } from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  onRoleChange: (role: string) => void;
  onLogout: () => void;
}

export default function Header({ currentUser, onRoleChange, onLogout }: HeaderProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'agent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">SupportHub</h1>
        {/* <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View as:</span>
          <select 
            value={currentUser?.role || 'customer'}
            onChange={(e) => onRoleChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div> */}
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(currentUser?.role)}`}>
              {currentUser?.role?.toUpperCase()}
            </span>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}