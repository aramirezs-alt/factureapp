import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';


import Login from './pages/Login';
import Register from './pages/Register';
import Tauler from './pages/Dashboard';
import Invoices from './pages/Invoices';
import NewInvoice from './pages/NewInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import Clients from './pages/Clients';
import NewClient from './pages/NewClient';
import EditClient from './pages/EditClient';
import ClientDetail from './pages/ClientDetail';
import Products from './pages/Products';
import NewProduct from './pages/NewProduct';
import EditProduct from './pages/EditProduct';
import Expenses from './pages/Expenses';
import NewExpense from './pages/NewExpense';
import ExpenseDetail from './pages/ExpenseDetail';
import EditExpense from './pages/EditExpense';
import Providers from './pages/Providers';
import NewProvider from './pages/NewProvider';
import EditProvider from './pages/EditProvider';
import ProviderDetail from './pages/ProviderDetail';
import TaxReport from './pages/TaxReport';
import Profile from './pages/Profile';
import AdvisorAccess from './pages/AdvisorAccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AssessorTauler from './pages/AssessorDashboard';
import AssessorClientView from './pages/AssessorClientView';
import Landing from './pages/Landing';

import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'var(--bg-app)',
    color: 'var(--primary)'
  }}>
    <Loader2 className="animate-spin" size={48} />
    <p style={{ marginTop: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Carregant sessió...</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    if (user.rol === 'ASSESSOR') return <Navigate to="/assessor" />;
    return <Navigate to="/" />;
  }
  
  return children;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" /> : <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              fontSize: '14px'
            }
          }} />
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Tauler /></ProtectedRoute>} />
            
            <Route path="/invoices" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewInvoice /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/invoices/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditInvoice /></ProtectedRoute>} />
            
            <Route path="/clients" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Clients /></ProtectedRoute>} />
            <Route path="/clients/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewClient /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><ClientDetail /></ProtectedRoute>} />
            <Route path="/clients/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditClient /></ProtectedRoute>} />
            
            <Route path="/products" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Products /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewProduct /></ProtectedRoute>} />
            <Route path="/products/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditProduct /></ProtectedRoute>} />
            
            <Route path="/expenses" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewExpense /></ProtectedRoute>} />
            <Route path="/expenses/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><ExpenseDetail /></ProtectedRoute>} />
            <Route path="/expenses/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditExpense /></ProtectedRoute>} />
            
            <Route path="/providers" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Providers /></ProtectedRoute>} />
            <Route path="/providers/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewProvider /></ProtectedRoute>} />
            <Route path="/providers/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><ProviderDetail /></ProtectedRoute>} />
            <Route path="/providers/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditProvider /></ProtectedRoute>} />
            
            <Route path="/tax-report" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><TaxReport /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ASSESSOR']}><Profile /></ProtectedRoute>} />
            <Route path="/advisors" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><AdvisorAccess /></ProtectedRoute>} />
            <Route path="/assessor" element={<ProtectedRoute allowedRoles={['ASSESSOR']}><AssessorTauler /></ProtectedRoute>} />
            <Route path="/assessor/client/:clientId" element={<ProtectedRoute allowedRoles={['ASSESSOR']}><AssessorClientView /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}


export default App;
