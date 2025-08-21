import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

//components
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import AddTransaction from './components/Transactions/AddTransaction';
import ReceiptUpload from './components/ReceiptUpload/ReceiptUpload';
import Charts from './components/Charts/Charts';
import Budgets from './components/Budgets/Budgets';

// Services
import { getCurrentUser } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(error => {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
  };

  const handleRegister = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if(loading){
    return(
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
        </div>
    );

  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} handleLogout={handleLogout} />}
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register onRegister={handleRegister} /> : <Navigate to="/dashboard" />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={user ? <Dashboard refreshTrigger={refreshTrigger} /> : <Navigate to="/login" />} />
              <Route path="/transactions" element={user ? <TransactionList/> : <Navigate to="/login" />} />
              <Route path="/add-transaction" element={<Navigate to="/add-transaction/new" replace />} />
              <Route 
                path='/add-transaction/new' 
                element={
                  user ? (
                    <AddTransaction 
                      onSuccess={triggerRefresh} 
                      key="add-new"
                    />
                  ) : (
                    <Navigate to='/login' />
                  )
                } 
              />
              <Route 
                path='/edit-transaction/:id' 
                element={
                  user ? (
                    <AddTransaction 
                      onSuccess={triggerRefresh}
                      key="edit" 
                    />
                  ) : (
                    <Navigate to='/login' />
                  )
                } 
              />
              <Route path="/upload-receipt" element={user ? <ReceiptUpload/> : <Navigate to="/login" />} />
              <Route path="/budgets" element={user ? <Budgets /> : <Navigate to="/login" />} />
              <Route path="/charts" element={user ? <Charts/> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
