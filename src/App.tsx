import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import OrderView from './components/waiter/OrderView';
import WaiterDashboard from './components/waiter/WaiterDashboard';
import { appUser } from './config/appUser';
import { WaiterAppProvider } from './context/WaiterAppContext';

const App: React.FC = () => {
  return (
    <WaiterAppProvider currentUser={appUser}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WaiterDashboard />} />
          <Route path="/table/:tableId" element={<OrderView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WaiterAppProvider>
  );
};

export default App;
