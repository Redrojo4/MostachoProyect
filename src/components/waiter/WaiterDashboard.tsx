import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiterAppContext } from '../../context/WaiterAppContext';
import api from '../../services/api';
import { Table, TableStatus } from '../../types';
import { LogoutIcon, TableIcon } from '../icons';

  const TableCard: React.FC<{ table: Table; onSelect: (tableId: string) => void }> = ({ table, onSelect }) => {
  const isOccupied = table.status === TableStatus.OCCUPIED;
  const baseClasses = 'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-105';
  const statusClasses = isOccupied ? 'border-amber-700 bg-amber-500 hover:bg-amber-600' : 'border-emerald-700 bg-emerald-500 hover:bg-emerald-600';
  const shapeClasses = table.shape === 'circular' ? 'h-32 w-32 rounded-full' : 'rounded-xl';
  const navigate = useNavigate();

  return (
    <div onClick={() => onSelect(table.id)} className={`${baseClasses} ${statusClasses} ${shapeClasses}`}>
      <TableIcon className="h-10 w-10 text-white" />
      <span className="mt-2 text-2xl font-bold text-white">{table.name}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-white">{table.status}</span>
    </div>
  );
};

const WaiterDashboard: React.FC = () => {
  const { currentUser, tables, fetchData, logout, isLoading, error } = useWaiterAppContext();
  const navigate = useNavigate();

  const handleTableSelect = async (tableId: string) => {
    const selectedTable = tables.find((table) => table.id === tableId);
    if (!selectedTable) {
      return;
    }

    if (selectedTable.status === TableStatus.FREE) {
      try {
        await api.openTable(tableId, currentUser.id, currentUser.restaurantId);
        await fetchData();
        navigate(`/table/${tableId}`);
      } catch (err) {
        console.error('Error opening table:', err);
        alert('No se pudo abrir la mesa.');
      }
      return;
    }

    navigate(`/table/${tableId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Cargando Mesas...</div>
        <div className="mt-4 h-16 w-16 animate-spin rounded-full border-4 border-dashed border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center dark:bg-slate-900">
        <div className="rounded-lg bg-rose-100 p-8 shadow-lg dark:bg-rose-900/50">
          <h2 className="mb-4 text-2xl font-bold text-rose-800 dark:text-rose-200">Error al cargar</h2>
          <p className="mb-6 text-slate-700 dark:text-slate-300">{error}</p>
          <button onClick={fetchData} className="rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white transition-colors hover:bg-indigo-700">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-900">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Vista de Mesas</h1>
          <p className="text-slate-600 dark:text-slate-300">Bienvenido, {currentUser.name}</p>
        </div>
              <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          📊 Ventas
        </button>
        <button onClick={logout} className="flex items-center space-x-2 rounded-lg bg-rose-500 px-4 py-2 font-bold text-white transition-colors hover:bg-rose-600">
          <LogoutIcon className="h-5 w-5" />
          <span>Salir</span>
        </button>
        </div>
      </header>
      <main>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tables.length > 0 ? (
            tables.map((table) => <TableCard key={table.id} table={table} onSelect={handleTableSelect} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-500">No se encontraron mesas para este restaurante.</p>
              <p className="mt-2 text-sm text-slate-400">Verifica que tu base externa tenga datos iniciales para el modulo de mesero.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;
