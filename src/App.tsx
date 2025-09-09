import React, { useState } from 'react';
import { mockUsers } from './data/mockData';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AgentDashboard from './components/agent/AgentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (role: string) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleRoleChange = (role: string) => {
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser} 
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
      />
      {renderDashboard()}
    </div>
  );
}

export default App;