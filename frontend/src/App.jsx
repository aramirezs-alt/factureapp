import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';


import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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
import AssessorDashboard from './pages/AssessorDashboard';
import AssessorClientView from './pages/AssessorClientView';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  // Si és assessor i intenta anar a rutes d'usuari, el tornem a /assessor

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si és assessor i intenta anar a rutes d'usuari, el tornem a /assessor
    if (user.rol === 'ASSESSOR') return <Navigate to="/assessor" />;
    // En qualsevol altre cas de desautorització, al dashboard principal
    return <Navigate to="/" />;
  }
  
  return children;
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Dashboard /></ProtectedRoute>} />
            
            <Route path="/invoices" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewInvoice /></ProtectedRoute>} />
            <Route path="/invoices/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><InvoiceDetail /></ProtectedRoute>} />
            <Route path="/invoices/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditInvoice /></ProtectedRoute>} />
            
            <Route path="/clients" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Clients /></ProtectedRoute>} />
            <Route path="/clients/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewClient /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><ClientDetail /></ProtectedRoute>} />
            <Route path="/clients/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditClient /></ProtectedRoute>} />
            
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
            <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/expenses/new" element={<ProtectedRoute><NewExpense /></ProtectedRoute>} />
            <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
            <Route path="/expenses/:id/edit" element={<ProtectedRoute><EditExpense /></ProtectedRoute>} />
            
            <Route path="/providers" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><Providers /></ProtectedRoute>} />
            <Route path="/providers/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><NewProvider /></ProtectedRoute>} />
            <Route path="/providers/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><ProviderDetail /></ProtectedRoute>} />
            <Route path="/providers/:id/edit" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><EditProvider /></ProtectedRoute>} />
            
            <Route path="/tax-report" element={<ProtectedRoute><TaxReport /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/advisors" element={<ProtectedRoute><AdvisorAccess /></ProtectedRoute>} />
            <Route path="/assessor" element={<ProtectedRoute allowedRoles={['ASSESSOR']}><AssessorDashboard /></ProtectedRoute>} />
            <Route path="/assessor/client/:clientId" element={<ProtectedRoute allowedRoles={['ASSESSOR']}><AssessorClientView /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
