import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { Complaints } from './pages/Complaints';
import { Visitors } from './pages/Visitors';
import { Fees } from './pages/Fees';
import { Notices } from './pages/Notices';
import { Reports } from './pages/Reports';
import './styles/main.css';

const MainLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        <Navbar activeTab={activeTab} />
        
        <main className="content-area">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'rooms' && <Rooms />}
          {activeTab === 'complaints' && <Complaints />}
          {activeTab === 'visitors' && <Visitors />}
          {activeTab === 'fees' && <Fees />}
          {activeTab === 'notices' && <Notices />}
          {activeTab === 'reports' && <Reports />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
